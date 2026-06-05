"use client";

import { useEffect, useState } from "react";
import { listLocalPatients, deleteLocalPatient, type Patient } from "../lib/api";
import PatientCard from "./PatientCard";

export default function SavedPatients({ refreshKey }: { refreshKey: number }) {
  const [patients, setPatients] = useState<Patient[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { patients } = await listLocalPatients();
      setPatients(patients);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  // Muat ulang saat tab dibuka atau setelah ada pasien baru disimpan.
  useEffect(() => {
    load();
  }, [refreshKey]);

  async function handleDelete(id: string) {
    if (!confirm("Hapus pasien ini?")) return;
    try {
      await deleteLocalPatient(id);
      setPatients((prev) => prev?.filter((p) => p.id !== id) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus");
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">Memuat data tersimpan...</p>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
        {error}
      </div>
    );
  }

  if (!patients || patients.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
        Belum ada pasien tersimpan. Tambahkan lewat tab &quot;Tambah Pasien&quot;.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-500">
        {patients.length} pasien tersimpan secara lokal.
      </p>
      {patients.map((p) => (
        <div key={p.id}>
          <PatientCard patient={p} />
          <div className="mt-1 flex justify-end">
            <button
              onClick={() => handleDelete(p.id)}
              className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              Hapus
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
