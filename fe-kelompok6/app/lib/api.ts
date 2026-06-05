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
