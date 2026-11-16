// A bounty's page: summary, live rewards table, dates and rules.
// Loaded on demand for this route. All text from the API is escaped.

import { date, esc, markdown, money, openPill, plural, pot, timeLeft } from './format.js';

/** The rewards table: the live split when the API reports it, else the base table. */
function rewardsTable(b) {
  const live = Array.isArray(b.rewardsNow) && b.rewardsNow.length > 0;
  const ordinal = (n) => (n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`);
  const rows = live
    ? b.rewardsNow.map(
        (r) => `<tr><td>${ordinal(Number(r.place))}</td><td class="num">${money(r.baseUsd)}</td><td class="num">${money(r.feeShareUsd)}</td><td class="num"><b>${money(r.amountUsd)}</b></td></tr>`,
      )
    : Object.entries(b.rewards ?? {}).map(
        ([place, amount]) => `<tr><td>${ordinal(Number(place))}</td><td class="num">${money(amount)}</td><td class="num">—</td><td class="num"><b>${money(amount)}</b></td></tr>`,
      );
  return `
    <div class="wrap"><table>
      <thead><tr><th>Place</th><th class="num">Prize</th><th class="num">Fee share</th><th class="num">Total</th></tr></thead>
      <tbody>${rows.join('')}</tbody>
    </table></div>
    ${live ? `<p class="small muted">Pot ${money(b.potUsd)} = ${money(b.rewardAmount)} prize + ${money(b.entryFeesUsd)} from ${plural(b.entryFeePayers, 'entry fee', 'entry fees')}.</p>` : ''}`;
}

export function bounty(b) {
  return `
    <p><a href="#/">← All bounties</a></p>
    <h1>${esc(b.title)}</h1>
    <p class="lede">${esc(b.summary ?? '')}</p>
    <p>${openPill(b)} <span class="muted">${esc(b.category ?? '')} · by ${esc(b.sponsor?.name ?? 'make.fun')}</span></p>
    <ul class="stats">
      <li><b>${pot(b)}</b><span>live pot</span></li>
      <li><b>${b.entryFeeUsd ? money(b.entryFeeUsd) : 'Free'}</b><span>entry fee</span></li>
      <li><b>${timeLeft(b.deadline)}</b><span>time left</span></li>
      <li><b>${plural(b.submissionCount, 'entry', 'entries')}</b><span>entries</span></li>
    </ul>
    <p><a class="btn primary" href="#/bounty/${encodeURIComponent(b.slug)}/leaderboard">View leaderboard</a></p>
    <h2>Rewards</h2>
    ${rewardsTable(b)}
    <h2>Dates</h2>
    <p>Opens ${date(b.publishedAt)} · closes ${date(b.deadline)} (${timeLeft(b.deadline)}).</p>
    ${Array.isArray(b.skills) && b.skills.length ? `<h2>Skills</h2><p>${b.skills.map(esc).join(' · ')}</p>` : ''}
    <h2>Rules</h2>
    <div class="desc">${markdown(b.description ?? '')}</div>`;
}
