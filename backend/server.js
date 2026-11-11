const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const db = require('./db');

const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

// ---------- Constantes métier ----------
const DOMAINES = ['Informatique', 'Génie civil', 'Électrique', 'Télécoms', 'Industriel', 'Énergie', 'Chimie', 'Mécanique'];
const EXPERIENCES = ['Jeune diplômé', '1 à 2 ans', '3 à 5 ans', '6 à 10 ans', 'Plus de 10 ans'];

// ---------- Admin : mot de passe haché (bcrypt) ----------
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@2026';
const ADMIN_HASH = bcrypt.hashSync(ADMIN_PASSWORD, 12);
if (!process.env.ADMIN_PASSWORD) {
  console.warn('[!] ADMIN_PASSWORD non défini : mot de passe par défaut utilisé (développement uniquement).');
}

// ---------- Dossiers d'upload ----------
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const PHOTO_DIR = path.join(UPLOAD_DIR, 'photos');     // public
const PRIVATE_DIR = path.join(UPLOAD_DIR, 'private');  // diplômes : admin seul
fs.mkdirSync(PHOTO_DIR, { recursive: true });
fs.mkdirSync(PRIVATE_DIR, { recursive: true });

const PHOTO_TYPES = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
const DIPLOME_TYPES = { 'application/pdf': '.pdf', 'image/jpeg': '.jpg', 'image/png': '.png' };

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, file.fieldname === 'photo' ? PHOTO_DIR : PRIVATE_DIR),
    filename: (req, file, cb) => {
      const types = file.fieldname === 'photo' ? PHOTO_TYPES : DIPLOME_TYPES;
      cb(null, crypto.randomBytes(16).toString('hex') + (types[file.mimetype] || ''));
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 2 },
  fileFilter: (req, file, cb) => {
    const types = file.fieldname === 'photo' ? PHOTO_TYPES : file.fieldname === 'diplome' ? DIPLOME_TYPES : null;
    if (!types || !types[file.mimetype]) return cb(new Error('INVALID_FILE_TYPE:' + file.fieldname));
    cb(null, true);
  },
}).fields([{ name: 'photo', maxCount: 1 }, { name: 'diplome', maxCount: 1 }]);

function removeFiles(files) {
  Object.values(files || {}).flat().forEach((f) => fs.unlink(f.path, () => {}));
}

// ---------- App ----------
const app = express();
app.set('trust proxy', 1);
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'same-site' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
}));
app.use(express.json({ limit: '50kb' }));
app.use(session({
  name: 'tun.sid',
  secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'strict', secure: IS_PROD, maxAge: 2 * 60 * 60 * 1000 },
}));

const limiterLogin = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false, message: { error: 'Trop de tentatives. Réessayez plus tard.' } });
const limiterContact = rateLimit({ windowMs: 15 * 60 * 1000, limit: 60, standardHeaders: true, legacyHeaders: false, message: { error: 'Trop de demandes. Réessayez plus tard.' } });
const limiterRegister = rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false, message: { error: "Trop d'inscriptions depuis cette adresse. Réessayez plus tard." } });

// ---------- Helpers ----------
const publicPhoto = (p) => (p ? `/uploads/photos/${p}` : null);

/** Seuls les champs publics sont exposés (jamais email, téléphone, diplôme). */
function toPublic(r) {
  return {
    id: r.id,
    nom: r.nom,
    photo: publicPhoto(r.photo),
    domaine: r.domaine,
    ville: r.ville,
    experience: r.experience,
    competences: r.competences ? r.competences.split(',').map((s) => s.trim()).filter(Boolean) : [],
    linkedin: r.linkedin || null,
  };
}

function toAdmin(r) {
  return {
    id: r.id,
    ...toPublic(r),
    email: r.email,
    telephone: r.telephone,
    consentement: !!r.consentement,
    statut: r.statut,
    date_inscription: r.date_inscription,
    diplome: r.diplome_preuve ? `/api/admin/engineers/${r.id}/diplome` : null,
  };
}

const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);

function requireAdmin(req, res, next) {
  if (req.session && req.session.admin) return next();
  res.status(401).json({ error: 'Authentification requise.' });
}

// ---------- API publique ----------
app.get('/api/meta', (req, res) => {
  res.json({ domaines: DOMAINES, experiences: EXPERIENCES });
});

app.get('/api/stats', (req, res) => {
  const eng = db.prepare("SELECT COUNT(*) AS n, COUNT(DISTINCT domaine) AS d FROM engineers WHERE statut='approuve'").get();
  const comp = db.prepare('SELECT COUNT(*) AS n FROM companies').get();
  res.json({ ingenieurs: eng.n, domaines: eng.d, entreprises: comp.n });
});

