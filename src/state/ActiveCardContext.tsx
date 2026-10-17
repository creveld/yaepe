import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import Hcef from '../modules/Hcef';

interface ActiveCardContextValue {
  /** SID of the card currently served over HCE-F, or `null` when idle. */
  activeSid: string | null;
  /**
   * Activates the card, or deactivates it when it already is the active one.
   * The name is used for the "card was read" notification.
   */
  toggleActive: (sid: string, cardName: string) => Promise<void>;
  /** Stops the service when `sid` is the active card; no-op otherwise. */
  deactivate: (sid?: string) => Promise<void>;
}

const ActiveCardContext = createContext<ActiveCardContextValue | undefined>(
  undefined,
);

/**
 * Tracks which card is being emulated over HCE-F. The state lives here rather
 * than in a single screen because both the home screen (activation) and the
 * edit screen (deletion) can change it.
 */
export const ActiveCardProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();
  const [activeSid, setActiveSid] = useState<string | null>(null);

  const toggleActive = useCallback(
    async (sid: string, cardName: string) => {
      if (activeSid === sid) {
        await Hcef.disableService();
        setActiveSid(null);
      } else {
        await Hcef.enableService(sid, {
          title: t('notification.tagged_title'),
          message: t('notification.tagged_body', { cardName }),
        });
        setActiveSid(sid);
      }
    },
    [activeSid, t],
  );

  const deactivate = useCallback(
    async (sid?: string) => {
      if (activeSid === null || (sid !== undefined && sid !== activeSid)) {
        return;
      }

      try {
        await Hcef.disableService();
      } catch {
        // The service may already be stopped, which is not a failure here.
      }

      setActiveSid(null);
    },
    [activeSid],
  );

  const value = useMemo(
    () => ({ activeSid, toggleActive, deactivate }),
    [activeSid, toggleActive, deactivate],
  );

  return (
    <ActiveCardContext.Provider value={value}>
      {children}
    </ActiveCardContext.Provider>
  );
};

export const useActiveCard = () => {
  const context = useContext(ActiveCardContext);

  if (!context) {
    throw new Error('useActiveCard must be used within an ActiveCardProvider.');
  }

  return context;
};
