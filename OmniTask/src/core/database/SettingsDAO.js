/**
 * OmniTask - Settings DAO
 * Simple key-value store for app-wide settings (theme, widget prefs, etc.)
 */
import {getDatabase} from './Database';

/**
 * Gets a setting value by key
 * @param {string} key - Setting key
 * @param {string} defaultValue - Default if not found
 * @returns {string} Setting value
 */
export const getSetting = async (key, defaultValue = null) => {
  const db = await getDatabase();
  const result = await db.executeSql(
    'SELECT value FROM app_settings WHERE key = ?',
    [key],
  );
  if (result[0].rows.length === 0) {
    return defaultValue;
  }
  return result[0].rows.item(0).value;
};

/**
 * Sets a setting value (insert or update)
 * @param {string} key - Setting key
 * @param {string} value - Setting value
 * @returns {boolean} Success
 */
export const setSetting = async (key, value) => {
  const db = await getDatabase();
  await db.executeSql(
    'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)',
    [key, value],
  );
  return true;
};

/**
 * Gets all settings as an object
 * @returns {Object} Key-value pair object
 */
export const getAllSettings = async () => {
  const db = await getDatabase();
  const result = await db.executeSql('SELECT * FROM app_settings');
  const settings = {};
  for (let i = 0; i < result[0].rows.length; i++) {
    const row = result[0].rows.item(i);
    settings[row.key] = row.value;
  }
  return settings;
};

/**
 * Deletes a setting
 * @param {string} key - Setting key
 * @returns {boolean} Success
 */
export const deleteSetting = async (key) => {
  const db = await getDatabase();
  await db.executeSql('DELETE FROM app_settings WHERE key = ?', [key]);
  return true;
};
