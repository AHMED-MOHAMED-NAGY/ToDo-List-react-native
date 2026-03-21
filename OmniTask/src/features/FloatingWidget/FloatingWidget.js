/**
 * OmniTask - Floating Widget JS Bridge
 * Wraps the native FloatingWidgetModule for use in React Native
 */
import {NativeModules, Platform} from 'react-native';

const {FloatingWidgetModule} = NativeModules;

const FloatingWidget = {
  /**
   * Checks if the app has SYSTEM_ALERT_WINDOW permission
   * @returns {Promise<boolean>}
   */
  checkPermission: async () => {
    if (Platform.OS !== 'android') return false;
    return FloatingWidgetModule.checkOverlayPermission();
  },

  /**
   * Opens system settings to grant overlay permission
   */
  requestPermission: () => {
    if (Platform.OS === 'android') {
      FloatingWidgetModule.requestOverlayPermission();
    }
  },

  /**
   * Starts the floating widget foreground service and shows the overlay
   * @returns {Promise<boolean>}
   */
  start: async () => {
    if (Platform.OS !== 'android') return false;
    return FloatingWidgetModule.startFloatingWidget();
  },

  /**
   * Stops the floating widget service entirely
   * @returns {Promise<boolean>}
   */
  stop: async () => {
    if (Platform.OS !== 'android') return false;
    return FloatingWidgetModule.stopFloatingWidget();
  },

  /**
   * Shows the widget without restarting the service
   * @returns {Promise<boolean>}
   */
  show: async () => {
    if (Platform.OS !== 'android') return false;
    return FloatingWidgetModule.showWidget();
  },

  /**
   * Hides the widget without stopping the service
   * @returns {Promise<boolean>}
   */
  hide: async () => {
    if (Platform.OS !== 'android') return false;
    return FloatingWidgetModule.hideWidget();
  },

  /**
   * Notifies the native widget to refresh its task list
   * @returns {Promise<boolean>}
   */
  refreshTasks: async () => {
    if (Platform.OS !== 'android') return false;
    return FloatingWidgetModule.updateTasks();
  },
};

export default FloatingWidget;
