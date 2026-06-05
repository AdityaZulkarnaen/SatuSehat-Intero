// Penyimpanan data pasien lokal (buatan sendiri) ke database SQLite.
// Memakai modul bawaan Node.js `node:sqlite` (perlu flag --experimental-sqlite,
// sudah diset di npm script) sehingga tidak butuh kompilasi native.
//
// SatuSehat tidak mengizinkan pembuatan Patient sembarangan (data resmi berasal
// dari Dukcapil), jadi pasien tambahan disimpan di DB lokal ini.

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'patients.db');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(DB_FILE);

// Buat tabel jika belum ada.
db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id        TEXT PRIMARY KEY,
    name      TEXT NOT NULL,
    nik       TEXT,
    gender    TEXT NOT NULL,
    birthDate TEXT NOT NULL,
    address   TEXT,
    phone     TEXT,
    active    INTEGER NOT NULL DEFAULT 1,
    createdAt TEXT NOT NULL
  )
`);

// Ubah satu baris DB menjadi bentuk pasien yang sama dengan hasil normalisasi
// FHIR, supaya bisa ditampilkan memakai komponen kartu yang sama di frontend.
function rowToPatient(row) {
  if (!row) return null;
  const identifiers = [];
  if (row.nik) identifiers.push({ label: 'NIK', value: row.nik });
  identifiers.push({ label: 'Local ID', value: row.id });

  const telecom = [];
  if (row.phone) telecom.push(`phone: ${row.phone}`);

  return {
    id: row.id,
    source: 'local',
    name: row.name,
    nik: row.nik || null,
    gender: row.gender,
    birthDate: row.birthDate,
    active: row.active === 1,
    address: row.address || null,
    telecom,
    identifiers,
    createdAt: row.createdAt,
  };
}

function create(input) {
  const id = `LOCAL-${Date.now()}`;
  const createdAt = new Date().toISOString();
  db.prepare(
    `INSERT INTO patients (id, name, nik, gender, birthDate, address, phone, active, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`
  ).run(
    id,
    input.name,
    input.nik || null,
    input.gender,
    input.birthDate,
    input.address || null,
    input.phone || null,
    createdAt
  );
  return getById(id);
}

function list() {
  const rows = db.prepare('SELECT * FROM patients ORDER BY createdAt DESC').all();
  return rows.map(rowToPatient);
}

function getById(id) {
  const row = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
  return rowToPatient(row);
}

function remove(id) {
  const info = db.prepare('DELETE FROM patients WHERE id = ?').run(id);
  return info.changes > 0;
}

module.exports = { create, list, getById, remove };
