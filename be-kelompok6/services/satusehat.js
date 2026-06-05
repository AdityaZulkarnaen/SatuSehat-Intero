// Service untuk komunikasi dengan API SatuSehat (FHIR R4).
// Mengelola OAuth2 client-credentials token (dengan cache) dan request Patient.

const AUTH_URL = process.env.SATUSEHAT_AUTH_URL;
const BASE_URL = process.env.SATUSEHAT_BASE_URL;
const CLIENT_ID = process.env.SATUSEHAT_CLIENT_ID;
const CLIENT_SECRET = process.env.SATUSEHAT_CLIENT_SECRET;

// Cache token di memori agar tidak minta token baru tiap request.
let tokenCache = { accessToken: null, expiresAt: 0 };
// Menampung permintaan token yang sedang berjalan supaya beberapa request
// bersamaan tidak meminta token berkali-kali (dedupe).
let pendingToken = null;

async function getAccessToken() {
  // Pakai token lama jika masih berlaku (beri buffer 60 detik).
  if (tokenCache.accessToken && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.accessToken;
  }
  // Jika sudah ada permintaan token berjalan, ikut menunggu yang itu.
  if (pendingToken) return pendingToken;

  pendingToken = fetchToken().finally(() => {
    pendingToken = null;
  });
  return pendingToken;
}

async function fetchToken() {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const res = await fetch(`${AUTH_URL}?grant_type=client_credentials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gagal mendapatkan token (${res.status}): ${text}`);
  }

  const data = await res.json();
  const expiresInSec = parseInt(data.expires_in, 10) || 3600;
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + expiresInSec * 1000,
  };
  return tokenCache.accessToken;
}

// Helper request ke FHIR server SatuSehat dengan Bearer token.
async function fhirRequest(path) {
  const token = await getAccessToken();
  const res = await fetch(`${BASE_URL}/fhir-r4/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error('Permintaan ke SatuSehat gagal');
    err.status = res.status;
    err.detail = data;
    throw err;
  }
  return data;
}

const NIK_SYSTEM = 'https://fhir.kemkes.go.id/id/nik';

// Cari pasien berdasarkan NIK.
function searchByNik(nik) {
  const identifier = `${NIK_SYSTEM}|${nik}`;
  return fhirRequest(`/Patient?identifier=${encodeURIComponent(identifier)}`);
}

// Cari pasien berdasarkan kombinasi nama + gender + tanggal lahir.
function searchByDemographics({ name, gender, birthdate }) {
  const params = new URLSearchParams({ name, gender, birthdate });
  return fhirRequest(`/Patient?${params.toString()}`);
}

// Ambil pasien berdasarkan IHS Number (id).
function getById(id) {
  return fhirRequest(`/Patient/${encodeURIComponent(id)}`);
}

// --- Practitioner (master data dokter) ---

// Ambil satu dokter berdasarkan IHS Number practitioner.
function getPractitioner(id) {
  return fhirRequest(`/Practitioner/${encodeURIComponent(id)}`);
}

// --- Encounter (kunjungan) ---

// Ambil daftar kunjungan resmi milik seorang pasien dari SatuSehat.
function getEncountersByPatient(ihsId) {
  return fhirRequest(`/Encounter?subject=Patient/${encodeURIComponent(ihsId)}`);
}

module.exports = {
  getAccessToken,
  searchByNik,
  searchByDemographics,
  getById,
  getPractitioner,
  getEncountersByPatient,
};
