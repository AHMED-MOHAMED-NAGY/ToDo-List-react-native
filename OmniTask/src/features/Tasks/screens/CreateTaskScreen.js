/**
 * OmniTask - Create Task Screen
 * Rich task creation with priority, recurrence, due date, deep links, speech & media
 */
import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from '../../../theme/ThemeContext';
import {useAppStore} from '../../../core/store/useAppStore';
import {addDeepLink} from '../../../core/database';
import SpeechToText from '../../FloatingWidget/SpeechToText';
import {pickPhoto, takePhoto, startVoiceRecording, stopVoiceRecording} from '../../MediaCapture/MediaCaptureService';

const PRIORITIES = [
  {label: 'High', value: 'high', icon: 'arrow-up-bold', color: '#EF4444'},
  {label: 'Medium', value: 'medium', icon: 'minus', color: '#F59E0B'},
  {label: 'Low', value: 'low', icon: 'arrow-down-bold', color: '#10B981'},
];

const RECURRENCE = [
  {label: 'One-time', value: 'none', icon: 'numeric-1-circle'},
  {label: 'Daily', value: 'daily', icon: 'calendar-today'},
  {label: 'Weekly', value: 'weekly', icon: 'calendar-week'},
];

const DEEP_LINK_TYPES = [
  {label: 'WhatsApp', value: 'whatsapp', icon: 'whatsapp', placeholder: 'Phone number (e.g. 1234567890)'},
  {label: 'Telegram', value: 'telegram', icon: 'send', placeholder: 'Username (without @)'},
  {label: 'Contact', value: 'contact', icon: 'account', placeholder: 'Contact URI'},
  {label: 'Google Search', value: 'google_search', icon: 'google', placeholder: 'Search query'},
  {label: 'Samsung Notes', value: 'samsung_notes', icon: 'note-text', placeholder: 'Note ID (or leave empty)'},
];

