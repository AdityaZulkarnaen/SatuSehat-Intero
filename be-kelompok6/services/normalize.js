// Ubah resource FHIR Patient yang kompleks menjadi objek sederhana untuk frontend.

const SYSTEM_LABEL = {
  'https://fhir.kemkes.go.id/id/nik': 'NIK',
  'https://fhir.kemkes.go.id/id/ihs-number': 'IHS Number',
  'https://fhir.kemkes.go.id/id/paspor': 'Paspor',
  'https://fhir.kemkes.go.id/id/kk': 'No. KK',
};

function mapIdentifiers(identifiers = []) {
  return identifiers.map((i) => ({
    label: SYSTEM_LABEL[i.system] || i.system,
    value: i.value,
  }));
}

function mapAddress(addresses = []) {
  if (!addresses.length) return null;
  const a = addresses[0];
  const parts = [
    ...(a.line || []),
    a.city,
    a.postalCode,
    a.country,
  ].filter(Boolean);
  return parts.join(', ');
}

function mapTelecom(telecom = []) {
  return telecom.map((t) => `${t.system || 'kontak'}: ${t.value}`);
}

function normalizePatient(resource) {
  if (!resource) return null;
  const nik = (resource.identifier || []).find(
    (i) => i.system === 'https://fhir.kemkes.go.id/id/nik'
  );
  return {
    id: resource.id,
    name: resource.name?.[0]?.text || resource.name?.[0]?.given?.join(' ') || '-',
    nik: nik?.value || null,
    gender: resource.gender || '-',
    birthDate: resource.birthDate || '-',
    active: resource.active ?? null,
    address: mapAddress(resource.address),
    telecom: mapTelecom(resource.telecom),
    identifiers: mapIdentifiers(resource.identifier),
  };
}

// Bundle (hasil search) -> array pasien sederhana.
function normalizeBundle(bundle) {
  const entries = bundle?.entry || [];
  return entries.map((e) => normalizePatient(e.resource));
}

module.exports = { normalizePatient, normalizeBundle };