app.get('/api/engineers', (req, res) => {
  const q = clean(req.query.q, 80);
  const domaine = clean(req.query.domaine, 40);
  const ville = clean(req.query.ville, 40);
  const limit = Math.min(parseInt(req.query.limit, 10) || 100, 100);

  const where = ["statut = 'approuve'"];
  const params = [];
  if (domaine) { where.push('domaine = ?'); params.push(domaine); }
  if (ville) { where.push('ville = ?'); params.push(ville); }
  if (q) {
    where.push('(nom LIKE ? OR competences LIKE ? OR domaine LIKE ?)');
    const like = `%${q.replace(/[%_]/g, '')}%`;
    params.push(like, like, like);
  }
  const rows = db.prepare(`SELECT * FROM engineers WHERE ${where.join(' AND ')} ORDER BY date_inscription DESC, id DESC LIMIT ?`).all(...params, limit);
  res.json(rows.map(toPublic));
});

app.get('/api/engineers/villes', (req, res) => {
  const rows = db.prepare("SELECT DISTINCT ville FROM engineers WHERE statut='approuve' ORDER BY ville").all();
  res.json(rows.map((r) => r.ville));
});

app.get('/api/engineers/:id', (req, res) => {
  const r = db.prepare("SELECT * FROM engineers WHERE id = ? AND statut = 'approuve'").get(Number(req.params.id));
  if (!r) return res.status(404).json({ error: 'Profil introuvable.' });
  res.json(toPublic(r));
});

// Email / téléphone révélés seulement après clic sur « Contacter »
app.post('/api/engineers/:id/contact', limiterContact, (req, res) => {
  const r = db.prepare("SELECT email, telephone FROM engineers WHERE id = ? AND statut = 'approuve'").get(Number(req.params.id));
  if (!r) return res.status(404).json({ error: 'Profil introuvable.' });
  res.json({ email: r.email, telephone: r.telephone || null });
});

app.get('/api/companies', (req, res) => {
  const secteur = clean(req.query.secteur, 40);
  const rows = secteur
    ? db.prepare('SELECT * FROM companies WHERE secteur = ? ORDER BY nom').all(secteur)
    : db.prepare('SELECT * FROM companies ORDER BY nom').all();
  res.json(rows);
});

app.get('/api/companies/secteurs', (req, res) => {
  res.json(db.prepare('SELECT DISTINCT secteur FROM companies ORDER BY secteur').all().map((r) => r.secteur));
});

// ---------- Inscription ----------
app.post('/api/register', limiterRegister, (req, res) => {
  upload(req, res, (err) => {
    const files = req.files || {};
    const fail = (status, errors) => { removeFiles(files); return res.status(status).json({ errors }); };

    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') return fail(400, { fichier: 'Fichier trop volumineux (5 Mo maximum).' });
      if (String(err.message).startsWith('INVALID_FILE_TYPE:')) {
        const f = err.message.split(':')[1];
        return fail(400, { [f]: f === 'photo' ? 'Photo : JPG, PNG ou WebP uniquement.' : 'Justificatif : PDF, JPG ou PNG uniquement.' });
      }
      return fail(400, { fichier: "Erreur lors de l'envoi des fichiers." });
    }

    const b = req.body || {};
    const d = {
      nom: clean(b.nom, 80),
      email: clean(b.email, 120).toLowerCase(),
      telephone: clean(b.telephone, 20),
      domaine: clean(b.domaine, 40),
      ville: clean(b.ville, 60),
      experience: clean(b.experience, 40),
      competences: clean(b.competences, 300),
      linkedin: clean(b.linkedin, 200),
      consentement: ['true', 'on', '1', 'oui'].includes(String(b.consentement).toLowerCase()),
    };

    // Validation côté serveur
    const errors = {};
    if (d.nom.length < 2) errors.nom = 'Nom complet requis (2 caractères minimum).';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) errors.email = 'Adresse email invalide.';
    if (d.telephone && !/^\+?[0-9 ]{8,16}$/.test(d.telephone)) errors.telephone = 'Numéro de téléphone invalide.';
    if (!DOMAINES.includes(d.domaine)) errors.domaine = "Choisissez un domaine d'ingénierie.";
    if (d.ville.length < 2) errors.ville = 'Ville requise.';
    if (!EXPERIENCES.includes(d.experience)) errors.experience = "Choisissez un niveau d'expérience.";
    if (d.competences.length < 2) errors.competences = 'Indiquez au moins une compétence.';
    if (d.linkedin && !/^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/(in|pub)\/[^\s]+$/i.test(d.linkedin)) {
      errors.linkedin = 'Lien LinkedIn invalide (https://www.linkedin.com/in/...).';
    }
    if (!files.diplome) errors.diplome = 'Diplôme ou preuve requis (visible de l\'administrateur uniquement).';
    if (!d.consentement) errors.consentement = 'Votre consentement à la publication est obligatoire.';
    if (Object.keys(errors).length) return fail(400, errors);

    const dup = db.prepare("SELECT id FROM engineers WHERE email = ? AND statut != 'refuse'").get(d.email);
    if (dup) return fail(409, { email: 'Une demande existe déjà avec cet email.' });

    db.prepare(`INSERT INTO engineers
      (nom, photo, domaine, competences, ville, experience, linkedin, email, telephone, diplome_preuve, consentement, statut)
      VALUES (?,?,?,?,?,?,?,?,?,?,1,'en_attente')`).run(
      d.nom,
      files.photo ? files.photo[0].filename : null,
      d.domaine,
      d.competences,
      d.ville,
      d.experience,
      d.linkedin || null,
      d.email,
      d.telephone || null,
      files.diplome[0].filename,
    );
    res.status(201).json({ ok: true, message: 'Demande envoyée : votre profil est en attente de vérification.' });
  });
});

