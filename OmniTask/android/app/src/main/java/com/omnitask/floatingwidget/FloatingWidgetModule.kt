package com.omnitask.floatingwidget

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.*

/**
 * FloatingWidgetModule - React Native Bridge
 * 
 * Exposes native floating widget controls to JavaScript.
 * Handles permission checks, service start/stop, and visibility toggling.
 */
class FloatingWidgetModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "FloatingWidgetModule"

    /**
     * Checks if SYSTEM_ALERT_WINDOW permission is granted
     */
    @ReactMethod
    fun checkOverlayPermission(promise: Promise) {
        try {
            val hasPermission = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                Settings.canDrawOverlays(reactApplicationContext)
            } else {
                true
            }
            promise.resolve(hasPermission)
        } catch (e: Exception) {
            promise.reject("PERMISSION_ERROR", e.message)
        }
    }

    /**
     * Opens the system settings page to grant overlay permission
     */
    @ReactMethod
    fun requestOverlayPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:${reactApplicationContext.packageName}")
            )
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(intent)
        }
    }

    /**
     * Starts the floating widget foreground service
     */
    @ReactMethod
    fun startFloatingWidget(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M &&
                !Settings.canDrawOverlays(reactApplicationContext)
            ) {
                promise.reject("NO_PERMISSION", "Overlay permission not granted")
                return
            }

            val intent = Intent(reactApplicationContext, FloatingWidgetService::class.java)
            intent.action = FloatingWidgetService.ACTION_SHOW

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactApplicationContext.startForegroundService(intent)
            } else {
                reactApplicationContext.startService(intent)
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SERVICE_ERROR", e.message)
        }
    }

    /**
     * Stops the floating widget service entirely
     */
    @ReactMethod
    fun stopFloatingWidget(promise: Promise) {
        try {
            val intent = Intent(reactApplicationContext, FloatingWidgetService::class.java)
            reactApplicationContext.stopService(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SERVICE_ERROR", e.message)
        }
    }

    /**
     * Shows the floating window without restarting the service
     */
    @ReactMethod
    fun showWidget(promise: Promise) {
        try {
            val intent = Intent(reactApplicationContext, FloatingWidgetService::class.java)
            intent.action = FloatingWidgetService.ACTION_SHOW
            reactApplicationContext.startService(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SERVICE_ERROR", e.message)
        }
    }

    /**
     * Hides the floating window without stopping the service
     */
    @ReactMethod
    fun hideWidget(promise: Promise) {
        try {
            val intent = Intent(reactApplicationContext, FloatingWidgetService::class.java)
            intent.action = FloatingWidgetService.ACTION_HIDE
            reactApplicationContext.startService(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SERVICE_ERROR", e.message)
        }
    }

    /**
     * Notifies the native service to refresh its task data
     */
    @ReactMethod
    fun updateTasks(promise: Promise) {
        try {
            val intent = Intent(reactApplicationContext, FloatingWidgetService::class.java)
            intent.action = FloatingWidgetService.ACTION_UPDATE_TASKS
            reactApplicationContext.startService(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SERVICE_ERROR", e.message)
        }
    }
}
