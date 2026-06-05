"use client";

import { useState } from "react";
import {
  searchByNik,
  searchByDemographics,
  getById,
  type Patient,
} from "./lib/api";
import PatientCard from "./components/PatientCard";

type Mode = "nik" | "demografi" | "id";

const tabs: { key: Mode; label: string }[] = [
  { key: "nik", label: "Cari via NIK" },
  { key: "demografi", label: "Cari via Nama" },
  { key: "id", label: "Cari via IHS Number" },
];

export default function Home() {
  const [mode, setMode] = useState<Mode>("demografi");
  const [nik, setNik] = useState("");
  const [name, setName] = useState("Budi");
  const [gender, setGender] = useState("male");
  const [birthdate, setBirthdate] = useState("2000-01-01");
  const [ihsId, setIhsId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[] | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPatients(null);
    try {
      if (mode === "nik") {
        const { patients } = await searchByNik(nik.trim());
        setPatients(patients);
      } else if (mode === "demografi") {
        const { patients } = await searchByDemographics({
          name: name.trim(),
          gender,
          birthdate,
        });
        setPatients(patients);
      } else {
        const { patient } = await getById(ihsId.trim());
        setPatients(patient ? [patient] : []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";
  const labelCls = "mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          SatuSehat — Pencarian Pasien
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Konsumsi FHIR Patient API (sandbox) melalui backend proxy. Kelompok 6.
        </p>
      </header>

      {/* Tab pemilihan mode pencarian */}
      <div className="mb-5 flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setMode(t.key);
              setPatients(null);
              setError(null);
            }}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              mode === t.key
                ? "bg-white text-sky-600 shadow-sm dark:bg-zinc-950 dark:text-sky-400"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSearch}
        className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        {mode === "nik" && (
          <div>
            <label className={labelCls}>NIK</label>
            <input
              className={inputCls}
              value={nik}
              onChange={(e) => setNik(e.target.value)}
              placeholder="16 digit NIK"
              required
            />
          </div>
        )}

        {mode === "demografi" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-3">
              <label className={labelCls}>Nama</label>
              <input
                className={inputCls}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Jenis Kelamin</label>
              <select
                className={inputCls}
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Tanggal Lahir</label>
              <input
                type="date"
                className={inputCls}
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        {mode === "id" && (
          <div>
            <label className={labelCls}>IHS Number</label>
            <input
              className={inputCls}
              value={ihsId}
              onChange={(e) => setIhsId(e.target.value)}
              placeholder="contoh: P20395473811"
              required
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Mencari..." : "Cari Pasien"}
        </button>
      </form>

      {/* Hasil */}
      <section className="mt-6 space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        {patients && patients.length === 0 && !error && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
            Tidak ada pasien yang cocok.
          </div>
        )}

        {patients && patients.length > 0 && (
          <>
            <p className="text-sm text-zinc-500">
              Ditemukan {patients.length} pasien.
            </p>
            {patients.map((p) => (
              <PatientCard key={p.id} patient={p} />
            ))}
          </>
        )}
      </section>
    </main>
  );
}
