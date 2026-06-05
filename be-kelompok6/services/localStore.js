// Penyimpanan data pasien lokal (buatan sendiri) ke file JSON.
// Dipakai untuk fitur "tambah pasien" karena SatuSehat tidak mengizinkan
// pembuatan Patient sembarangan (data resmi berasal dari Dukcapil).

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const FILE = path.join(DATA_DIR, 'patients.json');

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, '[]', 'utf-8');
}

function readAll() {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf-8')) || [];
  } catch {
    return [];
  }
}

function writeAll(list) {
  ensureFile();
  fs.writeFileSync(FILE, JSON.stringify(list, null, 2), 'utf-8');
}

// Bentuk data pasien lokal disamakan dengan hasil normalisasi FHIR
// supaya bisa ditampilkan memakai komponen kartu yang sama di frontend.
function buildPatient(input) {
  const id = `LOCAL-${Date.now()}`;
  const identifiers = [];
  if (input.nik) identifiers.push({ label: 'NIK', value: input.nik });
  identifiers.push({ label: 'Local ID', value: id });

  const telecom = [];
  if (input.phone) telecom.push(`phone: ${input.phone}`);

  return {
    id,
    source: 'local',
    name: input.name,
    nik: input.nik || null,
    gender: input.gender,
    birthDate: input.birthDate,
    active: true,
    address: input.address || null,
    telecom,
    identifiers,
    createdAt: new Date().toISOString(),
  };
}

function create(input) {
  const list = readAll();
  const patient = buildPatient(input);
  list.unshift(patient);
  writeAll(list);
  return patient;
}

function list() {
  return readAll();
}

function getById(id) {
  return readAll().find((p) => p.id === id) || null;
}

function remove(id) {
  const list = readAll();
  const next = list.filter((p) => p.id !== id);
  const removed = next.length !== list.length;
  writeAll(next);
  return removed;
}

module.exports = { create, list, getById, remove };
