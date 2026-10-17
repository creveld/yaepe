import type { Card } from '../types';

export type RootStackParams = {
  Main: undefined;
  Add: undefined;
  Edit: { card: Card; index: number };
};
