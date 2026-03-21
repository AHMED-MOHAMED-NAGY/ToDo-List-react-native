/**
 * OmniTask - Calendar Sync JS Bridge
 * Wraps the native CalendarSyncModule for Samsung Calendar integration
 */
import {NativeModules, Platform} from 'react-native';

const {CalendarSyncModule} = NativeModules;

const CalendarSync = {
  /**
   * Gets the default calendar on the device
   * @returns {Promise<{id: number, name: string}>}
   */
  getDefaultCalendar: async () => {
    if (Platform.OS !== 'android') return null;
    return CalendarSyncModule.getDefaultCalendarId();
  },

  /**
   * Creates an all-day event for a task in Samsung Calendar
   * @param {number} calendarId - Calendar ID
   * @param {string} title - Task title
   * @param {string} description - Task description
   * @param {Date|string} dueDate - Due date
   * @returns {Promise<string>} Event URI for later reference
   */
  createTaskEvent: async (calendarId, title, description, dueDate) => {
    const dateMillis = dueDate instanceof Date
      ? dueDate.getTime()
      : new Date(dueDate).getTime();
    return CalendarSyncModule.createTaskEvent(calendarId, title, description || '', dateMillis);
  },

  /**
   * Marks a calendar event as complete (adds ✅ to title)
   * @param {string} eventUri - The event URI from createTaskEvent
   * @param {string} originalTitle - Original task title
   * @returns {Promise<boolean>}
   */
  markComplete: async (eventUri, originalTitle) => {
    return CalendarSyncModule.markEventComplete(eventUri, originalTitle);
  },

  /**
   * Deletes a calendar event
   * @param {string} eventUri - Event URI
   * @returns {Promise<boolean>}
   */
  deleteEvent: async (eventUri) => {
    return CalendarSyncModule.deleteEvent(eventUri);
  },

  /**
   * Adds a reminder to an event
   * @param {number} eventId - Event ID
   * @param {number} minutesBefore - Minutes before event to alert
   * @returns {Promise<boolean>}
   */
  addReminder: async (eventId, minutesBefore = 30) => {
    return CalendarSyncModule.addReminder(eventId, minutesBefore);
  },
};

export default CalendarSync;
