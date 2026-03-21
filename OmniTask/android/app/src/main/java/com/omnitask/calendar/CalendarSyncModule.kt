package com.omnitask.calendar

import android.content.ContentValues
import android.provider.CalendarContract
import com.facebook.react.bridge.*
import java.util.TimeZone

/**
 * CalendarSyncModule - React Native Bridge for CalendarContract
 *
 * Syncs completed tasks to the device's Samsung Calendar as all-day events.
 * Handles insert, update (mark complete with ✅), and delete of calendar entries.
 */
class CalendarSyncModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "CalendarSyncModule"

    /**
     * Gets the first available calendar ID on the device
     */
    @ReactMethod
    fun getDefaultCalendarId(promise: Promise) {
        try {
            val projection = arrayOf(
                CalendarContract.Calendars._ID,
                CalendarContract.Calendars.CALENDAR_DISPLAY_NAME,
                CalendarContract.Calendars.IS_PRIMARY
            )
            val cursor = reactApplicationContext.contentResolver.query(
                CalendarContract.Calendars.CONTENT_URI,
                projection,
                null, null,
                "${CalendarContract.Calendars.IS_PRIMARY} DESC"
            )

            cursor?.use {
                if (it.moveToFirst()) {
                    val id = it.getLong(0)
                    val name = it.getString(1)
                    val map = Arguments.createMap()
                    map.putDouble("id", id.toDouble())
                    map.putString("name", name)
                    promise.resolve(map)
                    return
                }
            }
            promise.reject("NO_CALENDAR", "No calendar found on device")
        } catch (e: Exception) {
            promise.reject("CALENDAR_ERROR", e.message)
        }
    }

    /**
     * Creates an all-day calendar event for a task
     * @param calendarId - Calendar ID to insert into
     * @param title - Task title
     * @param description - Task description
     * @param dateMillis - Due date in milliseconds
     * Returns the event URI string to store as calendar_event_id
     */
    @ReactMethod
    fun createTaskEvent(calendarId: Double, title: String, description: String, dateMillis: Double, promise: Promise) {
        try {
            val values = ContentValues().apply {
                put(CalendarContract.Events.CALENDAR_ID, calendarId.toLong())
                put(CalendarContract.Events.TITLE, "📋 $title")
                put(CalendarContract.Events.DESCRIPTION, description)
                put(CalendarContract.Events.DTSTART, dateMillis.toLong())
                put(CalendarContract.Events.DTEND, dateMillis.toLong() + 86400000) // +1 day
                put(CalendarContract.Events.ALL_DAY, 1)
                put(CalendarContract.Events.EVENT_TIMEZONE, TimeZone.getDefault().id)
                put(CalendarContract.Events.HAS_ALARM, 0)
            }

            val uri = reactApplicationContext.contentResolver.insert(
                CalendarContract.Events.CONTENT_URI, values
            )

            if (uri != null) {
                promise.resolve(uri.toString())
            } else {
                promise.reject("INSERT_FAILED", "Failed to create calendar event")
            }
        } catch (e: Exception) {
            promise.reject("CALENDAR_ERROR", e.message)
        }
    }

    /**
     * Marks a calendar event as completed by updating its title with ✅
     * @param eventUri - The event URI string stored in calendar_event_id
     * @param originalTitle - The original task title
     */
    @ReactMethod
    fun markEventComplete(eventUri: String, originalTitle: String, promise: Promise) {
        try {
            val uri = android.net.Uri.parse(eventUri)
            val values = ContentValues().apply {
                put(CalendarContract.Events.TITLE, "✅ $originalTitle")
            }

            val rowsUpdated = reactApplicationContext.contentResolver.update(
                uri, values, null, null
            )

            promise.resolve(rowsUpdated > 0)
        } catch (e: Exception) {
            promise.reject("CALENDAR_ERROR", e.message)
        }
    }

    /**
     * Deletes a calendar event
     * @param eventUri - The event URI string
     */
    @ReactMethod
    fun deleteEvent(eventUri: String, promise: Promise) {
        try {
            val uri = android.net.Uri.parse(eventUri)
            val rowsDeleted = reactApplicationContext.contentResolver.delete(
                uri, null, null
            )
            promise.resolve(rowsDeleted > 0)
        } catch (e: Exception) {
            promise.reject("CALENDAR_ERROR", e.message)
        }
    }

    /**
     * Creates a reminder (alarm) for an existing event
     * @param eventId - The event ID (extracted from URI)
     * @param minutesBefore - Minutes before event to trigger reminder
     */
    @ReactMethod
    fun addReminder(eventId: Double, minutesBefore: Int, promise: Promise) {
        try {
            val values = ContentValues().apply {
                put(CalendarContract.Reminders.EVENT_ID, eventId.toLong())
                put(CalendarContract.Reminders.MINUTES, minutesBefore)
                put(CalendarContract.Reminders.METHOD, CalendarContract.Reminders.METHOD_ALERT)
            }

            val uri = reactApplicationContext.contentResolver.insert(
                CalendarContract.Reminders.CONTENT_URI, values
            )

            promise.resolve(uri != null)
        } catch (e: Exception) {
            promise.reject("CALENDAR_ERROR", e.message)
        }
    }
}
