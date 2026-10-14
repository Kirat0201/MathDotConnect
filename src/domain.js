export const STORAGE_KEY = 'mathdotconnect:v1';
export const MAX_CONTRIBUTIONS = 100;
const limits = {
  title: [3, 90],
  formula: [1, 220],
  summary: [15, 240],
  explanation: [30, 3000],
};

export function safeUrl(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}

export function validateContribution(input) {
  const value = {};
  const errors = {};
  for (const [field, [min, max]] of Object.entries(limits)) {
    value[field] =
      typeof input?.[field] === 'string' ? input[field].trim() : '';
    if (value[field].length < min || value[field].length > max)
      errors[field] = `Use ${min}–${max} characters.`;
  }
  value.sourceUrl =
    typeof input?.sourceUrl === 'string'
      ? safeUrl(input.sourceUrl.trim())
      : null;
  if (!value.sourceUrl)
    errors.sourceUrl = 'Enter a complete http or https learning resource URL.';
  return { value, errors, valid: Object.keys(errors).length === 0 };
}

export function filterEquations(
  items,
  {
    query = '',
    topic = 'All topics',
    savedOnly = false,
    favorites = [],
    sort = 'curated',
  } = {},
) {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const saved = new Set(favorites);
  const result = items.filter((item) => {
    const text = [
      item.title,
      item.formula,
      item.summary,
      item.topic,
      ...item.tags,
    ]
      .join(' ')
      .toLocaleLowerCase();
    return (
      (!savedOnly || saved.has(item.id)) &&
      (topic === 'All topics' || item.topic === topic) &&
      terms.every((term) => text.includes(term))
    );
  });
  if (sort === 'title') result.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === 'quick')
    result.sort((a, b) => a.readingMinutes - b.readingMinutes);
  return result;
}

export function toggleFavorite(ids, id) {
  return ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id];
}

export function createContribution(input, id) {
  const result = validateContribution(input);
  if (!result.valid) throw new Error('Invalid contribution');
  const { value } = result;
  return {
    id,
    title: value.title,
    formula: value.formula,
    summary: value.summary,
    explanation: value.explanation,
    topic: 'Your contributions',
    tags: ['personal contribution'],
    application:
      'A personal contribution. Check the linked resource for assumptions and applications.',
    symbols: 'See the explanation and linked resource for notation.',
    source: { label: 'Explore the contributed resource', url: value.sourceUrl },
    accent: 'violet',
    readingMinutes: Math.max(
      1,
      Math.ceil(value.explanation.split(/\s+/).length / 180),
    ),
    local: true,
  };
}

export function parseStoredState(raw) {
  const empty = { favorites: [], contributions: [] };
  if (!raw) return { ...empty, recovered: false };
  try {
    const data = JSON.parse(raw);
    if (
      data?.version !== 1 ||
      !Array.isArray(data.favorites) ||
      !Array.isArray(data.contributions)
    )
      throw new Error('Unknown format');
    const seen = new Set();
    const contributions = [];
    for (const item of data.contributions.slice(0, MAX_CONTRIBUTIONS)) {
      if (
        !item ||
        typeof item.id !== 'string' ||
        !/^local-[\w-]{1,80}$/.test(item.id) ||
        seen.has(item.id)
      )
        continue;
      try {
        const contribution = createContribution(
          { ...item, sourceUrl: item.source?.url },
          item.id,
        );
        contributions.push(contribution);
        seen.add(item.id);
      } catch {
        /* Discard invalid data instead of trusting imported/local storage. */
      }
    }
    return {
      favorites: [
        ...new Set(
          data.favorites.filter(
            (id) => typeof id === 'string' && id.length <= 100,
          ),
        ),
      ].slice(0, 1000),
      contributions,
      recovered: contributions.length !== data.contributions.length,
    };
  } catch {
    return { ...empty, recovered: true };
  }
}

export function loadState(storage) {
  try {
    return {
      ...parseStoredState(storage.getItem(STORAGE_KEY)),
      unavailable: false,
    };
  } catch {
    return {
      favorites: [],
      contributions: [],
      recovered: false,
      unavailable: true,
    };
  }
}

export function persistState(storage, state) {
  try {
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        favorites: state.favorites,
        contributions: state.contributions,
      }),
    );
    return true;
  } catch {
    return false;
  }
}

export function mergeNotebook(current, raw, catalogIds = []) {
  const imported = parseStoredState(raw);
  if (imported.recovered)
    throw new Error(
      'The backup is invalid or contains unsupported entries. Your notebook has not been changed.',
    );
  const contributions = new Map(
    current.contributions.map((item) => [item.id, item]),
  );
  for (const item of imported.contributions) {
    const existing = contributions.get(item.id);
    if (existing && JSON.stringify(existing) !== JSON.stringify(item))
      throw new Error(
        'A backup entry conflicts with an existing equation. Your notebook has not been changed.',
      );
    contributions.set(item.id, item);
  }
  if (contributions.size > MAX_CONTRIBUTIONS)
    throw new Error(
      'Restoring this backup would exceed the 100-contribution limit.',
    );
  const known = new Set([...catalogIds, ...contributions.keys()]);
  return {
    contributions: [...contributions.values()],
    favorites: [
      ...new Set([...current.favorites, ...imported.favorites]),
    ].filter((id) => known.has(id)),
  };
}