const CreateTaskScreen = ({navigation}) => {
  const {colors, shadows} = useTheme();
  const {addTask} = useAppStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [recurrence, setRecurrence] = useState('none');
  const [dueDate, setDueDate] = useState('');
  const [showDeepLinkForm, setShowDeepLinkForm] = useState(false);
  const [deepLinkType, setDeepLinkType] = useState('whatsapp');
  const [deepLinkUri, setDeepLinkUri] = useState('');
  const [deepLinkLabel, setDeepLinkLabel] = useState('');
  const [pendingLinks, setPendingLinks] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [pendingMediaCount, setPendingMediaCount] = useState(0);
  const [createdTaskId, setCreatedTaskId] = useState(null);

  // Speech-to-text for title
  const handleSpeechInput = async () => {
    if (isListening) {
      await SpeechToText.stopListening();
      setIsListening(false);
      return;
    }
    try {
      setIsListening(true);
      const text = await SpeechToText.listenOnce({locale: 'en-US'});
      if (text) setTitle((prev) => prev ? `${prev} ${text}` : text);
    } catch (e) {
      console.log('Speech error:', e);
    } finally {
      setIsListening(false);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Task title is required');
      return;
    }

    const newTask = await addTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      recurrence,
      due_date: dueDate || null,
    });

    if (newTask) {
      // Save any pending deep links
      for (const link of pendingLinks) {
        await addDeepLink({
          task_id: newTask.id,
          link_type: link.type,
          link_uri: link.uri,
          display_label: link.label,
        });
      }
      navigation.goBack();
    }
  };

  const addPendingLink = () => {
    if (!deepLinkUri.trim()) {
      Alert.alert('Error', 'Please enter a link value');
      return;
    }
    setPendingLinks([...pendingLinks, {
      type: deepLinkType,
      uri: deepLinkUri.trim(),
      label: deepLinkLabel.trim() || deepLinkType,
    }]);
    setDeepLinkUri('');
    setDeepLinkLabel('');
    setShowDeepLinkForm(false);
  };

  const removePendingLink = (index) => {
    setPendingLinks(pendingLinks.filter((_, i) => i !== index));
  };

  const selectedLinkType = DEEP_LINK_TYPES.find(t => t.value === deepLinkType);

  return (
    <ScrollView style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={styles.form}>
        {/* Title + Speech Button */}
        <Text style={[styles.label, {color: colors.textSecondary}]}>Title *</Text>
        <View style={styles.titleRow}>
          <TextInput
            style={[styles.input, {flex: 1, backgroundColor: colors.card, color: colors.textPrimary, borderColor: colors.border}]}
            placeholder="What needs to be done?"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
            autoFocus
          />
          <TouchableOpacity
            style={[styles.micButton, {backgroundColor: isListening ? colors.error : colors.primary}]}
            onPress={handleSpeechInput}>
            {isListening ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Icon name="microphone" size={20} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>

        {/* Description */}
        <Text style={[styles.label, {color: colors.textSecondary}]}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea, {backgroundColor: colors.card, color: colors.textPrimary, borderColor: colors.border}]}
          placeholder="Add more details..."
          placeholderTextColor={colors.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Priority Selector */}
        <Text style={[styles.label, {color: colors.textSecondary}]}>Priority</Text>
        <View style={styles.optionRow}>
          {PRIORITIES.map((p) => (
            <TouchableOpacity
              key={p.value}
              style={[
                styles.optionChip,
                {
                  backgroundColor: priority === p.value ? p.color + '20' : colors.card,
                  borderColor: priority === p.value ? p.color : colors.border,
                },
              ]}
              onPress={() => setPriority(p.value)}>
              <Icon name={p.icon} size={16} color={priority === p.value ? p.color : colors.textMuted} />
              <Text style={[
                styles.optionText,
                {color: priority === p.value ? p.color : colors.textSecondary},
              ]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recurrence Selector */}
        <Text style={[styles.label, {color: colors.textSecondary}]}>Recurrence</Text>
        <View style={styles.optionRow}>
          {RECURRENCE.map((r) => (
            <TouchableOpacity
              key={r.value}
              style={[
                styles.optionChip,
                {
                  backgroundColor: recurrence === r.value ? colors.primary + '20' : colors.card,
                  borderColor: recurrence === r.value ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setRecurrence(r.value)}>
              <Icon name={r.icon} size={16} color={recurrence === r.value ? colors.primary : colors.textMuted} />
              <Text style={[
                styles.optionText,
                {color: recurrence === r.value ? colors.primary : colors.textSecondary},
              ]}>
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Due Date */}
        <Text style={[styles.label, {color: colors.textSecondary}]}>Due Date</Text>
        <TextInput
          style={[styles.input, {backgroundColor: colors.card, color: colors.textPrimary, borderColor: colors.border}]}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textMuted}
          value={dueDate}
          onChangeText={setDueDate}
        />

        {/* Deep Links Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.label, {color: colors.textSecondary, marginBottom: 0}]}>🔗 Deep Links</Text>
          <TouchableOpacity onPress={() => setShowDeepLinkForm(!showDeepLinkForm)}>
            <Icon name={showDeepLinkForm ? 'close' : 'plus-circle'} size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Pending deep links */}
        {pendingLinks.map((link, index) => (
          <View key={index} style={[styles.pendingLink, {backgroundColor: colors.card, ...shadows.small}]}>
            <Icon
              name={DEEP_LINK_TYPES.find(t => t.value === link.type)?.icon || 'link'}
              size={18}
              color={colors.primary}
            />
            <View style={{flex: 1}}>
              <Text style={[{color: colors.textPrimary, fontSize: 13, fontWeight: '600'}]}>
                {link.label}
              </Text>
              <Text style={[{color: colors.textMuted, fontSize: 11}]}>{link.uri}</Text>
            </View>
            <TouchableOpacity onPress={() => removePendingLink(index)}>
              <Icon name="close" size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        ))}

        {/* Deep Link Form */}
        {showDeepLinkForm && (
          <View style={[styles.deepLinkForm, {backgroundColor: colors.surfaceElevated, ...shadows.small}]}>
            <View style={styles.linkTypeRow}>
              {DEEP_LINK_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.value}
                  style={[
                    styles.linkTypeChip,
                    {backgroundColor: deepLinkType === t.value ? colors.primary + '20' : colors.card},
                  ]}
                  onPress={() => setDeepLinkType(t.value)}>
                  <Icon name={t.icon} size={16} color={deepLinkType === t.value ? colors.primary : colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[styles.input, {backgroundColor: colors.card, color: colors.textPrimary, borderColor: colors.border}]}
              placeholder={selectedLinkType?.placeholder}
              placeholderTextColor={colors.textMuted}
              value={deepLinkUri}
              onChangeText={setDeepLinkUri}
            />
            <TextInput
              style={[styles.input, {backgroundColor: colors.card, color: colors.textPrimary, borderColor: colors.border}]}
              placeholder="Label (optional)"
              placeholderTextColor={colors.textMuted}
              value={deepLinkLabel}
              onChangeText={setDeepLinkLabel}
            />
            <TouchableOpacity
              style={[styles.addLinkBtn, {backgroundColor: colors.primary}]}
              onPress={addPendingLink}>
              <Text style={{color: '#FFF', fontWeight: '700'}}>Add Link</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Media Attachments Toolbar */}
        <Text style={[styles.label, {color: colors.textSecondary}]}>📎 Attachments</Text>
        <View style={styles.mediaToolbar}>
          <TouchableOpacity
            style={[styles.mediaBtn, {backgroundColor: colors.card, borderColor: colors.border}]}
            onPress={async () => {
              Alert.alert('Add after creation', 'Media will be attached after the task is created. Tap Create first.');
            }}>
            <Icon name="camera" size={20} color={colors.primary} />
            <Text style={[styles.mediaBtnText, {color: colors.textSecondary}]}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.mediaBtn, {backgroundColor: colors.card, borderColor: colors.border}]}
            onPress={async () => {
              Alert.alert('Add after creation', 'Media will be attached after the task is created. Tap Create first.');
            }}>
            <Icon name="image" size={20} color={colors.success} />
            <Text style={[styles.mediaBtnText, {color: colors.textSecondary}]}>Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.mediaBtn, {backgroundColor: colors.card, borderColor: colors.border}]}
            onPress={async () => {
              Alert.alert('Add after creation', 'Media will be attached after the task is created. Tap Create first.');
            }}>
            <Icon name="microphone" size={20} color={colors.accent} />
            <Text style={[styles.mediaBtnText, {color: colors.textSecondary}]}>Voice</Text>
          </TouchableOpacity>
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[styles.createBtn, {backgroundColor: colors.primary, ...shadows.medium}]}
          onPress={handleCreate}>
          <Icon name="check-bold" size={22} color={colors.textOnPrimary} />
          <Text style={[styles.createBtnText, {color: colors.textOnPrimary}]}>Create Task</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  form: {padding: 20, paddingTop: 8},
  titleRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  micButton: {
    width: 44, height: 44, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  mediaToolbar: {flexDirection: 'row', gap: 10},
  mediaBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    borderRadius: 10, borderWidth: 1, gap: 4,
  },
  mediaBtnText: {fontSize: 11, fontWeight: '600'},
  label: {fontSize: 13, fontWeight: '700', marginBottom: 6, marginTop: 16, textTransform: 'uppercase', letterSpacing: 0.5},
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 15,
    borderWidth: 1,
  },
  textArea: {minHeight: 100, paddingTop: 12},
  optionRow: {flexDirection: 'row', gap: 10},
  optionChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 6,
  },
  optionText: {fontSize: 13, fontWeight: '600'},
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 8,
  },
  pendingLink: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 6,
    gap: 10,
  },
  deepLinkForm: {padding: 14, borderRadius: 12, marginTop: 8},
  linkTypeRow: {flexDirection: 'row', gap: 8, marginBottom: 10},
  linkTypeChip: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addLinkBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 32,
    marginBottom: 40,
    gap: 8,
  },
  createBtnText: {fontSize: 17, fontWeight: '800'},
});

export default CreateTaskScreen;
