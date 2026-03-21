/**
 * OmniTask - Task List Screen
 * Shows all tasks with filtering, search, and swipe actions
 */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from '../../../theme/ThemeContext';
import {useAppStore} from '../../../core/store/useAppStore';

const FILTERS = [
  {label: 'All', value: null},
  {label: 'Pending', value: 'pending'},
  {label: 'Done', value: 'done'},
  {label: 'In Progress', value: 'in_progress'},
];

const TaskListScreen = ({navigation}) => {
  const {colors, shadows, themeName} = useTheme();
  const {tasks, loadTasks, completeTask, searchTasksAction, isLoadingTasks} = useAppStore();
  const [activeFilter, setActiveFilter] = useState(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const handleFilter = (status) => {
    setActiveFilter(status);
    loadTasks({status});
  };

  const handleSearch = (text) => {
    setSearchText(text);
    searchTasksAction(text);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return colors.priorityHigh;
      case 'medium': return colors.priorityMedium;
      case 'low': return colors.priorityLow;
      default: return colors.textMuted;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'done': return 'check-circle';
      case 'in_progress': return 'progress-clock';
      case 'cancelled': return 'close-circle';
      default: return 'circle-outline';
    }
  };

  const renderTask = ({item}) => (
    <TouchableOpacity
      style={[styles.taskItem, {backgroundColor: colors.card, ...shadows.small}]}
      onPress={() => navigation.navigate('TaskDetail', {taskId: item.id})}
      activeOpacity={0.7}>

      {/* Priority Indicator Bar */}
      <View style={[styles.priorityBar, {backgroundColor: getPriorityColor(item.priority)}]} />

      <View style={styles.taskBody}>
        <View style={styles.taskTop}>
          <TouchableOpacity
            onPress={() => item.status !== 'done' && completeTask(item.id)}
            style={styles.statusIcon}>
            <Icon
              name={getStatusIcon(item.status)}
              size={24}
              color={item.status === 'done' ? colors.success : getPriorityColor(item.priority)}
            />
          </TouchableOpacity>
          <View style={styles.taskInfo}>
            <Text
              style={[
                styles.taskTitle,
                {color: colors.textPrimary},
                item.status === 'done' && styles.taskDone,
              ]}
              numberOfLines={1}>
              {item.title}
            </Text>
            {item.description ? (
              <Text style={[styles.taskDesc, {color: colors.textSecondary}]} numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.taskFooter}>
          <View style={[styles.badge, {backgroundColor: getPriorityColor(item.priority) + '20'}]}>
            <Text style={[styles.badgeText, {color: getPriorityColor(item.priority)}]}>
              {item.priority?.toUpperCase()}
            </Text>
          </View>
          {item.recurrence !== 'none' && (
            <View style={[styles.badge, {backgroundColor: colors.info + '20'}]}>
              <Icon name="repeat" size={11} color={colors.info} />
              <Text style={[styles.badgeText, {color: colors.info, marginLeft: 3}]}>
                {item.recurrence}
              </Text>
            </View>
          )}
          {item.due_date && (
            <Text style={[styles.dueDateText, {color: colors.textMuted}]}>
              📅 {item.due_date}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Search Bar */}
      <View style={[styles.searchBar, {backgroundColor: colors.card, ...shadows.small}]}>
        <Icon name="magnify" size={20} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, {color: colors.textPrimary}]}
          placeholder="Search tasks..."
          placeholderTextColor={colors.textMuted}
          value={searchText}
          onChangeText={handleSearch}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Icon name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.label}
            style={[
              styles.filterChip,
              {
                backgroundColor: activeFilter === f.value ? colors.primary : colors.card,
                borderColor: activeFilter === f.value ? colors.primary : colors.border,
              },
            ]}
            onPress={() => handleFilter(f.value)}>
            <Text
              style={[
                styles.filterText,
                {color: activeFilter === f.value ? colors.textOnPrimary : colors.textSecondary},
              ]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Task List */}
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="inbox-outline" size={56} color={colors.textMuted} />
            <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
              No tasks found
            </Text>
          </View>
        }
      />

      {/* FAB - Create Task */}
      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: themeName === 'neon' ? colors.primary : colors.primary,
            ...shadows.large,
          },
        ]}
        onPress={() => navigation.navigate('CreateTask')}>
        <Icon name="plus" size={28} color={themeName === 'neon' ? colors.textOnPrimary : '#FFFFFF'} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {flex: 1, fontSize: 15, padding: 0},
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {fontSize: 12, fontWeight: '600'},
  listContent: {paddingHorizontal: 16, paddingBottom: 100},
  taskItem: {
    flexDirection: 'row',
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
  },
  priorityBar: {width: 4, borderTopLeftRadius: 14, borderBottomLeftRadius: 14},
  taskBody: {flex: 1, padding: 14},
  taskTop: {flexDirection: 'row', alignItems: 'flex-start'},
  statusIcon: {marginRight: 10, marginTop: 1},
  taskInfo: {flex: 1},
  taskTitle: {fontSize: 15, fontWeight: '600'},
  taskDone: {textDecorationLine: 'line-through', opacity: 0.6},
  taskDesc: {fontSize: 13, marginTop: 3, lineHeight: 18},
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginLeft: 34,
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {fontSize: 10, fontWeight: '700'},
  dueDateText: {fontSize: 11},
  empty: {alignItems: 'center', paddingTop: 80},
  emptyText: {marginTop: 12, fontSize: 15, fontWeight: '500'},
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TaskListScreen;
