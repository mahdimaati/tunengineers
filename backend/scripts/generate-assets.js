// Génère : logos monogrammes des entreprises (public/logos) et avatars illustrés des ingénieurs (public/avatars).
// Ce sont des images ORIGINALES, pas les logos officiels : remplacez un logo en déposant
// un fichier du même nom (ex. public/logos/vermeg.png) — le serveur préfère png/webp/jpg à svg.
// Usage : node scripts/generate-assets.js
const fs = require('fs');
const path = require('path');
const { COMPANIES, ENGINEERS, slug, strip } = require('../seed-data');

const OUT = path.join(__dirname, '..', 'public');
const LOGOS = path.join(OUT, 'logos');
const AVATARS = path.join(OUT, 'avatars');
fs.mkdirSync(LOGOS, { recursive: true });
fs.mkdirSync(AVATARS, { recursive: true });

const hash = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const pick = (arr, h, shift) => arr[(h >>> shift) % arr.length];
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

// ---------- Logos ----------
const LOGO_COLORS = ['#4f46e5', '#0b1437', '#047857', '#0e7490', '#6d28d9', '#be123c', '#b45309', '#1d4ed8', '#0f766e'];
function initials(nom) {
  const words = strip(nom).replace(/[^A-Za-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
  const skip = new Set(['de', 'du', 'la', 'le', 'group', 'groupe', 'holding', 'tunisie', 'corporation']);
  const main = words.filter((w) => !skip.has(w.toLowerCase()));
  const w = main.length ? main : words;
  return (w.length > 1 ? w[0][0] + w[1][0] : w[0].slice(0, 2)).toUpperCase();
}
for (const [nom] of COMPANIES) {
  const h = hash(nom);
  const bg = pick(LOGO_COLORS, h, 0);
  const t = esc(initials(nom));
  fs.writeFileSync(path.join(LOGOS, slug(nom) + '.svg'),
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">
<rect width="96" height="96" rx="20" fill="${bg}"/>
<circle cx="78" cy="18" r="7" fill="#22d3ee"/>
<text x="48" y="62" text-anchor="middle" font-family="Poppins, Arial, sans-serif" font-weight="700" font-size="${t.length > 1 ? 36 : 44}" fill="#ffffff">${t}</text>
</svg>
`);
}

// ---------- Avatars ----------
const BG = ['#c7d2fe', '#a5f3fc', '#fbcfe8', '#bbf7d0', '#fde68a', '#ddd6fe', '#fecaca', '#bae6fd'];
const SKIN = ['#f5d0b0', '#e8b98a', '#d39b6c', '#b97a4f', '#8d5a36'];
const HAIR = ['#1f2937', '#3b2a20', '#5a3b25', '#0f172a', '#6b4a2f'];
const SHIRT = ['#4f46e5', '#0b1437', '#047857', '#0e7490', '#6d28d9', '#334155'];

function avatar(nom, genre) {
  const h = hash(nom);
  const bg = pick(BG, h, 0), skin = pick(SKIN, h, 3), hair = pick(HAIR, h, 5), shirt = pick(SHIRT, h, 7);
  const style = genre === 'F' ? pick(['long', 'bun', 'bob'], h, 9) : pick(['short', 'short', 'side', 'bald'], h, 9);
  const glasses = (h >>> 11) % 4 === 0;
  const back = style === 'long' ? `<path d="M37 62C34 26 94 26 91 62L97 112H31Z" fill="${hair}"/>` : '';
  const top = {
    long: `<path d="M41 58C38 30 90 30 87 58C80 44 48 44 41 58Z" fill="${hair}"/>`,
    bob: `<path d="M39 68C34 26 94 26 89 68C87 49 74 42 64 42C54 42 41 49 39 68Z" fill="${hair}"/>`,
    bun: `<circle cx="64" cy="27" r="9" fill="${hair}"/><path d="M41 58C38 30 90 30 87 58C80 44 48 44 41 58Z" fill="${hair}"/>`,
    short: `<path d="M41 56C38 28 90 28 87 56C81 45 49 45 41 56Z" fill="${hair}"/>`,
    side: `<path d="M41 58C36 27 92 25 87 52C72 41 54 45 41 58Z" fill="${hair}"/>`,
    bald: '',
  }[style];
  const specs = glasses
    ? '<g fill="none" stroke="#1f2937" stroke-width="2"><circle cx="55" cy="60" r="6.5"/><circle cx="73" cy="60" r="6.5"/><path d="M61.5 60h5"/></g>' : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
<defs><clipPath id="c"><circle cx="64" cy="64" r="64"/></clipPath></defs>
<g clip-path="url(#c)">
<rect width="128" height="128" fill="${bg}"/>
${back}
<path d="M14 128C14 100 40 92 64 92C88 92 114 100 114 128Z" fill="${shirt}"/>
<rect x="55" y="78" width="18" height="18" rx="6" fill="${skin}"/>
<ellipse cx="64" cy="58" rx="22" ry="25" fill="${skin}"/>
${top}
<circle cx="55" cy="60" r="2.3" fill="#1f2937"/><circle cx="73" cy="60" r="2.3" fill="#1f2937"/>
${specs}
<path d="M57 71Q64 77 71 71" fill="none" stroke="#1f2937" stroke-width="2" stroke-linecap="round"/>
</g>
</svg>
`;
}
for (const [nom, genre] of ENGINEERS) fs.writeFileSync(path.join(AVATARS, slug(nom) + '.svg'), avatar(nom, genre));

console.log(`Logos : ${COMPANIES.length} · Avatars : ${ENGINEERS.length}`);
