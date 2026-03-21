/**
 * OmniTask - Speech-to-Text JS Bridge
 * Wraps the native SpeechToTextModule with event listeners
 */
import {NativeModules, NativeEventEmitter, Platform} from 'react-native';

const {SpeechToTextModule} = NativeModules;
const emitter = Platform.OS === 'android' ? new NativeEventEmitter(SpeechToTextModule) : null;

const SpeechToText = {
  /**
   * Checks if speech recognition is available
   * @returns {Promise<boolean>}
   */
  isAvailable: async () => {
    if (Platform.OS !== 'android') return false;
    return SpeechToTextModule.isAvailable();
  },

  /**
   * Starts listening for speech
   * @param {Object} options - {locale: 'en-US', preferOffline: true}
   * @returns {Promise<boolean>}
   */
  startListening: async (options = {}) => {
    const {locale = 'en-US', preferOffline = true} = options;
    return SpeechToTextModule.startListening(locale, preferOffline);
  },

  /**
   * Stops listening
   * @returns {Promise<boolean>}
   */
  stopListening: async () => {
    return SpeechToTextModule.stopListening();
  },

  /**
   * Cancels and destroys the recognizer
   * @returns {Promise<boolean>}
   */
  cancel: async () => {
    return SpeechToTextModule.cancel();
  },

  /**
   * Subscribes to speech recognition events
   * @param {string} event - 'onSpeechResult' | 'onSpeechPartial' | 'onSpeechError' | 'onSpeechStart' | 'onSpeechEnd'
   * @param {Function} callback
   * @returns {Object} subscription (call .remove() to unsubscribe)
   */
  on: (event, callback) => {
    if (!emitter) return {remove: () => {}};
    return emitter.addListener(event, callback);
  },

  /**
   * Convenience: listen and return the best result
   * @param {Object} options
   * @returns {Promise<string>} Best transcription result
   */
  listenOnce: async (options = {}) => {
    return new Promise((resolve, reject) => {
      const resultSub = SpeechToText.on('onSpeechResult', (data) => {
        resultSub.remove();
        errorSub.remove();
        resolve(data.bestResult || '');
      });
      const errorSub = SpeechToText.on('onSpeechError', (data) => {
        resultSub.remove();
        errorSub.remove();
        reject(new Error(data.message));
      });
      SpeechToText.startListening(options).catch(reject);
    });
  },
};

export default SpeechToText;