// ---------- Espace administrateur ----------
app.post('/api/admin/login', limiterLogin, (req, res) => {
  const { identifiant, motDePasse } = req.body || {};
  const okUser = typeof identifiant === 'string' && identifiant === ADMIN_USER;
  const okPass = typeof motDePasse === 'string' && bcrypt.compareSync(motDePasse, ADMIN_HASH);
  if (!okUser || !okPass) return res.status(401).json({ error: 'Identifiant ou mot de passe incorrect.' });
  req.session.regenerate((e) => {
    if (e) return res.status(500).json({ error: 'Erreur de session.' });
    req.session.admin = true;
    res.json({ ok: true });
  });
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('tun.sid');
    res.json({ ok: true });
  });
});

app.get('/api/admin/me', (req, res) => {
  res.json({ admin: !!(req.session && req.session.admin) });
});

app.get('/api/admin/engineers', requireAdmin, (req, res) => {
  const statut = clean(req.query.statut, 20);
  const rows = ['en_attente', 'approuve', 'refuse'].includes(statut)
    ? db.prepare('SELECT * FROM engineers WHERE statut = ? ORDER BY date_inscription DESC, id DESC').all(statut)
    : db.prepare('SELECT * FROM engineers ORDER BY date_inscription DESC, id DESC').all();
  res.json(rows.map(toAdmin));
});

app.get('/api/admin/counts', requireAdmin, (req, res) => {
  const out = { en_attente: 0, approuve: 0, refuse: 0 };
  db.prepare('SELECT statut, COUNT(*) AS n FROM engineers GROUP BY statut').all().forEach((r) => { out[r.statut] = r.n; });
  res.json(out);
});

app.get('/api/admin/engineers/:id/diplome', requireAdmin, (req, res) => {
  const r = db.prepare('SELECT diplome_preuve FROM engineers WHERE id = ?').get(Number(req.params.id));
  if (!r || !r.diplome_preuve) return res.status(404).json({ error: 'Justificatif introuvable.' });
  const file = path.join(PRIVATE_DIR, path.basename(r.diplome_preuve));
  res.setHeader('Cache-Control', 'private, no-store');
  res.sendFile(file);
});

function setStatut(statut) {
  return (req, res) => {
    const info = db.prepare('UPDATE engineers SET statut = ? WHERE id = ?').run(statut, Number(req.params.id));
    if (!info.changes) return res.status(404).json({ error: 'Profil introuvable.' });
    res.json({ ok: true, statut });
  };
}
app.post('/api/admin/engineers/:id/approve', requireAdmin, setStatut('approuve'));
app.post('/api/admin/engineers/:id/reject', requireAdmin, setStatut('refuse'));

// Suppression d'un profil sur simple demande
app.delete('/api/admin/engineers/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const r = db.prepare('SELECT photo, diplome_preuve FROM engineers WHERE id = ?').get(id);
  if (!r) return res.status(404).json({ error: 'Profil introuvable.' });
  db.prepare('DELETE FROM engineers WHERE id = ?').run(id);
  if (r.photo) fs.unlink(path.join(PHOTO_DIR, path.basename(r.photo)), () => {});
  if (r.diplome_preuve) fs.unlink(path.join(PRIVATE_DIR, path.basename(r.diplome_preuve)), () => {});
  res.json({ ok: true });
});

// ---------- Fichiers publics : photos uniquement ----------
app.use('/uploads/photos', express.static(PHOTO_DIR, { maxAge: '7d', index: false, dotfiles: 'deny' }));

app.use('/api', (req, res) => res.status(404).json({ error: 'Route inconnue.' }));

// ---------- Frontend Angular compilé (production) ----------
const DIST = path.join(__dirname, '..', 'frontend', 'dist', 'frontend', 'browser');
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST, { index: false }));
  app.get(/^\/(?!api|uploads).*/, (req, res) => res.sendFile(path.join(DIST, 'index.html')));
}

// ---------- Gestion d'erreurs ----------
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erreur interne du serveur.' });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`TunEngineers API → http://localhost:${PORT}`));
}
module.exports = app;
