import { PermissionsAndroid, Platform } from 'react-native';

const POST_NOTIFICATIONS = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;

/** Android 13 (API 33) and newer gate notifications behind a runtime grant. */
const needsRuntimePermission = () =>
  Platform.OS === 'android' && Number(Platform.Version) >= 33;

/**
 * Makes sure the app may post notifications. Resolves to whether they are
 * allowed; the caller should treat a denial as "no notification" rather than
 * as an error.
 */
export const ensureNotificationPermission = async () => {
  if (!needsRuntimePermission()) {
    return true;
  }

  try {
    if (await PermissionsAndroid.check(POST_NOTIFICATIONS)) {
      return true;
    }

    const result = await PermissionsAndroid.request(POST_NOTIFICATIONS);
    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
};
