const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = path.join(__dirname, 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(path.join(DATA_DIR, 'tunengineers.db'));
db.exec('PRAGMA journal_mode = WAL');

function inTransaction(fn) {
  db.exec('BEGIN');
  try { fn(); db.exec('COMMIT'); } catch (e) { db.exec('ROLLBACK'); throw e; }
}

// Deux tables indépendantes : engineers et companies
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
`);

// ---- Données de départ ----
const companiesCount = db.prepare('SELECT COUNT(*) AS n FROM companies').get().n;
if (companiesCount === 0) {
  const ins = db.prepare('INSERT INTO companies (nom, secteur, ville, site_web) VALUES (?,?,?,?)');
  const rows = [
    ['Tunisie Telecom', 'Télécoms', 'Tunis', 'https://www.tunisietelecom.tn'],
    ['Ooredoo Tunisie', 'Télécoms', 'Tunis', 'https://www.ooredoo.tn'],
    ['Orange Tunisie', 'Télécoms', 'Tunis', 'https://www.orange.tn'],
    ['Vermeg', 'Informatique', 'Tunis', 'https://www.vermeg.com'],
    ['Sofrecom Tunisie', 'Informatique', 'Tunis', 'https://www.sofrecom.com'],
    ['Telnet Holding', 'Informatique', 'Ariana', 'https://www.telnet.com.tn'],
    ['Focus Corporation', 'Informatique', 'Tunis', 'https://www.focus.com.tn'],
    ['Proxym Group', 'Informatique', 'Sousse', 'https://www.proxym-group.com'],
    ['Sartex', 'Industrie', 'Sfax', 'https://www.sartex.com.tn'],
    ['Poulina Group Holding', 'Industrie', 'Ben Arous', 'https://www.poulinagh.com'],
    ['Délice Danone', 'Industrie', 'Ben Arous', 'https://www.delice.tn'],
    ['STEG', 'Énergie', 'Tunis', 'https://www.steg.com.tn'],
    ['ETAP', 'Énergie', 'Tunis', 'https://www.etap.com.tn'],
    ['Star Oil Tunisie', 'Énergie', 'Tunis', 'https://www.staroil.com.tn'],
    ['Leoni Tunisie', 'Automobile', 'Sousse', 'https://www.leoni.com'],
    ['Yazaki Tunisie', 'Automobile', 'Bizerte', 'https://www.yazaki-europe.com'],
    ['Stellantis Tunisie', 'Automobile', 'Ben Arous', 'https://www.stellantis.com'],
    ['Lear Corporation Tunisie', 'Automobile', 'Bizerte', 'https://www.lear.com'],
  ];
  inTransaction(() => rows.forEach((r) => ins.run(...r)));
}

const engCount = db.prepare('SELECT COUNT(*) AS n FROM engineers').get().n;
if (engCount === 0 && process.env.SEED_DEMO !== '0') {
  // Profils de démonstration (fictifs) – supprimez-les en production avec SEED_DEMO=0
  const ins = db.prepare(`INSERT INTO engineers
    (nom, domaine, competences, ville, experience, linkedin, email, telephone, consentement, statut)
    VALUES (?,?,?,?,?,?,?,?,1,?)`);
  const rows = [
    ['Amine Mejri', 'Informatique', 'Angular,Node.js,SQL,DevOps', 'Tunis', '3 à 5 ans', 'https://www.linkedin.com/in/amine-mejri-demo', 'amine.mejri@exemple.tn', '+216 20 000 001', 'approuve'],
    ['Salma Ben Ali', 'Génie civil', 'AutoCAD,Revit,Béton armé', 'Sfax', '3 à 5 ans', 'https://www.linkedin.com/in/salma-benali-demo', 'salma.benali@exemple.tn', '+216 20 000 002', 'approuve'],
    ['Yassine Trabelsi', 'Électrique', 'SCADA,Automates,Schémas', 'Sousse', '6 à 10 ans', 'https://www.linkedin.com/in/yassine-trabelsi-demo', 'yassine.trabelsi@exemple.tn', '+216 20 000 003', 'approuve'],
    ['Nour Haddad', 'Télécoms', '5G,Réseaux,Python', 'Tunis', '1 à 2 ans', 'https://www.linkedin.com/in/nour-haddad-demo', 'nour.haddad@exemple.tn', '+216 20 000 004', 'approuve'],
    ['Lina Mansour', 'Industriel', 'Lean,Six Sigma,Supply chain', 'Bizerte', '3 à 5 ans', 'https://www.linkedin.com/in/lina-mansour-demo', 'lina.mansour@exemple.tn', '+216 20 000 005', 'approuve'],
    ['Rami Gharbi', 'Énergie', 'Solaire,Efficacité énergétique', 'Gabès', '6 à 10 ans', 'https://www.linkedin.com/in/rami-gharbi-demo', 'rami.gharbi@exemple.tn', '+216 20 000 006', 'approuve'],
    ['Oussama Zied', 'Chimie', 'Procédés,Qualité,HSE', 'Monastir', '6 à 10 ans', 'https://www.linkedin.com/in/oussama-zied-demo', 'oussama.zied@exemple.tn', '+216 20 000 007', 'approuve'],
    ['Mariem Chaabane', 'Mécanique', 'SolidWorks,CAO,Fabrication', 'Nabeul', '1 à 2 ans', 'https://www.linkedin.com/in/mariem-chaabane-demo', 'mariem.chaabane@exemple.tn', '+216 20 000 008', 'approuve'],
    ['Karim Jlassi', 'Informatique', 'Python,Machine Learning,Docker', 'Ariana', '3 à 5 ans', 'https://www.linkedin.com/in/karim-jlassi-demo', 'karim.jlassi@exemple.tn', '+216 20 000 009', 'en_attente'],
    ['Hajer Bouzid', 'Génie civil', 'Topographie,Route,Structures', 'Kairouan', '1 à 2 ans', 'https://www.linkedin.com/in/hajer-bouzid-demo', 'hajer.bouzid@exemple.tn', '+216 20 000 010', 'en_attente'],
    ['Walid Sassi', 'Électrique', 'Électronique,Embarqué,C', 'Tunis', '3 à 5 ans', 'https://www.linkedin.com/in/walid-sassi-demo', 'walid.sassi@exemple.tn', '+216 20 000 011', 'refuse'],
  ];
  inTransaction(() => rows.forEach((r) => ins.run(...r)));
}

module.exports = db;
