const express = require('express');
const cors = require('cors');
require('dotenv').config();

const patientRoutes = require('./routes/patient');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Server berjalan!' });
});

// Endpoint proxy SatuSehat Patient.
app.use('/api/patient', patientRoutes);

app.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
});
