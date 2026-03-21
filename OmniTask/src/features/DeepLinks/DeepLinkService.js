/**
 * OmniTask - Deep Link Service
 * Handles opening WhatsApp, Telegram, Contacts, Google Search, Samsung Notes
 */
import {Linking, Alert, Platform} from 'react-native';

/**
 * Opens a specific WhatsApp chat
 * @param {string} phoneNumber - International format without +, e.g., '1234567890'
 * @param {string} text - Optional pre-filled message
 */
export const openWhatsAppChat = async (phoneNumber, text = '') => {
  try {
    const url = text
      ? `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`
      : `https://wa.me/${phoneNumber}`;

    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      // Fallback to direct WhatsApp scheme
      const fallback = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(text)}`;
      await Linking.openURL(fallback);
    }
  } catch (error) {
    Alert.alert('Error', 'WhatsApp is not installed on this device.');
    console.error('[OmniTask] WhatsApp link failed:', error);
  }
};

/**
 * Opens a Telegram chat by username or channel
 * @param {string} username - Telegram username (without @)
 */
export const openTelegramChat = async (username) => {
  try {
    const url = `tg://resolve?domain=${username}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      // Fallback to web link
      await Linking.openURL(`https://t.me/${username}`);
    }
  } catch (error) {
    Alert.alert('Error', 'Telegram is not installed on this device.');
    console.error('[OmniTask] Telegram link failed:', error);
  }
};

/**
 * Opens a specific contact card by lookup URI
 * @param {string} contactUri - Contact content URI or lookup key
 */
export const openContact = async (contactUri) => {
  try {
    await Linking.openURL(contactUri);
  } catch (error) {
    Alert.alert('Error', 'Failed to open contact.');
    console.error('[OmniTask] Contact link failed:', error);
  }
};

/**
 * Initiates a Google Search for a query
 * @param {string} query - Search query string
 */
export const openGoogleSearch = async (query) => {
  try {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    await Linking.openURL(url);
  } catch (error) {
    Alert.alert('Error', 'Failed to open Google Search.');
    console.error('[OmniTask] Google Search link failed:', error);
  }
};

/**
 * Opens Samsung Notes (best-effort using package intent)
 * Samsung Notes uses undocumented internal providers so this may fail
 * @param {string} noteId - Optional specific note identifier
 */
export const openSamsungNote = async (noteId = null) => {
  try {
    if (noteId) {
      // Attempt to open specific note via content provider URI
      const noteUri = `content://com.samsung.android.app.notes.provider/notes/${noteId}`;
      try {
        await Linking.openURL(noteUri);
        return;
      } catch {
        // Fall through to package launch
      }
    }
    // Fallback: launch Samsung Notes app directly
    const packageUrl = 'samsungnotes://';
    try {
      await Linking.openURL(packageUrl);
    } catch {
      // Final fallback: launch via package name
      await Linking.openURL('https://apps.samsung.com/appquery/appDetail.as?appId=com.samsung.android.app.notes');
    }
  } catch (error) {
    Alert.alert('Error', 'Samsung Notes is not available on this device.');
    console.error('[OmniTask] Samsung Notes link failed:', error);
  }
};

/**
 * Opens a custom URL
 * @param {string} url - Any valid URL
 */
export const openCustomUrl = async (url) => {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', `Cannot open URL: ${url}`);
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to open the link.');
    console.error('[OmniTask] Custom URL link failed:', error);
  }
};

/**
 * Dispatches a deep link based on its type
 * @param {Object} deepLink - Deep link object from database
 */
export const executeDeepLink = async (deepLink) => {
  const {link_type, link_uri, extra_data} = deepLink;

  switch (link_type) {
    case 'whatsapp':
      return openWhatsAppChat(link_uri, extra_data);
    case 'telegram':
      return openTelegramChat(link_uri);
    case 'contact':
      return openContact(link_uri);
    case 'google_search':
      return openGoogleSearch(link_uri);
    case 'samsung_notes':
      return openSamsungNote(link_uri);
    case 'custom_url':
      return openCustomUrl(link_uri);
    default:
      console.warn(`[OmniTask] Unknown deep link type: ${link_type}`);
      return openCustomUrl(link_uri);
  }
};
