// Helper untuk memanggil backend (be-kelompok6) yang menjadi proxy SatuSehat.

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export type Identifier = { label: string; value: string };

export type Patient = {
  id: string;
  name: string;
  nik: string | null;
  gender: string;
  birthDate: string;
  active: boolean | null;
  address: string | null;
  telecom: string[];
  identifiers: Identifier[];
};

async function handle<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Permintaan gagal");
  }
  return data as T;
}

export async function searchByNik(nik: string) {
  const res = await fetch(
    `${API_URL}/api/patient?nik=${encodeURIComponent(nik)}`
  );
  return handle<{ total: number; patients: Patient[] }>(res);
}

export async function searchByDemographics(params: {
  name: string;
  gender: string;
  birthdate: string;
}) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/api/patient?${q}`);
  return handle<{ total: number; patients: Patient[] }>(res);
}

export async function getById(id: string) {
  const res = await fetch(`${API_URL}/api/patient/${encodeURIComponent(id)}`);
  return handle<{ patient: Patient }>(res);
}

// ---- Practitioner (master data dokter SatuSehat) ----

export type Practitioner = {
  id: string;
  name: string;
  fullName: string;
  gender: string;
};

export async function listPractitioners() {
  const res = await fetch(`${API_URL}/api/practitioner`);
  return handle<{ practitioners: Practitioner[] }>(res);
}

// ---- Encounter / Catatan Kunjungan ----

export type Encounter = {
  id: string;
  patient: {
    name: string;
    nik: string | null;
    gender: string;
    birthDate: string;
    ihs: string | null;
  };
  practitioner: { id: string; name: string };
  visitDate: string;
  visitClass: string;
  visitClassDisplay: string;
  status: string;
  complaint: string | null;
  fhir: unknown;
  createdAt: string;
};

export type NewEncounter = {
  patientName: string;
  patientGender: string;
  patientBirthDate: string;
  patientNik?: string;
  patientIhs?: string;
  practitionerId: string;
  visitDate: string;
  visitClass: string;
  status: string;
  complaint?: string;
};

export async function createEncounter(input: NewEncounter) {
  const res = await fetch(`${API_URL}/api/encounter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handle<{ message: string; encounter: Encounter }>(res);
}

export async function listEncounters() {
  const res = await fetch(`${API_URL}/api/encounter`);
  return handle<{ encounters: Encounter[] }>(res);
}

export async function deleteEncounter(id: string) {
  const res = await fetch(`${API_URL}/api/encounter/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  return handle<{ message: string }>(res);
}

// Kunjungan resmi pasien dari SatuSehat (Encounter API, read-only).
export type SatuSehatEncounter = {
  id: string;
  status: string;
  class: string;
  classDisplay: string;
  patient: string;
  practitioner: string;
  start: string | null;
  end: string | null;
  reason: string | null;
};

export async function getPatientEncounters(ihsId: string) {
  const res = await fetch(
    `${API_URL}/api/patient/${encodeURIComponent(ihsId)}/encounter`
  );
  return handle<{ total: number; encounters: SatuSehatEncounter[] }>(res);
}
