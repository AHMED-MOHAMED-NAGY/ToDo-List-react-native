/**
 * OmniTask - Global State Management (Zustand)
 * Manages tasks, UI state, theme, and floating widget state
 */
import {create} from 'zustand';
import {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  markTaskDone,
  getTaskStats,
  getActiveTasks,
  searchTasks,
} from '../database';
import {getSetting, setSetting} from '../database/SettingsDAO';

/**
 * Main application store
 */
export const useAppStore = create((set, get) => ({
  // ── Task State ──────────────────────────────
  tasks: [],
  activeTasks: [],
  taskStats: {total: 0, pending: 0, done: 0, highPriority: 0, overdue: 0},
  selectedTask: null,
  isLoadingTasks: false,

  // ── Theme State ─────────────────────────────
  theme: 'dark', // 'light', 'dark', 'neon'

  // ── Floating Widget State ───────────────────
  floatingWidgetEnabled: true,
  showOnUnlock: true,

  // ── UI State ────────────────────────────────
  searchQuery: '',
  filterStatus: null,
  filterPriority: null,
  isCreatingTask: false,

  // ── Task Actions ────────────────────────────

  loadTasks: async (filters = {}) => {
    set({isLoadingTasks: true});
    try {
      const tasks = await getAllTasks(filters);
      set({tasks, isLoadingTasks: false});
    } catch (error) {
      console.error('[OmniTask] Failed to load tasks:', error);
      set({isLoadingTasks: false});
    }
  },

  loadActiveTasks: async () => {
    try {
      const activeTasks = await getActiveTasks(10);
      set({activeTasks});
    } catch (error) {
      console.error('[OmniTask] Failed to load active tasks:', error);
    }
  },

  loadStats: async () => {
    try {
      const taskStats = await getTaskStats();
      set({taskStats});
    } catch (error) {
      console.error('[OmniTask] Failed to load stats:', error);
    }
  },

  addTask: async (task) => {
    set({isCreatingTask: true});
    try {
      const newTask = await createTask(task);
      const state = get();
      set({
        tasks: [newTask, ...state.tasks],
        isCreatingTask: false,
      });
      // Refresh stats and active list
      state.loadStats();
      state.loadActiveTasks();
      return newTask;
    } catch (error) {
      console.error('[OmniTask] Failed to create task:', error);
      set({isCreatingTask: false});
      return null;
    }
  },

  editTask: async (id, updates) => {
    try {
      await updateTask(id, updates);
      const state = get();
      set({
        tasks: state.tasks.map((t) =>
          t.id === id ? {...t, ...updates} : t,
        ),
      });
      state.loadStats();
      state.loadActiveTasks();
      return true;
    } catch (error) {
      console.error('[OmniTask] Failed to update task:', error);
      return false;
    }
  },

  completeTask: async (id) => {
    try {
      await markTaskDone(id);
      const state = get();
      set({
        tasks: state.tasks.map((t) =>
          t.id === id ? {...t, status: 'done', last_completed_at: new Date().toISOString()} : t,
        ),
        activeTasks: state.activeTasks.filter((t) => t.id !== id),
      });
      state.loadStats();
      return true;
    } catch (error) {
      console.error('[OmniTask] Failed to complete task:', error);
      return false;
    }
  },

  removeTask: async (id) => {
    try {
      await deleteTask(id);
      const state = get();
      set({
        tasks: state.tasks.filter((t) => t.id !== id),
        activeTasks: state.activeTasks.filter((t) => t.id !== id),
      });
      state.loadStats();
      return true;
    } catch (error) {
      console.error('[OmniTask] Failed to delete task:', error);
      return false;
    }
  },

  selectTask: (task) => set({selectedTask: task}),
  clearSelection: () => set({selectedTask: null}),

  searchTasksAction: async (query) => {
    set({searchQuery: query});
    if (!query.trim()) {
      get().loadTasks();
      return;
    }
    try {
      const tasks = await searchTasks(query);
      set({tasks});
    } catch (error) {
      console.error('[OmniTask] Search failed:', error);
    }
  },

  setFilters: (status, priority) => {
    set({filterStatus: status, filterPriority: priority});
    get().loadTasks({status, priority});
  },

  // ── Theme Actions ───────────────────────────

  loadTheme: async () => {
    try {
      const theme = await getSetting('theme', 'dark');
      set({theme});
    } catch (error) {
      console.error('[OmniTask] Failed to load theme:', error);
    }
  },

  setTheme: async (theme) => {
    try {
      await setSetting('theme', theme);
      set({theme});
    } catch (error) {
      console.error('[OmniTask] Failed to save theme:', error);
    }
  },

  // ── Widget Actions ──────────────────────────

  loadWidgetSettings: async () => {
    try {
      const enabled = await getSetting('floating_widget_enabled', 'true');
      const unlock = await getSetting('show_on_unlock', 'true');
      set({
        floatingWidgetEnabled: enabled === 'true',
        showOnUnlock: unlock === 'true',
      });
    } catch (error) {
      console.error('[OmniTask] Failed to load widget settings:', error);
    }
  },

  toggleFloatingWidget: async (enabled) => {
    await setSetting('floating_widget_enabled', enabled ? 'true' : 'false');
    set({floatingWidgetEnabled: enabled});
  },

  toggleShowOnUnlock: async (enabled) => {
    await setSetting('show_on_unlock', enabled ? 'true' : 'false');
    set({showOnUnlock: enabled});
  },

  // ── Initialize ──────────────────────────────

  initialize: async () => {
    const state = get();
    await state.loadTheme();
    await state.loadWidgetSettings();
    await state.loadTasks();
    await state.loadStats();
    await state.loadActiveTasks();
  },
}));
