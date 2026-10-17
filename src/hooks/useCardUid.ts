import { useCallback, useMemo } from 'react';
import { useQuery } from 'react-query';
import Clipboard from '@react-native-clipboard/clipboard';
import { useTranslation } from 'react-i18next';

import CardConv from '../modules/CardConv';

/**
 * Resolves a SID into its human-readable KONAMI ID and exposes a copy action.
 *
 * The query is cached per SID, so the same card rendered in several places
 * (list, preview, ...) only triggers one native conversion.
 */
export const useCardUid = (sid: string) => {
  const { t } = useTranslation();

  const query = useQuery(['uid', sid], () => CardConv.convertSID(sid));

  const display = useMemo(() => {
    if (query.isError) {
      return t('card_edit.invalid_card_number');
    }

    if (!query.isSuccess) {
      return t('card_edit.loading_card_number');
    }

    return (
      query.data.match(/[A-Za-z0-9]{4}/g)?.join(' - ') ??
      t('card_edit.invalid_card_number')
    );
  }, [query.data, query.isError, query.isSuccess, t]);

  const copy = useCallback(() => {
    if (query.isSuccess) {
      Clipboard.setString(query.data);
    }
  }, [query.data, query.isSuccess]);

  return { display, copy, isReady: query.isSuccess };
};
