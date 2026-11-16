// Small helpers for showing API values. No dependencies.

/** Text made safe to put inside HTML. */
export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/** A dollar amount ('1000.00' or 0.5) as '$1,000' or '$0.50'. */
export function money(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
  });
}

/** A deadline as a date in UTC. */
export function date(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })} UTC`;
}

/** The time until a deadline: '2d 4h left', '35m left', or 'ended'. */
export function timeLeft(iso) {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return 'ended';
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

/** Whether a bounty still takes entries: by its deadline, not its status alone. */
export function stillOpen(bounty) {
  return new Date(bounty.deadline).getTime() > Date.now();
}

/** A win rate in millionths (950587) as '95.1%'. */
export function rate(micro) {
  if (micro == null) return '—';
  return `${(Number(micro) / 10000).toFixed(1)}%`;
}

/** A byte count as '648 KB'. */
export function bytes(n) {
  if (n == null) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1048576).toFixed(1)} MB`;
}

/** '1 entry' or '230 entries'. */
export function plural(n, one, many) {
  return `${Number(n ?? 0).toLocaleString('en-US')} ${Number(n) === 1 ? one : many}`;
}

/** A bounty description's light markdown (headings, lists, paragraphs) as safe HTML. */
export function markdown(text) {
  const lines = String(text ?? '').split('\n');
  let html = '';
  let list = false;
  const closeList = () => {
    if (list) {
      html += '</ul>';
      list = false;
    }
  };
  for (const line of lines) {
    if (/^##\s+/.test(line)) {
      closeList();
      html += `<h2>${esc(line.replace(/^##\s+/, ''))}</h2>`;
    } else if (/^###\s+/.test(line)) {
      closeList();
      html += `<h3>${esc(line.replace(/^###\s+/, ''))}</h3>`;
    } else if (/^[-*]\s+/.test(line)) {
      if (!list) {
        html += '<ul>';
        list = true;
      }
      html += `<li>${esc(line.replace(/^[-*]\s+/, ''))}</li>`;
    } else if (line.trim() === '') {
      closeList();
    } else {
      closeList();
      html += `<p>${esc(line)}</p>`;
    }
  }
  closeList();
  return html;
}

/** The reward as it stands now: the live pot when the API reports one, else the prize. */
export function pot(b) {
  return money(b.potUsd ?? b.rewardAmount);
}

/** The entry fee, when the bounty charges one. */
export function fee(b) {
  return b.entryFeeUsd ? `${money(b.entryFeeUsd)} fee` : 'no fee';
}

/** Open / ending soon / ended, judged by the deadline, not the status alone. */
export function openPill(b) {
  if (!stillOpen(b)) return '<span class="pill over">entries closed</span>';
  const ms = new Date(b.deadline).getTime() - Date.now();
  if (ms < 86400000) return '<span class="pill paid">ending soon</span>';
  return '<span class="pill open">open</span>';
}

/** An image URL the API points at, made absolute (avatars live on make.fun). */
export function apiImage(path) {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  return `https://make.fun${path.startsWith('/') ? '' : '/'}${path}`;
}
