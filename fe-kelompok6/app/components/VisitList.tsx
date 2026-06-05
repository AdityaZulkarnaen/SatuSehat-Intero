"use client";

import { useEffect, useState } from "react";
import { listEncounters, deleteEncounter, type Encounter } from "../lib/api";

const statusStyle: Record<string, string> = {
  arrived: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  "in-progress":
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  finished:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  cancelled: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs uppercase tracking-wide text-zinc-400">
        {label}
      </span>
      <span className="text-sm text-zinc-800 dark:text-zinc-100">{value}</span>
    </div>
  );
}

export default function VisitList({ refreshKey }: { refreshKey: number }) {
  const [encounters, setEncounters] = useState<Encounter[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [openFhir, setOpenFhir] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { encounters } = await listEncounters();
      setEncounters(encounters);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [refreshKey]);

  async function handleDelete(id: string) {
    if (!confirm("Hapus catatan kunjungan ini?")) return;
    try {
      await deleteEncounter(id);
      setEncounters((prev) => prev?.filter((e) => e.id !== id) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus");
    }
  }

  if (loading)
    return <p className="text-sm text-zinc-500">Memuat catatan kunjungan...</p>;

  if (error)
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
        {error}
      </div>
    );

  if (!encounters || encounters.length === 0)
    return (
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
        Belum ada catatan kunjungan. Tambahkan lewat tab &quot;Tambah Kunjungan&quot;.
      </div>
    );

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-500">
        {encounters.length} catatan kunjungan tersimpan.
      </p>
      {encounters.map((e) => (
        <article
          key={e.id}
          className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {e.patient.name}
              </h3>
              <p className="text-xs text-zinc-400">{e.id}</p>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                statusStyle[e.status] || statusStyle.cancelled
              }`}
            >
              {e.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Field label="Dokter" value={e.practitioner.name} />
            <Field label="Jenis" value={e.visitClassDisplay} />
            <Field label="Tgl Kunjungan" value={e.visitDate} />
            <Field
              label="Pasien"
              value={`${e.patient.gender === "male" ? "L" : "P"} · ${e.patient.birthDate}`}
            />
            <Field label="NIK" value={e.patient.nik || "-"} />
            <Field label="IHS" value={e.patient.ihs || "-"} />
            <div className="col-span-2 sm:col-span-3">
              <Field label="Keluhan" value={e.complaint || "-"} />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
            <button
              onClick={() => setOpenFhir(openFhir === e.id ? null : e.id)}
              className="text-xs font-medium text-sky-600 hover:underline dark:text-sky-400"
            >
              {openFhir === e.id ? "Sembunyikan" : "Lihat"} FHIR Encounter
            </button>
            <button
              onClick={() => handleDelete(e.id)}
              className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              Hapus
            </button>
          </div>

          {openFhir === e.id && (
            <pre className="mt-3 max-h-72 overflow-auto rounded-lg bg-zinc-950 p-3 text-xs text-zinc-200">
              {JSON.stringify(e.fhir, null, 2)}
            </pre>
          )}
        </article>
      ))}
    </div>
  );
}
