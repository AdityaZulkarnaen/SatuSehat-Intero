// Penyimpanan Catatan Kunjungan (Encounter) ke SQLite (modul bawaan node:sqlite).
//
// SatuSehat memblokir POST Encounter untuk access class kredensial ini, sehingga
// kunjungan dibuat & disimpan lokal sebagai resource FHIR Encounter yang merujuk
// dokter (Practitioner) dari master data SatuSehat dan Organization milik kita.

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const ORG_ID = process.env.SATUSEHAT_ORG_ID;

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'patients.db');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(DB_FILE);

db.exec(`
  CREATE TABLE IF NOT EXISTS encounters (
    id               TEXT PRIMARY KEY,
    patientName      TEXT NOT NULL,
    patientNik       TEXT,
    patientGender    TEXT NOT NULL,
    patientBirthDate TEXT NOT NULL,
    patientIhs       TEXT,
    practitionerId   TEXT NOT NULL,
    practitionerName TEXT NOT NULL,
    visitDate        TEXT NOT NULL,
    visitClass       TEXT NOT NULL,
    status           TEXT NOT NULL,
    complaint        TEXT,
    fhir             TEXT NOT NULL,
    createdAt        TEXT NOT NULL
  )
`);

const CLASS_DISPLAY = {
  AMB: 'Rawat Jalan',
  IMP: 'Rawat Inap',
  EMER: 'Gawat Darurat',
};

// Bangun resource FHIR Encounter dari input kunjungan.
function buildFhirEncounter(id, input) {
  const subject = input.patientIhs
    ? { reference: `Patient/${input.patientIhs}`, display: input.patientName }
    : { display: input.patientName };

  return {
    resourceType: 'Encounter',
    id,
    status: input.status,
    class: {
      system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
      code: input.visitClass,
      display: CLASS_DISPLAY[input.visitClass] || input.visitClass,
    },
    subject,
    participant: [
      {
        type: [
          {
            coding: [
              {
                system:
                  'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                code: 'ATND',
                display: 'attender',
              },
            ],
          },
        ],
        individual: {
          reference: `Practitioner/${input.practitionerId}`,
          display: input.practitionerName,
        },
      },
    ],
    period: { start: input.visitDate },
    ...(input.complaint
      ? { reasonCode: [{ text: input.complaint }] }
      : {}),
    serviceProvider: { reference: `Organization/${ORG_ID}` },
  };
}

function rowToEncounter(row) {
  if (!row) return null;
  return {
    id: row.id,
    patient: {
      name: row.patientName,
      nik: row.patientNik || null,
      gender: row.patientGender,
      birthDate: row.patientBirthDate,
      ihs: row.patientIhs || null,
    },
    practitioner: { id: row.practitionerId, name: row.practitionerName },
    visitDate: row.visitDate,
    visitClass: row.visitClass,
    visitClassDisplay: CLASS_DISPLAY[row.visitClass] || row.visitClass,
    status: row.status,
    complaint: row.complaint || null,
    fhir: JSON.parse(row.fhir),
    createdAt: row.createdAt,
  };
}

function create(input) {
  const id = `LOCAL-ENC-${Date.now()}`;
  const fhir = buildFhirEncounter(id, input);
  db.prepare(
    `INSERT INTO encounters
       (id, patientName, patientNik, patientGender, patientBirthDate, patientIhs,
        practitionerId, practitionerName, visitDate, visitClass, status, complaint, fhir, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    input.patientName,
    input.patientNik || null,
    input.patientGender,
    input.patientBirthDate,
    input.patientIhs || null,
    input.practitionerId,
    input.practitionerName,
    input.visitDate,
    input.visitClass,
    input.status,
    input.complaint || null,
    JSON.stringify(fhir),
    new Date().toISOString()
  );
  return getById(id);
}

function list() {
  const rows = db.prepare('SELECT * FROM encounters ORDER BY createdAt DESC').all();
  return rows.map(rowToEncounter);
}

function getById(id) {
  const row = db.prepare('SELECT * FROM encounters WHERE id = ?').get(id);
  return rowToEncounter(row);
}

function remove(id) {
  const info = db.prepare('DELETE FROM encounters WHERE id = ?').run(id);
  return info.changes > 0;
}

module.exports = { create, list, getById, remove, CLASS_DISPLAY };
