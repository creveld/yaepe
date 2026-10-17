import { NativeModules } from 'react-native';

interface CardConvModule {
  convertSID: (sid: string) => Promise<string>;
}

const nativeModule = NativeModules.CardConv as CardConvModule | undefined;

/**
 * Converts a 16-character SID (e.g. `02FE...`) into a KONAMI ID.
 * Wraps the native module so that a missing module rejects instead of
 * throwing a `TypeError` at call time.
 */
const CardConv: CardConvModule = {
  convertSID: sid => {
    if (!nativeModule) {
      return Promise.reject(
        new Error('CardConv native module is not available.'),
      );
    }
    return nativeModule.convertSID(sid);
  },
};

export default CardConv;
