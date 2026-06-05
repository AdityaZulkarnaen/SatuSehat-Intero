const express = require('express');
const store = require('../services/encounterStore');
const satusehat = require('../services/satusehat');
const { normalizePractitioner } = require('../services/normalize');

const router = express.Router();

const VALID_CLASS = ['AMB', 'IMP', 'EMER'];
const VALID_STATUS = ['arrived', 'in-progress', 'finished', 'cancelled'];

// GET /api/encounter -> daftar catatan kunjungan tersimpan.
router.get('/', (req, res) => {
  res.json({ encounters: store.list() });
});

// GET /api/encounter/:id
router.get('/:id', (req, res) => {
  const encounter = store.getById(req.params.id);
  if (!encounter) return res.status(404).json({ message: 'Kunjungan tidak ditemukan' });
  res.json({ encounter });
});

// POST /api/encounter -> buat & simpan catatan kunjungan baru.
router.post('/', async (req, res) => {
  const {
    patientName,
    patientNik,
    patientGender,
    patientBirthDate,
    patientIhs,
    practitionerId,
    visitDate,
    visitClass,
    status,
    complaint,
  } = req.body || {};

  // Validasi field wajib.
  if (!patientName || !patientGender || !patientBirthDate) {
    return res.status(400).json({ message: 'Data pasien (nama, gender, tanggal lahir) wajib diisi.' });
  }
  if (!practitionerId) {
    return res.status(400).json({ message: 'Dokter (practitioner) wajib dipilih.' });
  }
  if (!visitDate) {
    return res.status(400).json({ message: 'Tanggal kunjungan wajib diisi.' });
  }
  if (!VALID_CLASS.includes(visitClass)) {
    return res.status(400).json({ message: 'Jenis kunjungan tidak valid.' });
  }
  if (!VALID_STATUS.includes(status)) {
    return res.status(400).json({ message: 'Status kunjungan tidak valid.' });
  }
  if (patientNik && !/^\d{16}$/.test(patientNik)) {
    return res.status(400).json({ message: 'NIK harus 16 digit angka.' });
  }

  try {
    // Validasi & ambil nama dokter dari master data SatuSehat.
    const resource = await satusehat.getPractitioner(practitionerId);
    const practitioner = normalizePractitioner(resource);
    if (!practitioner?.id) {
      return res.status(400).json({ message: 'Dokter tidak ditemukan di SatuSehat.' });
    }

    const encounter = store.create({
      patientName,
      patientNik,
      patientGender,
      patientBirthDate,
      patientIhs,
      practitionerId,
      practitionerName: practitioner.fullName || practitioner.name,
      visitDate,
      visitClass,
      status,
      complaint,
    });
    res.status(201).json({ message: 'Kunjungan tersimpan', encounter });
  } catch (err) {
    res.status(err.status || 500).json({
      message: 'Gagal memvalidasi dokter ke SatuSehat: ' + (err.message || ''),
      detail: err.detail,
    });
  }
});

// DELETE /api/encounter/:id
router.delete('/:id', (req, res) => {
  const removed = store.remove(req.params.id);
  if (!removed) return res.status(404).json({ message: 'Kunjungan tidak ditemukan' });
  res.json({ message: 'Kunjungan dihapus' });
});

module.exports = router;
