// The public pages every game needs for the App Store: a privacy policy (linked in App Store Connect and
// in each game's settings) and a support page. One small static site covers every game.
// Edit config.json (developer name as it appears on the App Store, contact email), then:
//   node build.mjs   → docs/, then commit and push: GitHub Pages serves docs/ on main of
//   github.com/gamingandemails-netizen/games at https://gamingandemails-netizen.github.io/games/
// URLs: <site>/<slug>/privacy.html and <site>/support.html.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(readFileSync(join(here, 'config.json'), 'utf8'));
const out = join(here, 'docs');
const unfilled = [cfg.developer, cfg.email].filter((v) => v.startsWith('['));
if (unfilled.length) console.warn(`config.json still has placeholders: ${unfilled.join(', ')}`);

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const mail = `<a href="mailto:${esc(cfg.email)}">${esc(cfg.email)}</a>`;

const page = (title, body, root = '') => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<style>
  :root { --bg: #fbfaf7; --text: #1d1d22; --muted: #5d5d68; --line: #e4e1da; --link: #1f5fbf; }
  @media (prefers-color-scheme: dark) { :root { --bg: #15161a; --text: #ecebe8; --muted: #a4a3ad; --line: #2c2d33; --link: #7fb0ff; } }
  body { margin: 0; background: var(--bg); color: var(--text); font: 17px/1.6 system-ui, -apple-system, 'Segoe UI', sans-serif; }
  main { max-width: 680px; margin: 0 auto; padding: 40px 16px 64px; }
  h1 { font-size: 1.7rem; line-height: 1.25; margin: 0 0 4px; }
  h2 { font-size: 1.1rem; margin: 28px 0 6px; }
  p, li { margin: 0 0 12px; }
  .muted { color: var(--muted); }
  a { color: var(--link); }
  nav { border-top: 1px solid var(--line); margin-top: 40px; padding-top: 16px; font-size: .95rem; }
</style>
</head>
<body><main>
${body}
<nav class="muted"><a href="${root}support.html">Support</a> · ${cfg.games.map((g) => `<a href="${root}${g.slug}/privacy.html">${esc(g.name)} privacy</a>`).join(' · ')}</nav>
</main></body>
</html>
`;

const privacy = (g) => page(`${g.name} Privacy Policy`, `
<h1>${esc(g.name)} Privacy Policy</h1>
<p class="muted">Last updated: ${esc(cfg.updated)}</p>
<p>${esc(g.name)} ("the game") is made by ${esc(cfg.developer)} ("we"). This policy explains what information the game uses.</p>

<h2>Information we collect</h2>
<p>We do not collect personal information. The game has no accounts, and we do not ask for your name, email address or contacts. Your game progress (such as ${esc(g.progress)}) is stored only on your device, and deleting the game deletes it.</p>

<h2>Advertising</h2>
<p>The game shows ads provided by Google AdMob. To show ads, measure them and prevent fraud, Google's software may collect information from your device. This can include the advertising identifier (if you allow tracking), your device's IP address and approximate location derived from it, device and app information, and interactions with ads.</p>
<p>On iOS, the game asks for your permission before any tracking, through Apple's App Tracking Transparency prompt. You can change this at any time in your device's Settings, under Privacy &amp; Security → Tracking.</p>
<p>In regions where consent is required (such as the EU, the UK and some US states), the game asks for your choices before showing ads. You can change them later with the "Ad privacy choices" button in ${esc(g.menu)}.</p>
<p>How Google uses this information: <a href="https://policies.google.com/technologies/partner-sites">policies.google.com/technologies/partner-sites</a>.</p>

<h2>Children</h2>
<p>The game is not directed at children under 13, and we do not knowingly collect personal information from children.</p>

<h2>Changes</h2>
<p>If this policy changes, the updated version will be posted at this address with a new date.</p>

<h2>Contact</h2>
<p>Questions: ${mail}</p>
`, '../');

const support = page('Support', `
<h1>Support</h1>
<p>Games by ${esc(cfg.developer)}.</p>
<p>Found a bug, lost progress, or have an idea? Email ${mail} with the game's name, your device and iOS version, and what happened. Progress is saved on your device, so deleting a game also deletes its progress.</p>
<h2>Games</h2>
<ul>${cfg.games.map((g) => `<li>${esc(g.name)}: <a href="${g.slug}/privacy.html">privacy policy</a></li>`).join('')}</ul>
`);

rmSync(out, { recursive: true, force: true });
for (const g of cfg.games) {
  mkdirSync(join(out, g.slug), { recursive: true });
  writeFileSync(join(out, g.slug, 'privacy.html'), privacy(g));
}
writeFileSync(join(out, 'support.html'), support);
writeFileSync(join(out, 'index.html'), support.replace('<title>Support</title>', `<title>${esc(cfg.developer)} games</title>`));
writeFileSync(join(out, '.nojekyll'), ''); // GitHub Pages: serve the files as they are
console.log(`Built ${out}`);
