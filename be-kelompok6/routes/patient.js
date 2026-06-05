const express = require('express');
const satusehat = require('../services/satusehat');
const { normalizePatient, normalizeBundle } = require('../services/normalize');

const router = express.Router();

// GET /api/patient?nik=...  ATAU  ?name=...&gender=...&birthdate=...
// Cari pasien (mengembalikan daftar pasien yang cocok).
router.get('/', async (req, res) => {
  const { nik, name, gender, birthdate } = req.query;
  try {
    let bundle;
    if (nik) {
      bundle = await satusehat.searchByNik(nik);
    } else if (name && gender && birthdate) {
      bundle = await satusehat.searchByDemographics({ name, gender, birthdate });
    } else {
      return res.status(400).json({
        message:
          'Parameter kurang. Gunakan ?nik=... atau ?name=...&gender=...&birthdate=YYYY-MM-DD',
      });
    }
    const patients = normalizeBundle(bundle);
    res.json({ total: bundle.total ?? patients.length, patients });
  } catch (err) {
    forwardError(res, err);
  }
});

// GET /api/patient/:id  -> ambil pasien berdasarkan IHS Number.
router.get('/:id', async (req, res) => {
  try {
    const resource = await satusehat.getById(req.params.id);
    res.json({ patient: normalizePatient(resource) });
  } catch (err) {
    forwardError(res, err);
  }
});

function forwardError(res, err) {
  console.error('[patient]', err.message, err.detail || '');
  res.status(err.status || 500).json({
    message: err.message || 'Terjadi kesalahan',
    detail: err.detail,
  });
}

module.exports = router;
