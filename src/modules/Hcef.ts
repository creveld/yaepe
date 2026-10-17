import { NativeModules } from 'react-native';

/** Text of the system notification shown when the card is read by a reader. */
export interface TagNotification {
  title: string;
  message: string;
}

interface NativeHcefModule {
  support?: boolean;
  enabled?: boolean;
  enableService: (
    sid: string,
    title: string | null,
    message: string | null,
  ) => Promise<true>;
  disableService: () => Promise<true>;
}

interface HcefModule {
  support: boolean;
  enabled: boolean;
  /** Starts emulating `sid`; optionally notifies when a reader reads it. */
  enableService: (sid: string, notification?: TagNotification) => Promise<true>;
  disableService: () => Promise<true>;
}

const nativeModule = NativeModules.Hcef as NativeHcefModule | undefined;

const unavailable = () =>
  Promise.reject(new Error('Hcef native module is not available.'));

/**
 * Thin wrapper around the Android HCE-F native module. Falls back to safe
 * defaults when the native module is missing (e.g. on iOS or in tests).
 */
const Hcef: HcefModule = {
  support: nativeModule?.support ?? false,
  enabled: nativeModule?.enabled ?? false,
  enableService: (sid, notification) =>
    nativeModule
      ? nativeModule.enableService(
          sid,
          notification?.title ?? null,
          notification?.message ?? null,
        )
      : unavailable(),
  disableService: () =>
    nativeModule ? nativeModule.disableService() : unavailable(),
};

export default Hcef;
