/**
 * OmniTask - Dashboard Screen (Admin Panel)
 * Shows task analytics, quick actions, and active task preview
 */
import React, {useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from '../../../theme/ThemeContext';
import {useAppStore} from '../../../core/store/useAppStore';

const StatCard = ({icon, label, value, color, bgColor, theme}) => (
  <View style={[styles.statCard, {backgroundColor: theme.colors.card, ...theme.shadows.medium}]}>
    <View style={[styles.statIconWrap, {backgroundColor: bgColor}]}>
      <Icon name={icon} size={22} color={color} />
    </View>
    <Text style={[styles.statValue, {color: theme.colors.textPrimary}]}>{value}</Text>
    <Text style={[styles.statLabel, {color: theme.colors.textSecondary}]}>{label}</Text>
  </View>
);

const DashboardScreen = ({navigation}) => {
  const theme = useTheme();
  const {colors, isDark, themeName} = theme;
  const {taskStats, activeTasks, loadStats, loadActiveTasks, completeTask} = useAppStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadStats();
    loadActiveTasks();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    await loadActiveTasks();
    setRefreshing(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return colors.priorityHigh;
      case 'medium': return colors.priorityMedium;
      case 'low': return colors.priorityLow;
      default: return colors.textMuted;
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        backgroundColor={colors.statusBar}
        barStyle={colors.statusBarStyle}
      />

      {/* Header */}
      <View style={[styles.header, {backgroundColor: colors.surface}]}>
        <View>
          <Text style={[styles.headerTitle, {color: colors.textPrimary}]}>
            ⚡ OmniTask
          </Text>
          <Text style={[styles.headerSubtitle, {color: colors.textSecondary}]}>
            Your Productivity Command Center
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.themeButton, {backgroundColor: colors.surfaceElevated}]}
          onPress={() => navigation.navigate('Settings')}>
          <Icon
            name={themeName === 'neon' ? 'lightning-bolt' : isDark ? 'weather-night' : 'white-balance-sunny'}
            size={22}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }>

        {/* Stats Grid */}
        <Text style={[styles.sectionTitle, {color: colors.textPrimary}]}>📊 Analytics</Text>
        <View style={styles.statsGrid}>
          <StatCard
            icon="format-list-checks"
            label="Total Tasks"
            value={taskStats.total}
            color="#6C8AFF"
            bgColor="rgba(108, 138, 255, 0.15)"
            theme={theme}
          />
          <StatCard
            icon="clock-outline"
            label="Pending"
            value={taskStats.pending}
            color="#F59E0B"
            bgColor="rgba(245, 158, 11, 0.15)"
            theme={theme}
          />
          <StatCard
            icon="check-circle-outline"
            label="Completed"
            value={taskStats.done}
            color="#10B981"
            bgColor="rgba(16, 185, 129, 0.15)"
            theme={theme}
          />
          <StatCard
            icon="alert-circle-outline"
            label="High Priority"
            value={taskStats.highPriority}
            color="#EF4444"
            bgColor="rgba(239, 68, 68, 0.15)"
            theme={theme}
          />
        </View>

        {/* Active Tasks Preview */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, {color: colors.textPrimary}]}>
            🔥 Active Tasks
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
            <Text style={[styles.seeAll, {color: colors.primary}]}>See All →</Text>
          </TouchableOpacity>
        </View>

        {activeTasks.length === 0 ? (
          <View style={[styles.emptyState, {backgroundColor: colors.card}]}>
            <Icon name="checkbox-marked-circle-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
              All caught up! No active tasks.
            </Text>
          </View>
        ) : (
          activeTasks.slice(0, 5).map((task) => (
            <TouchableOpacity
              key={task.id}
              style={[styles.taskCard, {backgroundColor: colors.card, ...theme.shadows.small}]}
              onPress={() => navigation.navigate('Tasks', {
                screen: 'TaskDetail',
                params: {taskId: task.id},
              })}>
              <TouchableOpacity
                style={[styles.checkbox, {borderColor: getPriorityColor(task.priority)}]}
                onPress={() => completeTask(task.id)}>
                <View style={[styles.checkboxInner, {backgroundColor: 'transparent'}]} />
              </TouchableOpacity>
              <View style={styles.taskContent}>
                <Text style={[styles.taskTitle, {color: colors.textPrimary}]} numberOfLines={1}>
                  {task.title}
                </Text>
                <View style={styles.taskMeta}>
                  <View style={[styles.priorityBadge, {backgroundColor: getPriorityColor(task.priority) + '20'}]}>
                    <Text style={[styles.priorityText, {color: getPriorityColor(task.priority)}]}>
                      {task.priority?.toUpperCase()}
                    </Text>
                  </View>
                  {task.due_date && (
                    <Text style={[styles.dueDate, {color: colors.textMuted}]}>
                      📅 {task.due_date}
                    </Text>
                  )}
                  {task.recurrence !== 'none' && (
                    <Text style={[styles.recurrence, {color: colors.info}]}>
                      🔄 {task.recurrence}
                    </Text>
                  )}
                </View>
              </View>
              <Icon name="chevron-right" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          ))
        )}

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, {color: colors.textPrimary, marginTop: 24}]}>
          ⚡ Quick Actions
        </Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, {backgroundColor: colors.primary}]}
            onPress={() => navigation.navigate('Tasks', {screen: 'CreateTask'})}>
            <Icon name="plus" size={22} color={colors.textOnPrimary} />
            <Text style={[styles.actionText, {color: colors.textOnPrimary}]}>New Task</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, {backgroundColor: colors.accent}]}
            onPress={() => navigation.navigate('Tasks')}>
            <Icon name="format-list-bulleted" size={22} color="#FFFFFF" />
            <Text style={[styles.actionText, {color: '#FFFFFF'}]}>All Tasks</Text>
          </TouchableOpacity>
        </View>

        <View style={{height: 40}} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 12,
  },
  headerTitle: {fontSize: 26, fontWeight: '800', letterSpacing: -0.5},
  headerSubtitle: {fontSize: 13, marginTop: 2, fontWeight: '500'},
  themeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {paddingHorizontal: 20, paddingTop: 20},
  sectionTitle: {fontSize: 18, fontWeight: '700', marginBottom: 14},
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 14,
  },
  seeAll: {fontSize: 14, fontWeight: '600'},
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {fontSize: 28, fontWeight: '800'},
  statLabel: {fontSize: 12, fontWeight: '600', marginTop: 2},
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxInner: {width: 12, height: 12, borderRadius: 6},
  taskContent: {flex: 1},
  taskTitle: {fontSize: 15, fontWeight: '600'},
  taskMeta: {flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 8},
  priorityBadge: {paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6},
  priorityText: {fontSize: 10, fontWeight: '700'},
  dueDate: {fontSize: 11},
  recurrence: {fontSize: 11},
  emptyState: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 14,
  },
  emptyText: {marginTop: 12, fontSize: 14, fontWeight: '500'},
  quickActions: {flexDirection: 'row', gap: 12},
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionText: {fontSize: 15, fontWeight: '700'},
});

export default DashboardScreen;
