const express = require('express');
const satusehat = require('../services/satusehat');
const { normalizePractitioner } = require('../services/normalize');
const PRACTITIONER_IDS = require('../config/practitioners');

const router = express.Router();

// GET /api/practitioner -> daftar dokter dari master data SatuSehat.
router.get('/', async (req, res) => {
  try {
    const results = await Promise.all(
      PRACTITIONER_IDS.map(async (id) => {
        try {
          const resource = await satusehat.getPractitioner(id);
          return normalizePractitioner(resource);
        } catch {
          return null; // lewati dokter yang gagal diambil
        }
      })
    );
    res.json({ practitioners: results.filter(Boolean) });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message, detail: err.detail });
  }
});

// GET /api/practitioner/:id -> satu dokter dari master data SatuSehat.
router.get('/:id', async (req, res) => {
  try {
    const resource = await satusehat.getPractitioner(req.params.id);
    res.json({ practitioner: normalizePractitioner(resource) });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message, detail: err.detail });
  }
});

module.exports = router;
