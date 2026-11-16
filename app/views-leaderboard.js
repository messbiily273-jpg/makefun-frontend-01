// A bounty's leaderboard: rank, entrant, judge win rate with its 90%
// interval, W/D/L, prize place and dossier size. Loaded on demand for this
// route; 25 rows a page, paged client-side from the one fetch.

import { apiImage, bytes, esc, plural, rate } from './format.js';

const PAGE_SIZE = 25;

/** One leaderboard row. */
function entryRow(e) {
  const judge = e.judge ?? {};
  const values = e.values ?? {};
  const pct = Number(values.judge ?? 0) / 10000;
  const low = Number(e.interval?.low ?? values.judge_low ?? 0) / 10000;
  const high = Number(e.interval?.high ?? values.judge_high ?? 0) / 10000;
  const img = apiImage(e.image);
  return `
      <tr>
        <td class="num"><b>${e.rank ?? '—'}</b></td>
        <td><span class="who">${img ? `<img class="avatar" src="${esc(img)}" alt="" crossorigin="anonymous" loading="lazy" decoding="async">` : ''}<a class="handle" href="#/u/${encodeURIComponent(e.handle)}">${esc(e.handle)}</a></span>
          <br><span class="small muted">${esc(e.title ?? '')}</span></td>
        <td><span class="rate">${rate(values.judge)}</span>
          <div class="bar" role="img" aria-label="90 percent interval ${low.toFixed(1)} to ${high.toFixed(1)} percent"><i style="width:${pct}%"></i></div>
          <span class="small muted">${low.toFixed(1)}–${high.toFixed(1)}%</span></td>
        <td class="num">${judge.wins ?? '—'}/${judge.draws ?? '—'}/${judge.losses ?? '—'}</td>
        <td class="num">${e.prize_rank ?? '—'}</td>
        <td class="num">${bytes(values.bytes)}</td>
      </tr>`;
}

/** The leaderboard page, one page of 25 rows at a time. */
export function leaderboard(data, page) {
  const entries = data.entries ?? [];
  const pages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const current = Math.min(Math.max(page || 1, 1), pages);
  const slice = entries.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const slug = data.competition?.slug ?? '';
  const base = `#/bounty/${encodeURIComponent(slug)}/leaderboard`;
  const pageLink = (p) => `${base}?page=${p}`;
  const buttons = [];
  for (let p = 1; p <= pages; p += 1) {
    if (pages > 7 && p > 2 && p < pages - 1 && Math.abs(p - current) > 1) {
      if (buttons[buttons.length - 1] !== '…') buttons.push('…');
      continue;
    }
    buttons.push(p);
  }
  return `
    <p><a href="#/bounty/${encodeURIComponent(slug)}">← ${esc(data.competition?.title ?? 'Bounty')}</a></p>
    <h1>Leaderboard</h1>
    <p class="lede">${esc(data.title ?? '')} · ${plural(entries.length, 'ranked entry', 'ranked entries')}${data.phase?.scores_visible ? '' : ' · scores update as entries are judged'}.</p>
    <div class="wrap"><table>
      <thead><tr><th class="num">#</th><th>Entrant</th><th>Win rate</th><th class="num">W/D/L</th><th class="num">Prize</th><th class="num">Size</th></tr></thead>
      <tbody>${slice.map(entryRow).join('')}</tbody>
    </table></div>
    <nav class="pager" aria-label="Leaderboard pages">
      <a class="btn" ${current > 1 ? `href="${pageLink(current - 1)}"` : 'aria-disabled="true"'}>← Prev</a>
      ${buttons
        .map((p) => (p === '…' ? '<span aria-hidden="true">…</span>' : `<a class="btn" ${p === current ? 'aria-current="page"' : ''} href="${pageLink(p)}">${p}</a>`))
        .join('')}
      <a class="btn" ${current < pages ? `href="${pageLink(current + 1)}"` : 'aria-disabled="true"'}>Next →</a>
      <span class="count">Page ${current} of ${pages}</span>
    </nav>`;
}
