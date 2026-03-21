package com.omnitask.floatingwidget

import android.app.*
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.util.Log
import android.view.*
import android.widget.*
import androidx.core.app.NotificationCompat

/**
 * FloatingWidgetService - Android ForegroundService
 * 
 * Manages a persistent floating overlay window using WindowManager.
 * Listens for ACTION_USER_PRESENT to show the widget on device unlock.
 * Renders a draggable task list overlay with add/check-off capabilities.
 */
class FloatingWidgetService : Service() {

    companion object {
        const val TAG = "FloatingWidgetService"
        const val CHANNEL_ID = "omnitask_floating_channel"
        const val NOTIFICATION_ID = 1001
        const val ACTION_SHOW = "com.omnitask.SHOW_WIDGET"
        const val ACTION_HIDE = "com.omnitask.HIDE_WIDGET"
        const val ACTION_UPDATE_TASKS = "com.omnitask.UPDATE_TASKS"
    }

    private var windowManager: WindowManager? = null
    private var floatingView: View? = null
    private var isViewAttached = false

    // Unlock detection receiver
    private val unlockReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            when (intent?.action) {
                Intent.ACTION_USER_PRESENT -> {
                    Log.d(TAG, "Device unlocked - showing floating widget")
                    showFloatingWindow()
                }
                Intent.ACTION_SCREEN_OFF -> {
                    Log.d(TAG, "Screen off - hiding floating widget")
                    hideFloatingWindow()
                }
            }
        }
    }

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        createNotificationChannel()
        registerUnlockReceiver()
        Log.d(TAG, "FloatingWidgetService created")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Start as foreground service with persistent notification
        val notification = buildNotification()
        startForeground(NOTIFICATION_ID, notification)

        when (intent?.action) {
            ACTION_SHOW -> showFloatingWindow()
            ACTION_HIDE -> hideFloatingWindow()
            ACTION_UPDATE_TASKS -> updateTaskList()
            else -> showFloatingWindow()
        }

        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        hideFloatingWindow()
        try {
            unregisterReceiver(unlockReceiver)
        } catch (e: Exception) {
            Log.w(TAG, "Receiver already unregistered")
        }
        super.onDestroy()
        Log.d(TAG, "FloatingWidgetService destroyed")
    }

    // ─────────────────────────────────────────────
    // NOTIFICATION (Required for ForegroundService)
    // ─────────────────────────────────────────────

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "OmniTask Floating Widget",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps the floating task widget active"
                setShowBadge(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(): Notification {
        val openAppIntent = packageManager.getLaunchIntentForPackage(packageName)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("⚡ OmniTask Active")
            .setContentText("Tap to open • Floating widget is running")
            .setSmallIcon(android.R.drawable.ic_popup_reminder)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    // ─────────────────────────────────────────────
    // UNLOCK RECEIVER REGISTRATION
    // ─────────────────────────────────────────────

    private fun registerUnlockReceiver() {
        val filter = IntentFilter().apply {
            addAction(Intent.ACTION_USER_PRESENT)
            addAction(Intent.ACTION_SCREEN_OFF)
            addAction(Intent.ACTION_SCREEN_ON)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(unlockReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            registerReceiver(unlockReceiver, filter)
        }
        Log.d(TAG, "Unlock receiver registered")
    }

    // ─────────────────────────────────────────────
    // FLOATING WINDOW MANAGEMENT
    // ─────────────────────────────────────────────

    private fun showFloatingWindow() {
        if (isViewAttached) return

        // Inflate floating widget layout
        val inflater = getSystemService(LAYOUT_INFLATER_SERVICE) as LayoutInflater
        floatingView = inflater.inflate(
            resources.getIdentifier("floating_widget_layout", "layout", packageName),
            null
        )

        // Configure WindowManager.LayoutParams
        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            else
                WindowManager.LayoutParams.TYPE_PHONE,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 50
            y = 200
            width = 340.dpToPx()
            height = WindowManager.LayoutParams.WRAP_CONTENT
        }

        // Setup drag-to-move touch handler
        setupDragListener(floatingView!!, params)

        // Setup button handlers
        setupWidgetButtons(floatingView!!)

        try {
            windowManager?.addView(floatingView, params)
            isViewAttached = true
            Log.d(TAG, "Floating window shown")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to add floating view: ${e.message}")
        }
    }

    private fun hideFloatingWindow() {
        if (!isViewAttached || floatingView == null) return
        try {
            windowManager?.removeView(floatingView)
            isViewAttached = false
            floatingView = null
            Log.d(TAG, "Floating window hidden")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to remove floating view: ${e.message}")
        }
    }

    // ─────────────────────────────────────────────
    // DRAG-TO-MOVE HANDLER (60fps native touch)
    // ─────────────────────────────────────────────

    private fun setupDragListener(view: View, params: WindowManager.LayoutParams) {
        val headerView = view.findViewById<View>(
            resources.getIdentifier("widget_header", "id", packageName)
        ) ?: view

        var initialX = 0
        var initialY = 0
        var initialTouchX = 0f
        var initialTouchY = 0f

        headerView.setOnTouchListener { _, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    initialX = params.x
                    initialY = params.y
                    initialTouchX = event.rawX
                    initialTouchY = event.rawY
                    true
                }
                MotionEvent.ACTION_MOVE -> {
                    params.x = initialX + (event.rawX - initialTouchX).toInt()
                    params.y = initialY + (event.rawY - initialTouchY).toInt()
                    try {
                        windowManager?.updateViewLayout(view, params)
                    } catch (_: Exception) {}
                    true
                }
                else -> false
            }
        }
    }

    // ─────────────────────────────────────────────
    // WIDGET BUTTON HANDLERS
    // ─────────────────────────────────────────────

    private fun setupWidgetButtons(view: View) {
        // Close button
        view.findViewById<View>(
            resources.getIdentifier("btn_close_widget", "id", packageName)
        )?.setOnClickListener {
            hideFloatingWindow()
        }

        // Open full app button
        view.findViewById<View>(
            resources.getIdentifier("btn_open_app", "id", packageName)
        )?.setOnClickListener {
            val intent = packageManager.getLaunchIntentForPackage(packageName)
            intent?.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            startActivity(intent)
        }
    }

    private fun updateTaskList() {
        // Task list updates are handled via React Native bridge events
        Log.d(TAG, "Task list update requested")
    }

    // Extension: dp to px conversion
    private fun Int.dpToPx(): Int {
        return (this * resources.displayMetrics.density).toInt()
    }
}
