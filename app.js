import { catalog } from './src/catalog.js';
import {
  MAX_CONTRIBUTIONS,
  createContribution,
  filterEquations,
  loadState,
  mergeNotebook,
  persistState,
  toggleFavorite,
  validateContribution,
} from './src/domain.js';

const $ = (selector) => document.querySelector(selector);
let storage;
try {
  storage = window.localStorage;
} catch {
  /* Private/restricted browsing can disable storage. */
}
const stored = loadState(storage);
const state = {
  favorites: stored.favorites,
  contributions: stored.contributions,
  query: '',
  topic: 'All topics',
  sort: 'curated',
  savedOnly: false,
};
let activeDetail = null;
let toastTimer;
const allItems = () => [...catalog, ...state.contributions];

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function formulaNode(item, className) {
  const node = el('div', className);
  if (item.id === 'euler') {
    node.append('e', el('sup', '', 'iπ'), ' + 1 = 0');
    node.setAttribute(
      'aria-label',
      'e raised to the power i pi, plus one, equals zero',
    );
  } else node.textContent = item.formula;
  return node;
}
function notify(message) {
  clearTimeout(toastTimer);
  $('#toast').textContent = message;
  $('#toast').hidden = false;
  toastTimer = setTimeout(() => {
    $('#toast').hidden = true;
  }, 6500);
}
function save(message) {
  const persisted = persistState(storage, state);
  notify(
    persisted
      ? message
      : `${message} Changes are temporary: browser storage is unavailable or full. Export your notebook before leaving.`,
  );
  return persisted;
}
function saveButton(item, className = 'save-button') {
  const saved = state.favorites.includes(item.id);
  const button = el(
    'button',
    className,
    className === 'save-button'
      ? saved
        ? '♥'
        : '♡'
      : saved
        ? '♥ Saved to collection'
        : '♡ Save to collection',
  );
  button.type = 'button';
  button.dataset.favorite = item.id;
  button.setAttribute(
    'aria-label',
    `${saved ? 'Remove' : 'Save'} ${item.title}${saved ? ' from' : ' to'} collection`,
  );
  button.setAttribute('aria-pressed', String(saved));
  button.addEventListener('click', () => {
    state.favorites = toggleFavorite(state.favorites, item.id);
    save(
      state.favorites.includes(item.id)
        ? 'A new connection, saved.'
        : 'Removed from your collection.',
    );
    render();
    // Keep the activating button stable for keyboard users while the collection re-renders.
    if (activeDetail) {
      const updated = saveButton(item, 'button button-outline');
      button.replaceWith(updated);
      updated.focus();
    } else {
      const replacement = [
        ...document.querySelectorAll('[data-favorite]'),
      ].find((node) => node.dataset.favorite === item.id);
      if (replacement) replacement.focus({ preventScroll: true });
      else $('#section-title').focus({ preventScroll: true });
    }
  });
  return button;
}
function card(item) {
  const article = el('article', `equation-card ${item.accent}`);
  const panel = el('div', 'formula-panel');
  const size =
    item.formula.length > 50
      ? ' extra-long'
      : item.formula.length > 30
        ? ' long'
        : '';
  panel.append(formulaNode(item, `formula${size}`), saveButton(item));
  const body = el('div', 'card-body');
  body.append(
    el('p', 'card-topic', item.topic),
    el('h3', 'card-title', item.title),
    el('p', 'card-description', item.summary),
  );
  const tags = el('div', 'card-tags');
  for (const tag of item.tags.slice(0, 3)) tags.append(el('span', 'tag', tag));
  const footer = el('div', 'card-footer');
  const link = el('a', 'explore-link', 'Explore the idea ↗');
  link.href = `#equation/${encodeURIComponent(item.id)}`;
  link.setAttribute('aria-label', `Explore ${item.title}`);
  footer.append(link, el('span', '', `${item.readingMinutes} min read`));
  body.append(tags, footer);
  article.append(panel, body);
  return article;
}
function render() {
  const items = allItems();
  state.favorites = state.favorites.filter((id) =>
    items.some((item) => item.id === id),
  );
  $('#saved-count').textContent = state.favorites.length;
  $('#section-title').tabIndex = -1;
  $('#section-title').textContent = state.savedOnly
    ? 'Ideas worth coming back to.'
    : 'A world of ideas, in a few symbols.';
  $('#section-kicker').textContent = state.savedOnly
    ? 'YOUR PERSONAL COLLECTION'
    : 'THE EXPLORER’S NOTEBOOK';
  $('#catalog-count').textContent =
    `${items.length} starting points. Endless connections.`;
  for (const link of document.querySelectorAll('[data-nav]')) {
    if (link.dataset.nav === (state.savedOnly ? 'saved' : 'explore'))
      link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  const topics = ['All topics', ...new Set(items.map((item) => item.topic))];
  $('#topics').replaceChildren(
    ...topics.map((topic) => {
      const button = el('button', 'topic', topic);
      button.type = 'button';
      button.setAttribute('aria-pressed', String(state.topic === topic));
      button.addEventListener('click', () => {
        state.topic = topic;
        render();
        [...$('#topics').children]
          .find((child) => child.textContent === topic)
          ?.focus({ preventScroll: true });
      });
      return button;
    }),
  );
  const matches = filterEquations(items, state);
  $('#equation-grid').replaceChildren(...matches.map(card));
  $('#result-count').textContent =
    `${matches.length} ${matches.length === 1 ? 'equation' : 'equations'}${state.savedOnly ? ' in your collection' : ' to explore'}`;
  $('#empty-state').hidden = matches.length > 0;
  $('#empty-title').textContent =
    state.savedOnly && !state.favorites.length
      ? 'Your next favorite is out there.'
      : 'No equations found. Yet.';
  $('#empty-copy').textContent =
    state.savedOnly && !state.favorites.length
      ? 'Tap the heart on an equation to keep it in your collection.'
      : 'Try a different word or reset your topic filters.';
}
function detail(item) {
  activeDetail = item.id;
  const content = $('#detail-content');
  const title = el('h2', '', item.title);
  title.id = 'detail-title';
  content.replaceChildren(
    el('p', 'eyebrow', item.topic),
    title,
    formulaNode(item, `detail-formula ${item.accent}`),
  );
  for (const [heading, text] of [
    ['The idea', item.explanation],
    ['Where it connects', item.application],
    ['Reading the symbols', item.symbols],
  ]) {
    const section = el('section', 'detail-section');
    section.append(el('h3', '', heading), el('p', '', text));
    content.append(section);
  }
  if (item.id === 'euler') content.append(eulerExplorer());
  const actions = el('div', 'detail-actions');
  const resource = el('a', 'button', 'Explore the resource ↗');
  resource.href = item.source.url;
  resource.target = '_blank';
  resource.rel = 'noopener noreferrer';
  resource.title = item.source.label;
  actions.append(resource, saveButton(item, 'button button-outline'));
  content.append(actions);
  if (item.local) {
    content.append(
      el(
        'p',
        'local-note',
        'Personal contribution · stored only in this browser.',
      ),
    );
    const remove = el('button', 'text-button', 'Remove this contribution');
    remove.addEventListener('click', () => {
      state.contributions = state.contributions.filter(
        (entry) => entry.id !== item.id,
      );
      state.favorites = state.favorites.filter((id) => id !== item.id);
      if (state.topic === 'Your contributions' && !state.contributions.length)
        state.topic = 'All topics';
      save('Contribution removed.');
      location.hash = 'explore';
    });
    content.append(remove);
  }
  if (!$('#detail-dialog').open) $('#detail-dialog').showModal();
}

function eulerExplorer() {
  const section = el('section', 'euler-explorer');
  section.append(el('h3', '', 'See the connection'));
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 280 230');
  svg.setAttribute('role', 'img');
  svg.setAttribute(
    'aria-label',
    'A unit circle with a rotating vector representing the complex exponential.',
  );
  function shape(tag, attributes) {
    const node = document.createElementNS(ns, tag);
    for (const [key, value] of Object.entries(attributes))
      node.setAttribute(key, value);
    svg.append(node);
    return node;
  }
  shape('line', { x1: 15, y1: 115, x2: 265, y2: 115, class: 'axis' });
  shape('line', { x1: 140, y1: 10, x2: 140, y2: 220, class: 'axis' });
  shape('circle', { cx: 140, cy: 115, r: 88, class: 'unit-circle' });
  const vector = shape('line', { x1: 140, y1: 115, class: 'unit-vector' });
  const point = shape('circle', { r: 5, class: 'unit-point' });
  section.append(svg);
  const label = el('label', '', 'Angle θ');
  label.htmlFor = 'euler-angle';
  const range = el('input');
  range.id = 'euler-angle';
  range.type = 'range';
  range.min = '0';
  range.max = '360';
  range.step = '1';
  range.value = '180';
  const output = el('output', 'euler-output');
  output.htmlFor = 'euler-angle';
  const update = () => {
    const degrees = Number(range.value);
    const theta = (degrees * Math.PI) / 180;
    const x = 140 + 88 * Math.cos(theta),
      y = 115 - 88 * Math.sin(theta);
    vector.setAttribute('x2', x);
    vector.setAttribute('y2', y);
    point.setAttribute('cx', x);
    point.setAttribute('cy', y);
    output.textContent =
      degrees === 180
        ? 'θ = π radians (180°): e^(iπ) = −1. Add 1, and you get 0.'
        : `θ = ${degrees}°: cos θ = ${Math.cos(theta).toFixed(2)}, sin θ = ${Math.sin(theta).toFixed(2)}. e^(iθ) = cos θ + i sin θ.`;
    range.setAttribute('aria-valuetext', `${degrees} degrees`);
  };
  range.addEventListener('input', update);
  update();
  section.append(label, range, output);
  return section;
}
function closeRouteDialog(dialog, hash) {
  if (dialog.open) dialog.close();
  activeDetail = null;
  if (hash)
    history.replaceState(
      null,
      '',
      `${location.pathname}${location.search}#${hash}`,
    );
}
function route() {
  const fragment = location.hash.slice(1);
  if (fragment.startsWith('equation/')) {
    let id;
    try {
      id = decodeURIComponent(fragment.slice(9));
    } catch {
      id = '';
    }
    const item = allItems().find((entry) => entry.id === id);
    if (item) {
      closeRouteDialog($('#contribute-dialog'));
      detail(item);
      return;
    }
    notify(
      'This equation is unavailable. Personal contributions are only visible in the browser where you added them.',
    );
    history.replaceState(null, '', '#explore');
  }
  closeRouteDialog($('#detail-dialog'));
  if (fragment === 'contribute') {
    if (!$('#contribute-dialog').open) $('#contribute-dialog').showModal();
    return;
  }
  closeRouteDialog($('#contribute-dialog'));
  state.savedOnly = fragment === 'saved';
  render();
  if (state.savedOnly) $('#discover').scrollIntoView({ block: 'start' });
}
function openContribution() {
  location.hash = 'contribute';
  if ($('#contribute-dialog').open) $('#title').focus();
}
$('#search').addEventListener('input', (event) => {
  state.query = event.target.value;
  render();
});
$('#sort').addEventListener('change', (event) => {
  state.sort = event.target.value;
  render();
});
$('#reset-filters').addEventListener('click', () => {
  state.query = '';
  state.topic = 'All topics';
  state.sort = 'curated';
  $('#search').value = '';
  $('#sort').value = 'curated';
  if (state.savedOnly) location.hash = 'explore';
  else render();
});
for (const selector of ['#contribute-open', '#contribute-banner'])
  $(selector).addEventListener('click', openContribution);
for (const [selector, dialogSelector] of [
  ['#detail-close', '#detail-dialog'],
  ['#contribute-close', '#contribute-dialog'],
]) {
  $(selector).addEventListener('click', () =>
    closeRouteDialog($(dialogSelector), state.savedOnly ? 'saved' : 'explore'),
  );
}
for (const selector of ['#detail-dialog', '#contribute-dialog']) {
  $(selector).addEventListener('cancel', (event) => {
    event.preventDefault();
    closeRouteDialog($(selector), state.savedOnly ? 'saved' : 'explore');
  });
  $(selector).addEventListener('click', (event) => {
    if (event.target !== $(selector)) return;
    const rect = $(selector).getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      closeRouteDialog($(selector), state.savedOnly ? 'saved' : 'explore');
  });
}
$('#contribute-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const input = Object.fromEntries(new FormData(event.currentTarget));
  const result = validateContribution(input);
  for (const field of [
    'title',
    'formula',
    'summary',
    'explanation',
    'sourceUrl',
  ]) {
    $(`#error-${field}`).textContent = result.errors[field] || '';
    $(`#${field}`).setAttribute(
      'aria-invalid',
      String(Boolean(result.errors[field])),
    );
  }
  if (!result.valid) {
    $(`#${Object.keys(result.errors)[0]}`).focus();
    return;
  }
  if (state.contributions.length >= MAX_CONTRIBUTIONS) {
    $('#form-message').textContent =
      'Your notebook holds up to 100 contributions. Export a backup and remove an entry before adding another.';
    return;
  }
  const item = createContribution(input, `local-${crypto.randomUUID()}`);
  state.contributions.push(item);
  state.favorites = toggleFavorite(state.favorites, item.id);
  save('Your equation was added to your private notebook.');
  event.currentTarget.reset();
  $('#form-message').textContent = '';
  state.query = '';
  state.topic = 'All topics';
  $('#search').value = '';
  render();
  location.hash = `equation/${item.id}`;
});
$('#export-data').addEventListener('click', () => {
  const data = JSON.stringify(
    {
      version: 1,
      favorites: state.favorites,
      contributions: state.contributions,
    },
    null,
    2,
  );
  const url = URL.createObjectURL(
    new Blob([data], { type: 'application/json' }),
  );
  const link = el('a');
  link.href = url;
  link.download = 'mathdotconnect-notebook.json';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  notify('Notebook exported. Keep the file as your backup.');
});
$('#import-open').addEventListener('click', () => $('#import-data').click());
$('#import-data').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    if (file.size > 1024 * 1024)
      throw new Error('Choose a notebook backup smaller than 1 MB.');
    const raw = await file.text();
    if (!raw.trim())
      throw new Error(
        'The backup is empty. Your notebook has not been changed.',
      );
    const merged = mergeNotebook(
      state,
      raw,
      catalog.map((item) => item.id),
    );
    state.contributions = merged.contributions;
    state.favorites = merged.favorites;
    save('Notebook restored. Existing equations were kept.');
    render();
  } catch (error) {
    notify(error.message);
  }
  event.target.value = '';
});
window.addEventListener('hashchange', route);
render();
route();
if (stored.unavailable)
  notify(
    'Browser storage is unavailable. You can explore, but your notebook will only last for this visit.',
  );
else if (stored.recovered)
  notify(
    'Some saved data could not be read. Valid notebook entries have been recovered.',
  );
