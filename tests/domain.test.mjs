import test from 'node:test';
import assert from 'node:assert/strict';
import { catalog } from '../src/catalog.js';
import {
  createContribution,
  filterEquations,
  loadState,
  mergeNotebook,
  parseStoredState,
  persistState,
  safeUrl,
  toggleFavorite,
  validateContribution,
} from '../src/domain.js';

const input = {
  title: 'The golden ratio',
  formula: 'φ = (1 + √5) / 2',
  summary: 'An interesting relationship between lengths.',
  explanation:
    'The ratio of the whole to the larger part equals the ratio of the larger part to the smaller part.',
  sourceUrl: 'https://example.com/learn',
};
test('search combines words across tags and titles without case sensitivity', () => {
  assert.deepEqual(
    filterEquations(catalog, { query: ' FOURIER   waves ' }).map((x) => x.id),
    ['fourier'],
  );
  assert.equal(filterEquations(catalog, { query: 'does-not-exist' }).length, 0);
});
test('topic, saved collection, and search compose', () => {
  assert.deepEqual(
    filterEquations(catalog, {
      topic: 'Physics',
      savedOnly: true,
      favorites: ['heat', 'bayes'],
    }).map((x) => x.id),
    ['heat'],
  );
  assert.equal(filterEquations(catalog, { savedOnly: true }).length, 0);
});
test('sorting never mutates the source catalog', () => {
  const original = catalog.map((x) => x.id);
  const sorted = filterEquations(catalog, { sort: 'title' });
  assert.equal(sorted[0].id, 'bayes');
  assert.deepEqual(
    catalog.map((x) => x.id),
    original,
  );
  const quick = filterEquations(catalog, { sort: 'quick' });
  assert.equal(quick[0].readingMinutes, 2);
});
test('favorites toggle without modifying original state', () => {
  const ids = ['euler'];
  assert.deepEqual(toggleFavorite(ids, 'heat'), ['euler', 'heat']);
  assert.deepEqual(toggleFavorite(ids, 'euler'), []);
  assert.deepEqual(ids, ['euler']);
});
test('URL validation blocks executable schemes and embedded credentials', () => {
  for (const url of [
    'javascript:alert(1)',
    'data:text/html,hello',
    'file:///etc/passwd',
    '/relative',
    'https://user:secret@example.com',
  ])
    assert.equal(safeUrl(url), null);
  assert.equal(
    safeUrl('https://example.com/learn'),
    'https://example.com/learn',
  );
});
test('contribution validation trims fields and rejects missing/oversized values', () => {
  assert.equal(
    validateContribution({ ...input, title: '  The golden ratio  ' }).value
      .title,
    input.title,
  );
  assert.equal(validateContribution(input).valid, true);
  assert.equal(validateContribution({ ...input, title: 'a' }).valid, false);
  assert.equal(
    validateContribution({ ...input, formula: 'x'.repeat(221) }).valid,
    false,
  );
  assert.equal(validateContribution(null).valid, false);
  assert.equal(Object.keys(validateContribution({}).errors).length, 5);
});
test('stored entries are reconstructed from validated content, excluding injected fields', () => {
  const item = createContribution(input, 'local-123');
  const result = parseStoredState(
    JSON.stringify({
      version: 1,
      favorites: ['euler', 'euler', null],
      contributions: [
        { ...item, accent: 'unsafe', readingMinutes: -1, local: false },
      ],
    }),
  );
  assert.deepEqual(result.favorites, ['euler']);
  assert.equal(result.contributions[0].accent, 'violet');
  assert.equal(result.contributions[0].local, true);
});
test('corrupt, unsupported and malicious saved data recover safely', () => {
  assert.equal(parseStoredState('{').recovered, true);
  assert.equal(parseStoredState('{"version":999}').recovered, true);
  const result = parseStoredState(
    JSON.stringify({
      version: 1,
      favorites: [],
      contributions: [
        { id: 'euler', ...input },
        null,
        {
          ...createContribution(input, 'local-xyz'),
          source: { url: 'javascript:alert(1)' },
        },
      ],
    }),
  );
  assert.equal(result.contributions.length, 0);
  assert.equal(result.recovered, true);
});
test('storage access and quota failures are observable without crashing', () => {
  const blocked = {
    getItem() {
      throw new Error('denied');
    },
    setItem() {
      throw new Error('quota');
    },
  };
  assert.equal(loadState(blocked).unavailable, true);
  assert.equal(
    persistState(blocked, { favorites: [], contributions: [] }),
    false,
  );
});
test('saved notebook round trips through storage', () => {
  let raw;
  const storage = {
    setItem(_key, value) {
      raw = value;
    },
    getItem() {
      return raw;
    },
  };
  const state = {
    favorites: ['local-abc'],
    contributions: [createContribution(input, 'local-abc')],
  };
  assert.equal(persistState(storage, state), true);
  const restored = loadState(storage);
  assert.deepEqual(restored.contributions, state.contributions);
  assert.deepEqual(restored.favorites, state.favorites);
});
test('catalog has unique IDs, explanatory content and safe learning resources', () => {
  assert.equal(new Set(catalog.map((x) => x.id)).size, catalog.length);
  for (const item of catalog) {
    assert.ok(item.explanation.length > 50);
    assert.ok(safeUrl(item.source.url));
    assert.ok(item.tags.length);
  }
});

test('restore merges safely, retains existing data, and rejects conflicts', () => {
  const item = createContribution(input, 'local-test');
  const existing = { favorites: ['euler'], contributions: [item] };
  const raw = JSON.stringify({
    version: 1,
    favorites: ['local-test', 'unknown'],
    contributions: [item],
  });
  const merged = mergeNotebook(existing, raw, ['euler']);
  assert.equal(merged.contributions.length, 1);
  assert.deepEqual(merged.favorites, ['euler', 'local-test']);
  assert.throws(() => mergeNotebook(existing, '{broken', ['euler']));
  assert.throws(() =>
    mergeNotebook(
      existing,
      JSON.stringify({
        version: 1,
        favorites: [],
        contributions: [{ ...item, title: 'Conflicting title' }],
      }),
      ['euler'],
    ),
  );
  assert.equal(existing.contributions[0].title, input.title);
});
