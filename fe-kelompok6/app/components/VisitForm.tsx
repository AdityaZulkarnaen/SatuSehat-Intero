"use client";

import { useEffect, useState } from "react";
import {
  listPractitioners,
  createEncounter,
  type Practitioner,
  type Encounter,
} from "../lib/api";

const inputCls =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";
const labelCls = "mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

export default function VisitForm({
  onSaved,
}: {
  onSaved?: (e: Encounter) => void;
}) {
  // Data pasien.
  const [patientName, setPatientName] = useState("");
  const [patientGender, setPatientGender] = useState("male");
  const [patientBirthDate, setPatientBirthDate] = useState("");
  const [patientNik, setPatientNik] = useState("");
  const [patientIhs, setPatientIhs] = useState("");

  // Data kunjungan.
  const [practitionerId, setPractitionerId] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [visitClass, setVisitClass] = useState("AMB");
  const [status, setStatus] = useState("arrived");
  const [complaint, setComplaint] = useState("");

  // Master data dokter dari SatuSehat.
  const [doctors, setDoctors] = useState<Practitioner[]>([]);
  const [doctorError, setDoctorError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    listPractitioners()
      .then(({ practitioners }) => {
        setDoctors(practitioners);
        if (practitioners[0]) setPractitionerId(practitioners[0].id);
      })
      .catch((err) =>
        setDoctorError(
          err instanceof Error ? err.message : "Gagal memuat daftar dokter"
        )
      );
  }, []);

  function reset() {
    setPatientName("");
    setPatientGender("male");
    setPatientBirthDate("");
    setPatientNik("");
    setPatientIhs("");
    setVisitDate("");
    setVisitClass("AMB");
    setStatus("arrived");
    setComplaint("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { encounter } = await createEncounter({
        patientName: patientName.trim(),
        patientGender,
        patientBirthDate,
        patientNik: patientNik.trim() || undefined,
        patientIhs: patientIhs.trim() || undefined,
        practitionerId,
        visitDate,
        visitClass,
        status,
        complaint: complaint.trim() || undefined,
      });
      setSuccess(
        `Kunjungan "${encounter.patient.name}" dengan ${encounter.practitioner.name} tersimpan.`
      );
      reset();
      onSaved?.(encounter);
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
      {/* --- Data Pasien --- */}
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
        Data Pasien
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelCls}>Nama Pasien *</label>
          <input
            className={inputCls}
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="Nama pasien"
            required
          />
        </div>
        <div>
          <label className={labelCls}>Jenis Kelamin *</label>
          <select
            className={inputCls}
            value={patientGender}
            onChange={(e) => setPatientGender(e.target.value)}
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
            value={patientBirthDate}
            onChange={(e) => setPatientBirthDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelCls}>NIK (opsional)</label>
          <input
            className={inputCls}
            value={patientNik}
            onChange={(e) => setPatientNik(e.target.value)}
            placeholder="16 digit"
            inputMode="numeric"
          />
        </div>
        <div>
          <label className={labelCls}>IHS Number (opsional)</label>
          <input
            className={inputCls}
            value={patientIhs}
            onChange={(e) => setPatientIhs(e.target.value)}
            placeholder="jika pasien terdaftar SatuSehat"
          />
        </div>
      </div>

      {/* --- Data Kunjungan --- */}
      <h3 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wide text-zinc-400">
        Data Kunjungan
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelCls}>Dokter (master data SatuSehat) *</label>
          <select
            className={inputCls}
            value={practitionerId}
            onChange={(e) => setPractitionerId(e.target.value)}
            required
            disabled={!doctors.length}
          >
            {!doctors.length && <option value="">Memuat dokter...</option>}
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.fullName} ({d.id})
              </option>
            ))}
          </select>
          {doctorError && (
            <p className="mt-1 text-xs text-red-600">{doctorError}</p>
          )}
        </div>
        <div>
          <label className={labelCls}>Tanggal Kunjungan *</label>
          <input
            type="date"
            className={inputCls}
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelCls}>Jenis Kunjungan *</label>
          <select
            className={inputCls}
            value={visitClass}
            onChange={(e) => setVisitClass(e.target.value)}
          >
            <option value="AMB">Rawat Jalan</option>
            <option value="IMP">Rawat Inap</option>
            <option value="EMER">Gawat Darurat</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Status *</label>
          <select
            className={inputCls}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="arrived">Datang (arrived)</option>
            <option value="in-progress">Berlangsung (in-progress)</option>
            <option value="finished">Selesai (finished)</option>
            <option value="cancelled">Batal (cancelled)</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Keluhan / Alasan (opsional)</label>
          <input
            className={inputCls}
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            placeholder="contoh: Demam dan batuk"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Menyimpan..." : "Simpan Kunjungan"}
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
