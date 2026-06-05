const express = require('express');
const store = require('../services/localStore');

const router = express.Router();

// GET /api/local-patient  -> daftar semua pasien lokal.
router.get('/', (req, res) => {
  res.json({ patients: store.list() });
});

// GET /api/local-patient/:id
router.get('/:id', (req, res) => {
  const patient = store.getById(req.params.id);
  if (!patient) return res.status(404).json({ message: 'Pasien tidak ditemukan' });
  res.json({ patient });
});

// POST /api/local-patient  -> tambah pasien baru & simpan.
router.post('/', (req, res) => {
  const { name, gender, birthDate, nik, address, phone } = req.body || {};

  // Validasi field wajib.
  if (!name || !gender || !birthDate) {
    return res
      .status(400)
      .json({ message: 'Nama, jenis kelamin, dan tanggal lahir wajib diisi.' });
  }
  if (nik && !/^\d{16}$/.test(nik)) {
    return res.status(400).json({ message: 'NIK harus 16 digit angka.' });
  }

  const patient = store.create({ name, gender, birthDate, nik, address, phone });
  res.status(201).json({ message: 'Pasien tersimpan', patient });
});

// DELETE /api/local-patient/:id
router.delete('/:id', (req, res) => {
  const removed = store.remove(req.params.id);
  if (!removed) return res.status(404).json({ message: 'Pasien tidak ditemukan' });
  res.json({ message: 'Pasien dihapus' });
});

module.exports = router;
