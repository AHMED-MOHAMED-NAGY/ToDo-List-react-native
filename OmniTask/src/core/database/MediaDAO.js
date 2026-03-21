/**
 * OmniTask - Media Attachment CRUD Operations
 * Manages photos, videos, voice recordings, and screenshots linked to tasks
 */
import {getDatabase} from './Database';

/**
 * Adds a media attachment to a task
 * @param {Object} attachment - {task_id, type, file_uri, file_name, file_size, duration}
 * @returns {Object} Created attachment with generated id
 */
export const addMediaAttachment = async (attachment) => {
  const db = await getDatabase();
  const {
    task_id,
    type,
    file_uri,
    file_name = '',
    file_size = 0,
    duration = 0,
  } = attachment;

  const result = await db.executeSql(
    `INSERT INTO media_attachments (task_id, type, file_uri, file_name, file_size, duration)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [task_id, type, file_uri, file_name, file_size, duration],
  );

  return {id: result[0].insertId, ...attachment};
};

/**
 * Gets all media attachments for a specific task
 * @param {number} taskId - Task ID
 * @param {string} type - Optional filter by type ('photo', 'video', 'voice', 'screenshot')
 * @returns {Array} Array of attachment objects
 */
export const getMediaByTaskId = async (taskId, type = null) => {
  const db = await getDatabase();
  let query = 'SELECT * FROM media_attachments WHERE task_id = ?';
  const params = [taskId];

  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }

  query += ' ORDER BY created_at DESC';

  const result = await db.executeSql(query, params);
  const media = [];
  for (let i = 0; i < result[0].rows.length; i++) {
    media.push(result[0].rows.item(i));
  }
  return media;
};

/**
 * Gets total count of media attachments per type for a task
 * @param {number} taskId - Task ID
 * @returns {Object} Counts by type
 */
export const getMediaCountsByTask = async (taskId) => {
  const db = await getDatabase();
  const result = await db.executeSql(
    `SELECT type, COUNT(*) as count FROM media_attachments
     WHERE task_id = ? GROUP BY type`,
    [taskId],
  );

  const counts = {photo: 0, video: 0, voice: 0, screenshot: 0};
  for (let i = 0; i < result[0].rows.length; i++) {
    const row = result[0].rows.item(i);
    counts[row.type] = row.count;
  }
  return counts;
};

/**
 * Deletes a specific media attachment
 * @param {number} id - Attachment ID
 * @returns {boolean} Success
 */
export const deleteMediaAttachment = async (id) => {
  const db = await getDatabase();
  await db.executeSql('DELETE FROM media_attachments WHERE id = ?', [id]);
  return true;
};

/**
 * Deletes all media attachments for a task
 * @param {number} taskId - Task ID
 * @returns {number} Number of deleted attachments
 */
export const deleteAllMediaByTask = async (taskId) => {
  const db = await getDatabase();
  const result = await db.executeSql(
    'DELETE FROM media_attachments WHERE task_id = ?',
    [taskId],
  );
  return result[0].rowsAffected;
};
