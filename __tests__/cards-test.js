/**
 * @format
 */

import { addCard, getCards, removeCard, updateCard } from '../src/data/cards';

const removeAll = async () => {
  while ((await getCards()).length > 0) {
    await removeCard(0);
  }
};

beforeEach(removeAll);

it('adds, updates and removes cards in order', async () => {
  await addCard({ sid: '02FE000000000001', name: 'A' });
  await addCard({ sid: '02FE000000000002', name: 'B' });

  expect((await getCards()).map(card => card.name)).toEqual(['A', 'B']);

  await updateCard(0, { sid: '02FE000000000001', name: 'A2' });
  expect((await getCards())[0].name).toBe('A2');

  await removeCard(0);
  expect((await getCards()).map(card => card.name)).toEqual(['B']);
});
