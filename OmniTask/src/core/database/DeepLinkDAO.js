/**
 * OmniTask - Deep Link CRUD Operations
 * Manages links to WhatsApp, Telegram, Contacts, Samsung Notes, Calendar, etc.
 */
import {getDatabase} from './Database';

/**
 * Adds a deep link to a task
 * @param {Object} link - {task_id, link_type, link_uri, display_label, extra_data}
 * @returns {Object} Created deep link with generated id
 */
export const addDeepLink = async (link) => {
  const db = await getDatabase();
  const {
    task_id,
    link_type,
    link_uri,
    display_label = '',
    extra_data = '',
  } = link;

  const result = await db.executeSql(
    `INSERT INTO deep_links (task_id, link_type, link_uri, display_label, extra_data)
     VALUES (?, ?, ?, ?, ?)`,
    [task_id, link_type, link_uri, display_label, extra_data],
  );

  return {id: result[0].insertId, ...link};
};

/**
 * Gets all deep links for a specific task
 * @param {number} taskId - Task ID
 * @returns {Array} Array of deep link objects
 */
export const getDeepLinksByTaskId = async (taskId) => {
  const db = await getDatabase();
  const result = await db.executeSql(
    'SELECT * FROM deep_links WHERE task_id = ? ORDER BY created_at DESC',
    [taskId],
  );

  const links = [];
  for (let i = 0; i < result[0].rows.length; i++) {
    links.push(result[0].rows.item(i));
  }
  return links;
};

/**
 * Gets deep links filtered by type across all tasks
 * @param {string} linkType - One of: whatsapp, telegram, contact, google_search, samsung_notes, samsung_calendar, custom_url
 * @returns {Array} Array of deep link objects
 */
export const getDeepLinksByType = async (linkType) => {
  const db = await getDatabase();
  const result = await db.executeSql(
    'SELECT dl.*, t.title as task_title FROM deep_links dl JOIN tasks t ON dl.task_id = t.id WHERE dl.link_type = ? ORDER BY dl.created_at DESC',
    [linkType],
  );

  const links = [];
  for (let i = 0; i < result[0].rows.length; i++) {
    links.push(result[0].rows.item(i));
  }
  return links;
};

/**
 * Updates a deep link
 * @param {number} id - Deep link ID
 * @param {Object} updates - Fields to update
 * @returns {boolean} Success
 */
export const updateDeepLink = async (id, updates) => {
  const db = await getDatabase();
  const allowedFields = ['link_type', 'link_uri', 'display_label', 'extra_data'];
  const setClauses = [];
  const params = [];

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      setClauses.push(`${key} = ?`);
      params.push(value);
    }
  }

  if (setClauses.length === 0) {
    return false;
  }

  params.push(id);
  await db.executeSql(
    `UPDATE deep_links SET ${setClauses.join(', ')} WHERE id = ?`,
    params,
  );
  return true;
};

/**
 * Deletes a specific deep link
 * @param {number} id - Deep link ID
 * @returns {boolean} Success
 */
export const deleteDeepLink = async (id) => {
  const db = await getDatabase();
  await db.executeSql('DELETE FROM deep_links WHERE id = ?', [id]);
  return true;
};

/**
 * Deletes all deep links for a task
 * @param {number} taskId - Task ID
 * @returns {number} Number of deleted links
 */
export const deleteAllDeepLinksByTask = async (taskId) => {
  const db = await getDatabase();
  const result = await db.executeSql(
    'DELETE FROM deep_links WHERE task_id = ?',
    [taskId],
  );
  return result[0].rowsAffected;
};
