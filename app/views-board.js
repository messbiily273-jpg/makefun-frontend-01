// The board page: the live bounties, loaded on demand for this route.
// All text from the API is escaped; links are real links.

import { esc, fee, money, openPill, plural, pot, stillOpen, timeLeft } from './format.js';

/** One board row. */
function row(b) {
  const left = new Date(b.deadline).getTime() - Date.now();
  const timeClass = left <= 0 ? 'time over' : left < 86400000 ? 'time soon' : 'time';
  return `
      <li>
        <span class="t"><a href="#/bounty/${encodeURIComponent(b.slug)}">${esc(b.title)}</a>
          <span class="cat">${esc(b.category ?? '')} · ${openPill(b)}</span></span>
        <span class="pot">${pot(b)}</span>
        <span class="fee">${fee(b)}</span>
        <span class="${timeClass}">${timeLeft(b.deadline)}</span>
        <span class="entries">${plural(b.submissionCount, 'entry', 'entries')}</span>
      </li>`;
}

/** The board's rows only, so search and sort re-render the list, not the page. */
export function boardRows(items) {
  if (!items.length) return '<li><p class="muted">No bounties match.</p></li>';
  return items.map(row).join('');
}

/** The board page: toolbar plus the rows. */
export function board(data) {
  const items = data.items ?? [];
  const totalPot = items.reduce((sum, b) => sum + Number(b.potUsd ?? b.rewardAmount ?? 0), 0);
  return `
    <h1>Open bounties</h1>
    <p class="lede">${plural(items.length, 'bounty', 'bounties')} open · ${money(totalPot)} in live pots. Every pot already includes the entry fees paid into it.</p>
    <div class="toolbar">
      <label for="q">Search</label>
      <input type="search" id="q" placeholder="Filter by title, category or sponsor…" autocomplete="off">
      <label for="sort">Sort</label>
      <select id="sort">
        <option value="closing">Closing soonest</option>
        <option value="pot">Biggest pot</option>
        <option value="entries">Most entries</option>
        <option value="newest">Newest</option>
      </select>
      <span class="count" id="count" aria-live="polite"></span>
    </div>
    <ul class="board" id="rows">${boardRows(items)}</ul>`;
}

/** Sort the board's rows: still-open bounties first, then by the chosen key. */
export function sortBoard(items, by) {
  const potOf = (b) => Number(b.potUsd ?? b.rewardAmount ?? 0);
  return [...items].sort((a, b) => {
    const openDiff = Number(stillOpen(b)) - Number(stillOpen(a));
    if (openDiff) return openDiff;
    if (by === 'pot') return potOf(b) - potOf(a);
    if (by === 'entries') return (b.submissionCount ?? 0) - (a.submissionCount ?? 0);
    if (by === 'newest') return new Date(b.publishedAt) - new Date(a.publishedAt);
    return new Date(a.deadline) - new Date(b.deadline);
  });
}
