/**
 * OmniTask - Task Detail Screen
 * Shows full task details, media, deep links, and actions
 */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from '../../../theme/ThemeContext';
import {useAppStore} from '../../../core/store/useAppStore';
import {getTaskById} from '../../../core/database';
import {executeDeepLink} from '../../DeepLinks/DeepLinkService';
import {pickPhoto, takePhoto, pickVideo, startVoiceRecording, stopVoiceRecording, playVoiceRecording, stopPlayback} from '../../MediaCapture/MediaCaptureService';

const TaskDetailScreen = ({route, navigation}) => {
  const {taskId} = route.params || {};
  const {colors, shadows} = useTheme();
  const {completeTask, removeTask} = useAppStore();
  const [task, setTask] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    loadTask();
  }, [taskId]);

  const loadTask = async () => {
    if (taskId) {
      const data = await getTaskById(taskId);
      setTask(data);
    }
  };

  const handleComplete = async () => {
    await completeTask(taskId);
    loadTask();
  };

  const handleDelete = () => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await removeTask(taskId);
          navigation.goBack();
        },
      },
    ]);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return colors.priorityHigh;
      case 'medium': return colors.priorityMedium;
      case 'low': return colors.priorityLow;
      default: return colors.textMuted;
    }
  };

  if (!task) {
    return (
      <View style={[styles.container, {backgroundColor: colors.background}]}>
        <Text style={{color: colors.textSecondary, textAlign: 'center', marginTop: 40}}>
          Loading task...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Status & Priority Header */}
      <View style={[styles.statusHeader, {backgroundColor: getPriorityColor(task.priority) + '15'}]}>
        <View style={[styles.priorityIndicator, {backgroundColor: getPriorityColor(task.priority)}]}>
          <Text style={styles.priorityLabel}>{task.priority?.toUpperCase()}</Text>
        </View>
        <View style={[styles.statusBadge, {backgroundColor: task.status === 'done' ? colors.success + '20' : colors.warning + '20'}]}>
          <Text style={{color: task.status === 'done' ? colors.success : colors.warning, fontSize: 12, fontWeight: '700'}}>
            {task.status?.toUpperCase().replace('_', ' ')}
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={[styles.title, {color: colors.textPrimary}]}>{task.title}</Text>
        {task.description ? (
          <Text style={[styles.description, {color: colors.textSecondary}]}>
            {task.description}
          </Text>
        ) : null}

        {/* Properties */}
        <View style={[styles.propsCard, {backgroundColor: colors.card, ...shadows.small}]}>
          <View style={styles.propRow}>
            <Icon name="calendar-range" size={18} color={colors.textMuted} />
            <Text style={[styles.propLabel, {color: colors.textSecondary}]}>Due Date</Text>
            <Text style={[styles.propValue, {color: colors.textPrimary}]}>
              {task.due_date || 'Not set'}
            </Text>
          </View>
          <View style={[styles.divider, {backgroundColor: colors.divider}]} />
          <View style={styles.propRow}>
            <Icon name="repeat" size={18} color={colors.textMuted} />
            <Text style={[styles.propLabel, {color: colors.textSecondary}]}>Recurrence</Text>
            <Text style={[styles.propValue, {color: colors.textPrimary}]}>
              {task.recurrence === 'none' ? 'One-time' : task.recurrence}
            </Text>
          </View>
          <View style={[styles.divider, {backgroundColor: colors.divider}]} />
          <View style={styles.propRow}>
            <Icon name="clock-outline" size={18} color={colors.textMuted} />
            <Text style={[styles.propLabel, {color: colors.textSecondary}]}>Created</Text>
            <Text style={[styles.propValue, {color: colors.textPrimary}]}>
              {task.created_at}
            </Text>
          </View>
        </View>

        {/* Media Attachments */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: colors.textPrimary}]}>📎 Attachments</Text>
          {task.media && task.media.length > 0 && (
            task.media.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[styles.mediaItem, {backgroundColor: colors.card}]}
                onPress={() => m.type === 'voice' ? playVoiceRecording(m.file_uri) : null}>
                <Icon
                  name={
                    m.type === 'photo' ? 'image' :
                    m.type === 'video' ? 'video' :
                    m.type === 'voice' ? 'microphone' : 'cellphone-screenshot'
                  }
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.mediaText, {color: colors.textPrimary}]}>
                  {m.file_name || m.type}
                </Text>
                {m.type === 'voice' && (
                  <Icon name="play-circle" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))
          )}
          {/* Add Media Buttons */}
          <View style={styles.addMediaRow}>
            <TouchableOpacity
              style={[styles.addMediaBtn, {backgroundColor: colors.surfaceElevated}]}
              onPress={async () => { await takePhoto(taskId); loadTask(); }}>
              <Icon name="camera" size={18} color={colors.primary} />
              <Text style={[styles.addMediaText, {color: colors.textSecondary}]}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addMediaBtn, {backgroundColor: colors.surfaceElevated}]}
              onPress={async () => { await pickPhoto(taskId); loadTask(); }}>
              <Icon name="image" size={18} color={colors.success} />
              <Text style={[styles.addMediaText, {color: colors.textSecondary}]}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addMediaBtn, {backgroundColor: isRecording ? colors.error + '20' : colors.surfaceElevated}]}
              onPress={async () => {
                if (isRecording) {
                  await stopVoiceRecording(taskId);
                  setIsRecording(false);
                  loadTask();
                } else {
                  await startVoiceRecording();
                  setIsRecording(true);
                }
              }}>
              <Icon name={isRecording ? 'stop-circle' : 'microphone'} size={18} color={isRecording ? colors.error : colors.accent} />
              <Text style={[styles.addMediaText, {color: isRecording ? colors.error : colors.textSecondary}]}>
                {isRecording ? 'Stop' : 'Voice'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Deep Links */}
        {task.deep_links && task.deep_links.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: colors.textPrimary}]}>🔗 Deep Links</Text>
            {task.deep_links.map((link) => (
              <TouchableOpacity
                key={link.id}
                style={[styles.linkItem, {backgroundColor: colors.card, ...shadows.small}]}
                onPress={() => executeDeepLink(link)}>
                <Icon
                  name={
                    link.link_type === 'whatsapp' ? 'whatsapp' :
                    link.link_type === 'telegram' ? 'send' :
                    link.link_type === 'contact' ? 'account' :
                    link.link_type === 'google_search' ? 'google' :
                    link.link_type === 'samsung_notes' ? 'note-text' : 'link'
                  }
                  size={22}
                  color={colors.primary}
                />
                <Text style={[styles.linkText, {color: colors.textPrimary}]}>
                  {link.display_label || link.link_type}
                </Text>
                <Icon name="open-in-new" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          {task.status !== 'done' && (
            <TouchableOpacity
              style={[styles.actionBtn, {backgroundColor: colors.success}]}
              onPress={handleComplete}>
              <Icon name="check" size={20} color="#FFF" />
              <Text style={styles.actionBtnText}>Mark Complete</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionBtn, {backgroundColor: colors.error}]}
            onPress={handleDelete}>
            <Icon name="delete" size={20} color="#FFF" />
            <Text style={styles.actionBtnText}>Delete Task</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  priorityIndicator: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priorityLabel: {color: '#FFF', fontSize: 12, fontWeight: '800'},
  statusBadge: {paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8},
  content: {padding: 20},
  title: {fontSize: 24, fontWeight: '800', letterSpacing: -0.3},
  description: {fontSize: 15, marginTop: 8, lineHeight: 22},
  propsCard: {marginTop: 20, padding: 16, borderRadius: 14},
  propRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 8},
  propLabel: {fontSize: 14, marginLeft: 10, flex: 1},
  propValue: {fontSize: 14, fontWeight: '600'},
  divider: {height: 1, marginVertical: 4},
  section: {marginTop: 24},
  sectionTitle: {fontSize: 16, fontWeight: '700', marginBottom: 10},
  mediaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 6,
    gap: 10,
  },
  mediaText: {fontSize: 14, flex: 1},
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  linkText: {flex: 1, fontSize: 14, fontWeight: '500'},
  actions: {marginTop: 32, gap: 12, marginBottom: 40},
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionBtnText: {color: '#FFF', fontSize: 15, fontWeight: '700'},
  addMediaRow: {flexDirection: 'row', gap: 8, marginTop: 8},
  addMediaBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRadius: 10, gap: 5,
  },
  addMediaText: {fontSize: 11, fontWeight: '600'},
});

export default TaskDetailScreen;
