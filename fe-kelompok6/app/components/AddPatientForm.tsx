"use client";

import { useState } from "react";
import { createLocalPatient, type Patient } from "../lib/api";

const inputCls =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";
const labelCls = "mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

export default function AddPatientForm({
  onSaved,
}: {
  onSaved?: (p: Patient) => void;
}) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("male");
  const [birthDate, setBirthDate] = useState("");
  const [nik, setNik] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function reset() {
    setName("");
    setGender("male");
    setBirthDate("");
    setNik("");
    setAddress("");
    setPhone("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { patient } = await createLocalPatient({
        name: name.trim(),
        gender,
        birthDate,
        nik: nik.trim() || undefined,
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      setSuccess(`Pasien "${patient.name}" berhasil disimpan (ID: ${patient.id}).`);
      reset();
      onSaved?.(patient);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelCls}>Nama Lengkap *</label>
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama pasien"
            required
          />
        </div>
        <div>
          <label className={labelCls}>Jenis Kelamin *</label>
          <select
            className={inputCls}
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="male">Laki-laki</option>
            <option value="female">Perempuan</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Tanggal Lahir *</label>
          <input
            type="date"
            className={inputCls}
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelCls}>NIK (opsional, 16 digit)</label>
          <input
            className={inputCls}
            value={nik}
            onChange={(e) => setNik(e.target.value)}
            placeholder="16 digit"
            inputMode="numeric"
          />
        </div>
        <div>
          <label className={labelCls}>No. HP (opsional)</label>
          <input
            className={inputCls}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08xxxxxxxxxx"
            inputMode="tel"
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Alamat (opsional)</label>
          <input
            className={inputCls}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Alamat domisili"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-5 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Menyimpan..." : "Simpan Pasien"}
      </button>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          {success}
        </div>
      )}
    </form>
  );
}
