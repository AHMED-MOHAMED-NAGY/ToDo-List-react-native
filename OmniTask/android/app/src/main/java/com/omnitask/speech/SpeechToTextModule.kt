package com.omnitask.speech

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

/**
 * SpeechToTextModule - React Native Bridge for Android SpeechRecognizer
 *
 * Provides offline speech-to-text transcription without popup dialogs.
 * Emits events to JS: onSpeechResult, onSpeechPartial, onSpeechError, onSpeechEnd
 */
class SpeechToTextModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var speechRecognizer: SpeechRecognizer? = null
    private var isListening = false

    override fun getName(): String = "SpeechToTextModule"

    /**
     * Checks if speech recognition is available on this device
     */
    @ReactMethod
    fun isAvailable(promise: Promise) {
        promise.resolve(SpeechRecognizer.isRecognitionAvailable(reactApplicationContext))
    }

    /**
     * Starts listening for speech input
     * @param locale - Language code (e.g., "en-US", "ar-SA")
     * @param preferOffline - Whether to prefer offline recognition
     */
    @ReactMethod
    fun startListening(locale: String, preferOffline: Boolean, promise: Promise) {
        if (isListening) {
            promise.reject("ALREADY_LISTENING", "Speech recognizer is already active")
            return
        }

        try {
            val activity: Activity? = getCurrentActivity()
            if (activity == null) {
                promise.reject("NO_ACTIVITY", "No active activity")
                return
            }

            activity.runOnUiThread {
                try {
                    speechRecognizer?.destroy()
                    speechRecognizer = SpeechRecognizer.createSpeechRecognizer(reactApplicationContext)
                    speechRecognizer?.setRecognitionListener(createListener())

                    val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                        putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                        putExtra(RecognizerIntent.EXTRA_LANGUAGE, locale)
                        putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3)
                        putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                        if (preferOffline) {
                            putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true)
                        }
                    }

                    speechRecognizer?.startListening(intent)
                    isListening = true
                    promise.resolve(true)
                } catch (e: Exception) {
                    promise.reject("SPEECH_ERROR", e.message)
                }
            }
        } catch (e: Exception) {
            promise.reject("SPEECH_ERROR", e.message)
        }
    }

    /**
     * Stops listening for speech input
     */
    @ReactMethod
    fun stopListening(promise: Promise) {
        try {
            val activity: Activity? = getCurrentActivity()
            activity?.runOnUiThread {
                speechRecognizer?.stopListening()
                isListening = false
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SPEECH_ERROR", e.message)
        }
    }

    /**
     * Cancels and destroys the speech recognizer
     */
    @ReactMethod
    fun cancel(promise: Promise) {
        try {
            val activity: Activity? = getCurrentActivity()
            activity?.runOnUiThread {
                speechRecognizer?.cancel()
                speechRecognizer?.destroy()
                speechRecognizer = null
                isListening = false
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SPEECH_ERROR", e.message)
        }
    }

    private fun createListener(): RecognitionListener {
        return object : RecognitionListener {
            override fun onReadyForSpeech(params: Bundle?) {
                sendEvent("onSpeechStart", Arguments.createMap())
            }

            override fun onBeginningOfSpeech() {}
            override fun onRmsChanged(rmsdB: Float) {}
            override fun onBufferReceived(buffer: ByteArray?) {}

            override fun onEndOfSpeech() {
                isListening = false
                sendEvent("onSpeechEnd", Arguments.createMap())
            }

            override fun onError(error: Int) {
                isListening = false
                val errorMsg = when (error) {
                    SpeechRecognizer.ERROR_AUDIO -> "Audio recording error"
                    SpeechRecognizer.ERROR_CLIENT -> "Client error"
                    SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Insufficient permissions"
                    SpeechRecognizer.ERROR_NETWORK -> "Network error"
                    SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "Network timeout"
                    SpeechRecognizer.ERROR_NO_MATCH -> "No speech match"
                    SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "Recognizer busy"
                    SpeechRecognizer.ERROR_SERVER -> "Server error"
                    SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "No speech input"
                    else -> "Unknown error: $error"
                }
                val map = Arguments.createMap()
                map.putInt("code", error)
                map.putString("message", errorMsg)
                sendEvent("onSpeechError", map)
            }

            override fun onResults(results: Bundle?) {
                val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                val map = Arguments.createMap()
                val arr = Arguments.createArray()
                matches?.forEach { arr.pushString(it) }
                map.putArray("results", arr)
                map.putString("bestResult", matches?.firstOrNull() ?: "")
                sendEvent("onSpeechResult", map)
            }

            override fun onPartialResults(partialResults: Bundle?) {
                val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                val map = Arguments.createMap()
                map.putString("partial", matches?.firstOrNull() ?: "")
                sendEvent("onSpeechPartial", map)
            }

            override fun onEvent(eventType: Int, params: Bundle?) {}
        }
    }

    private fun sendEvent(eventName: String, params: WritableMap) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    @ReactMethod
    fun addListener(eventName: String) {}

    @ReactMethod
    fun removeListeners(count: Int) {}
}