/**
 * OmniTask - Task CRUD Operations
 * Complete Create, Read, Update, Delete operations for the tasks table
 */
import {getDatabase} from './Database';

// ──────────────────────────────────────────────
// CREATE
// ──────────────────────────────────────────────

/**
 * Creates a new task
 * @param {Object} task - Task object with title, description, priority, etc.
 * @returns {Object} Created task with generated id
 */
export const createTask = async (task) => {
  const db = await getDatabase();
  const {
    title,
    description = '',
    priority = 'medium',
    status = 'pending',
    recurrence = 'none',
    recurrence_days = '',
    due_date = null,
    due_time = null,
    reminder_time = null,
  } = task;

  const result = await db.executeSql(
    `INSERT INTO tasks (title, description, priority, status, recurrence, recurrence_days, due_date, due_time, reminder_time)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, description, priority, status, recurrence, recurrence_days, due_date, due_time, reminder_time],
  );

  const insertId = result[0].insertId;
  return {id: insertId, ...task, created_at: new Date().toISOString()};
};

// ──────────────────────────────────────────────
// READ
// ──────────────────────────────────────────────

/**
 * Fetches all tasks, optionally filtered by status or priority
 * @param {Object} filters - Optional filter criteria
 * @returns {Array} Array of task objects
 */
export const getAllTasks = async (filters = {}) => {
  const db = await getDatabase();
  let query = 'SELECT * FROM tasks';
  const params = [];
  const conditions = [];

  if (filters.status) {
    conditions.push('status = ?');
    params.push(filters.status);
  }
  if (filters.priority) {
    conditions.push('priority = ?');
    params.push(filters.priority);
  }
  if (filters.recurrence) {
    conditions.push('recurrence = ?');
    params.push(filters.recurrence);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY CASE priority WHEN \'high\' THEN 0 WHEN \'medium\' THEN 1 WHEN \'low\' THEN 2 END, created_at DESC';

  const result = await db.executeSql(query, params);
  const tasks = [];
  const rows = result[0].rows;
  for (let i = 0; i < rows.length; i++) {
    tasks.push(rows.item(i));
  }
  return tasks;
};

/**
 * Fetches a single task by ID, including media attachments and deep links
 * @param {number} id - Task ID
 * @returns {Object|null} Task with nested attachments and deep links
 */
export const getTaskById = async (id) => {
  const db = await getDatabase();

  const taskResult = await db.executeSql(
    'SELECT * FROM tasks WHERE id = ?',
    [id],
  );
  if (taskResult[0].rows.length === 0) {
    return null;
  }
  const task = taskResult[0].rows.item(0);

  // Fetch associated media attachments
  const mediaResult = await db.executeSql(
    'SELECT * FROM media_attachments WHERE task_id = ? ORDER BY created_at DESC',
    [id],
  );
  task.media = [];
  for (let i = 0; i < mediaResult[0].rows.length; i++) {
    task.media.push(mediaResult[0].rows.item(i));
  }

  // Fetch associated deep links
  const linkResult = await db.executeSql(
    'SELECT * FROM deep_links WHERE task_id = ? ORDER BY created_at DESC',
    [id],
  );
  task.deep_links = [];
  for (let i = 0; i < linkResult[0].rows.length; i++) {
    task.deep_links.push(linkResult[0].rows.item(i));
  }

  return task;
};

/**
 * Gets task statistics for the admin dashboard
 * @returns {Object} Stats object with counts by status/priority
 */
export const getTaskStats = async () => {
  const db = await getDatabase();

  const totalResult = await db.executeSql('SELECT COUNT(*) as count FROM tasks');
  const pendingResult = await db.executeSql("SELECT COUNT(*) as count FROM tasks WHERE status = 'pending'");
  const doneResult = await db.executeSql("SELECT COUNT(*) as count FROM tasks WHERE status = 'done'");
  const highResult = await db.executeSql("SELECT COUNT(*) as count FROM tasks WHERE priority = 'high' AND status != 'done'");
  const overdueResult = await db.executeSql(
    "SELECT COUNT(*) as count FROM tasks WHERE due_date < date('now') AND status = 'pending'",
  );

  return {
    total: totalResult[0].rows.item(0).count,
    pending: pendingResult[0].rows.item(0).count,
    done: doneResult[0].rows.item(0).count,
    highPriority: highResult[0].rows.item(0).count,
    overdue: overdueResult[0].rows.item(0).count,
  };
};

/**
 * Gets active (pending/in_progress) tasks for the floating widget
 * @param {number} limit - Max number of tasks to return
 * @returns {Array} Array of active tasks
 */
export const getActiveTasks = async (limit = 10) => {
  const db = await getDatabase();
  const result = await db.executeSql(
    `SELECT * FROM tasks
     WHERE status IN ('pending', 'in_progress')
     ORDER BY CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 WHEN 'low' THEN 2 END,
              due_date ASC NULLS LAST,
              created_at DESC
     LIMIT ?`,
    [limit],
  );

  const tasks = [];
  for (let i = 0; i < result[0].rows.length; i++) {
    tasks.push(result[0].rows.item(i));
  }
  return tasks;
};

// ──────────────────────────────────────────────
// UPDATE
// ──────────────────────────────────────────────

/**
 * Updates a task's properties
 * @param {number} id - Task ID
 * @param {Object} updates - Object with fields to update
 * @returns {boolean} Success
 */
export const updateTask = async (id, updates) => {
  const db = await getDatabase();
  const allowedFields = [
    'title', 'description', 'priority', 'status', 'recurrence',
    'recurrence_days', 'due_date', 'due_time', 'reminder_time',
    'calendar_event_id', 'last_completed_at',
  ];

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

  setClauses.push("updated_at = datetime('now')");
  params.push(id);

  await db.executeSql(
    `UPDATE tasks SET ${setClauses.join(', ')} WHERE id = ?`,
    params,
  );
  return true;
};

/**
 * Marks a task as done and records completion timestamp
 * @param {number} id - Task ID
 * @returns {boolean} Success
 */
export const markTaskDone = async (id) => {
  return updateTask(id, {
    status: 'done',
    last_completed_at: new Date().toISOString(),
  });
};

/**
 * Resets a recurring task back to pending (called by scheduler)
 * @param {number} id - Task ID
 * @returns {boolean} Success
 */
export const resetRecurringTask = async (id) => {
  return updateTask(id, {status: 'pending'});
};

// ──────────────────────────────────────────────
// DELETE
// ──────────────────────────────────────────────

/**
 * Deletes a task and all its associated media/deep links (via CASCADE)
 * @param {number} id - Task ID
 * @returns {boolean} Success
 */
export const deleteTask = async (id) => {
  const db = await getDatabase();
  await db.executeSql('DELETE FROM tasks WHERE id = ?', [id]);
  return true;
};

/**
 * Deletes all completed tasks (housekeeping)
 * @returns {number} Number of tasks deleted
 */
export const deleteCompletedTasks = async () => {
  const db = await getDatabase();
  const result = await db.executeSql("DELETE FROM tasks WHERE status = 'done'");
  return result[0].rowsAffected;
};

/**
 * Searches tasks by title or description
 * @param {string} query - Search string
 * @returns {Array} Matching tasks
 */
export const searchTasks = async (query) => {
  const db = await getDatabase();
  const result = await db.executeSql(
    `SELECT * FROM tasks
     WHERE title LIKE ? OR description LIKE ?
     ORDER BY CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 WHEN 'low' THEN 2 END,
              created_at DESC`,
    [`%${query}%`, `%${query}%`],
  );

  const tasks = [];
  for (let i = 0; i < result[0].rows.length; i++) {
    tasks.push(result[0].rows.item(i));
  }
  return tasks;
};
