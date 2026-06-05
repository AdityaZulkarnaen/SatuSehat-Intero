const express = require('express');
const cors = require('cors');
require('dotenv').config();

const patientRoutes = require('./routes/patient');
const practitionerRoutes = require('./routes/practitioner');
const encounterRoutes = require('./routes/encounter');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Server berjalan!' });
});

// Proxy SatuSehat Patient (cari pasien + kunjungan resmi pasien).
app.use('/api/patient', patientRoutes);

// Master data dokter (Practitioner) dari SatuSehat.
app.use('/api/practitioner', practitionerRoutes);

// Catatan kunjungan (Encounter) yang dibuat & disimpan lokal.
app.use('/api/encounter', encounterRoutes);

app.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
});
