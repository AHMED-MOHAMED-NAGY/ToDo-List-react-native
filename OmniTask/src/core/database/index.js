/**
 * OmniTask - Database Module Index
 * Central export point for all database operations
 */
export {getDatabase, initDatabase, closeDatabase} from './Database';
export {
  createTask,
  getAllTasks,
  getTaskById,
  getTaskStats,
  getActiveTasks,
  updateTask,
  markTaskDone,
  resetRecurringTask,
  deleteTask,
  deleteCompletedTasks,
  searchTasks,
} from './TaskDAO';
export {
  addMediaAttachment,
  getMediaByTaskId,
  getMediaCountsByTask,
  deleteMediaAttachment,
  deleteAllMediaByTask,
} from './MediaDAO';
export {
  addDeepLink,
  getDeepLinksByTaskId,
  getDeepLinksByType,
  updateDeepLink,
  deleteDeepLink,
  deleteAllDeepLinksByTask,
} from './DeepLinkDAO';
export {
  getSetting,
  setSetting,
  getAllSettings,
  deleteSetting,
} from './SettingsDAO';
