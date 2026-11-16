// Pitlane: the router and the render loop.
//
//   #/                          the board
//   #/bounty/<slug>             one bounty
//   #/bounty/<slug>/leaderboard the bounty's leaderboard
//   #/u/<handle>                an account's public profile
//
// Each view is a small module loaded on demand with a literal import(), so
// the first load stays tiny: index.html, the stylesheet, this file, the API
// client and the formatters. window.__shotReady is false while a page loads
// and true once its data is on screen, so a screenshot script knows when
// to capture.

import { getBounties, getBounty, getLeaderboard, getProfile, netstat } from './api.js';
import { esc } from './format.js';

const app = document.getElementById('app');
const netstatEl = document.getElementById('netstat');

/** The footer's live request count: what this visit cost the API. */
function showNetstat() {
  const { sent, cached, revalidated } = netstat;
  const bits = [`${sent} request${sent === 1 ? '' : 's'} sent`];
  if (cached) bits.push(`${cached} served from cache`);
  if (revalidated) bits.push(`${revalidated} revalidated (304)`);
  netstatEl.textContent = `${bits.join(' · ')} this visit.`;
}

/** Mark the current nav link. */
function markNav(route) {
  for (const a of document.querySelectorAll('[data-nav]')) {
    if (a.dataset.nav === route) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
}

/** Sort and filter the board's rows without another request. */
function wireBoard(items, boardRows, sortBoard) {
  const q = document.getElementById('q');
  const sort = document.getElementById('sort');
  const rows = document.getElementById('rows');
  const count = document.getElementById('count');
  if (!q || !sort || !rows) return;
  const apply = () => {
    const needle = q.value.trim().toLowerCase();
    const filtered = items.filter((b) =>
      !needle ||
      [b.title, b.category, b.slug, b.sponsor?.name].join(' ').toLowerCase().includes(needle),
    );
    rows.innerHTML = boardRows(sortBoard(filtered, sort.value));
    count.textContent = `${filtered.length} of ${items.length} shown`;
  };
  q.addEventListener('input', apply);
  sort.addEventListener('change', apply);
  apply();
}

function notFound() {
  return `
    <h1>Not found</h1>
    <p class="lede">That page does not exist here.</p>
    <p><a class="btn primary" href="#/">Back to the board</a></p>`;
}

function errorView(error) {
  return `
    <h1>Could not load</h1>
    <div class="error"><p>make.fun did not answer: ${esc(error?.message ?? 'network error')}.</p>
    <p><a href="${esc(location.hash || '#/')}">Try again</a> · <a href="#/">Back to the board</a></p></div>`;
}

async function render() {
  window.__shotReady = false;
  app.innerHTML = '<p class="loading">Loading…</p>';
  const [hash, query] = (location.hash || '#/').split('?');
  const params = new URLSearchParams(query ?? '');
  try {
    if (hash === '#/' || hash === '' || hash === '#') {
      markNav('board');
      document.title = 'Pitlane — fast make.fun bounties';
      const [data, view] = await Promise.all([getBounties(), import('./views-board.js')]);
      app.innerHTML = view.board(data);
      wireBoard(data.items ?? [], view.boardRows, view.sortBoard);
    } else if (/^#\/bounty\/[^/]+\/leaderboard$/.test(hash)) {
      const slug = decodeURIComponent(hash.split('/')[2]);
      markNav('bounty');
      const [data, view] = await Promise.all([getLeaderboard(slug), import('./views-leaderboard.js')]);
      document.title = `Leaderboard · ${data.competition?.title ?? slug} | Pitlane`;
      app.innerHTML = view.leaderboard(data, Number(params.get('page')) || 1);
    } else if (/^#\/bounty\/[^/]+$/.test(hash)) {
      const slug = decodeURIComponent(hash.split('/')[2]);
      markNav('bounty');
      const [b, view] = await Promise.all([getBounty(slug), import('./views-bounty.js')]);
      document.title = `${b.title} | Pitlane`;
      app.innerHTML = view.bounty(b);
    } else if (/^#\/u\/[^/]+$/.test(hash)) {
      const handle = decodeURIComponent(hash.split('/')[2]);
      const [p, view] = await Promise.all([getProfile(handle), import('./views-profile.js')]);
      document.title = `@${p.handle} | Pitlane`;
      app.innerHTML = view.profile(p);
    } else {
      document.title = 'Not found | Pitlane';
      app.innerHTML = notFound();
    }
  } catch (error) {
    document.title = 'Could not load | Pitlane';
    app.innerHTML = errorView(error);
  }
  showNetstat();
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener('hashchange', render);
render();
