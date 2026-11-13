const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');
const { COMPANIES, ENGINEERS, slug, strip } = require('./seed-data');

const DATA_DIR = path.join(__dirname, 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(path.join(DATA_DIR, 'tunengineers.db'));
db.exec('PRAGMA journal_mode = WAL');

function inTransaction(fn) {
  db.exec('BEGIN');
  try { fn(); db.exec('COMMIT'); } catch (e) { db.exec('ROLLBACK'); throw e; }
}

// Deux tables indépendantes : engineers et companies (+ une petite table technique pour le suivi des données de départ)
db.exec(`
CREATE TABLE IF NOT EXISTS engineers (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  date_inscription TEXT    NOT NULL DEFAULT (datetime('now')),
  nom              TEXT    NOT NULL,
  photo            TEXT,
  domaine          TEXT    NOT NULL,
  competences      TEXT    NOT NULL DEFAULT '',
  ville            TEXT    NOT NULL,
  experience       TEXT    NOT NULL,
  linkedin         TEXT,
  email            TEXT    NOT NULL,
  telephone        TEXT,
  diplome_preuve   TEXT,
  consentement     INTEGER NOT NULL CHECK (consentement IN (0,1)),
  statut           TEXT    NOT NULL DEFAULT 'en_attente'
                   CHECK (statut IN ('en_attente','approuve','refuse'))
);
CREATE INDEX IF NOT EXISTS idx_eng_statut ON engineers(statut);

CREATE TABLE IF NOT EXISTS companies (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  nom      TEXT NOT NULL,
  secteur  TEXT NOT NULL,
  ville    TEXT NOT NULL,
  site_web TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  date    TEXT    NOT NULL DEFAULT (datetime('now')),
  nom     TEXT    NOT NULL,
  email   TEXT    NOT NULL,
  sujet   TEXT    NOT NULL,
  message TEXT    NOT NULL,
  lu      INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`);

// ---- Données de départ (exécutées une seule fois par version, sans doublons) ----
const SEED_VERSION = '2';
const done = db.prepare("SELECT value FROM meta WHERE key = 'seed_version'").get();

if (!done || done.value !== SEED_VERSION) {
  inTransaction(() => {
    // Entreprises : ajoutées si le nom n'existe pas encore (les données existantes ne sont pas touchées)
    const hasCo = db.prepare('SELECT 1 FROM companies WHERE nom = ?');
    const insCo = db.prepare('INSERT INTO companies (nom, secteur, ville, site_web) VALUES (?,?,?,?)');
    for (const c of COMPANIES) if (!hasCo.get(c[0])) insCo.run(...c);

    // Profils de démonstration (fictifs) – désactivables avec SEED_DEMO=0
    if (process.env.SEED_DEMO !== '0') {
      const byEmail = db.prepare('SELECT id, photo FROM engineers WHERE email = ?');
      const insEng = db.prepare(`INSERT INTO engineers
        (nom, photo, domaine, competences, ville, experience, linkedin, email, telephone, consentement, statut)
        VALUES (?,?,?,?,?,?,?,?,?,1,?)`);
      const setPhoto = db.prepare('UPDATE engineers SET photo = ? WHERE id = ?');

      ENGINEERS.forEach(([nom, , domaine, competences, ville, experience, statut], i) => {
        const parts = strip(nom).toLowerCase().split(/\s+/);
        const email = `${parts[0]}.${parts.slice(1).join('')}@exemple.tn`;
        const photo = `/avatars/${slug(nom)}.svg`;
        const existing = byEmail.get(email);
        if (existing) {
          if (!existing.photo) setPhoto.run(photo, existing.id); // ajoute l'image aux anciens profils démo
          return;
        }
        const tel = `+216 2${i % 10} ${String(100 + i * 7).padStart(3, '0')} ${String(200 + i * 13).padStart(3, '0')}`;
        insEng.run(nom, photo, domaine, competences, ville, experience,
          `https://www.linkedin.com/in/${slug(nom)}-demo`, email, tel, statut);
      });
    }
    db.prepare("INSERT OR REPLACE INTO meta (key, value) VALUES ('seed_version', ?)").run(SEED_VERSION);
  });
}

module.exports = db;
