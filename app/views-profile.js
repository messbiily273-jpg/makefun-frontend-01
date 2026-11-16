// An account's public profile: avatar, links, record and entries.
// Loaded on demand for this route. All text from the API is escaped.

import { apiImage, date, esc, money } from './format.js';

export function profile(p) {
  const record = p.record ?? {};
  const img = apiImage(p.image ?? p.avatar);
  const links = [];
  if (p.github_login) links.push(`<li><a href="https://github.com/${encodeURIComponent(p.github_login)}">GitHub</a></li>`);
  if (p.x) links.push(`<li><a href="https://x.com/${encodeURIComponent(typeof p.x === 'string' ? p.x : p.x.handle ?? '')}">X</a></li>`);
  if (p.discord?.url) links.push(`<li><a href="${esc(p.discord.url)}">Discord</a></li>`);
  if (p.wallet?.explorer_url) links.push(`<li><a href="${esc(p.wallet.explorer_url)}">Wallet</a></li>`);
  const solutions = (p.solutions ?? []).map(
    (s) => `
      <tr>
        <td><b>${esc(s.title ?? '')}</b><br><a href="#/bounty/${encodeURIComponent(s.competition?.slug ?? '')}">${esc(s.competition?.title ?? '')}</a></td>
        <td class="num">${s.placement ?? '—'}</td>
        <td class="num">${s.prize_usd ? money(s.prize_usd) : '—'}</td>
      </tr>`,
  );
  return `
    <p><a href="#/">← All bounties</a></p>
    <div class="who">
      ${img ? `<img class="avatar big" src="${esc(img)}" alt="" crossorigin="anonymous" loading="lazy" decoding="async">` : ''}
      <span><span class="name">${esc(p.display_name ?? p.handle)}</span><br><span class="at">@${esc(p.handle)}</span></span>
    </div>
    ${p.bio ? `<p>${esc(p.bio)}</p>` : ''}
    ${links.length ? `<ul class="links">${links.join('')}</ul>` : ''}
    <p class="small muted">Joined ${date(p.joined_at)}</p>
    <ul class="stats">
      <li><b>${record.competitions_entered ?? 0}</b><span>entered</span></li>
      <li><b>${record.competitions_placed ?? 0}</b><span>placed</span></li>
      <li><b>${record.competitions_won ?? 0}</b><span>won</span></li>
      <li><b>${record.best_placement ?? '—'}</b><span>best place</span></li>
      <li><b>${money(record.prize_usd ?? 0)}</b><span>prizes</span></li>
    </ul>
    <h2>Entries</h2>
    ${
      solutions.length
        ? `<div class="wrap"><table>
        <thead><tr><th>Entry</th><th class="num">Place</th><th class="num">Prize</th></tr></thead>
        <tbody>${solutions.join('')}</tbody>
      </table></div>`
        : '<p class="muted">No entries yet.</p>'
    }`;
}
