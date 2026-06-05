import type { Patient } from "../lib/api";

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

export default function PatientCard({ patient }: { patient: Patient }) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {patient.name}
        </h3>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            patient.active
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
              : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
          }`}
        >
          {patient.active ? "Aktif" : "Nonaktif"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Field label="IHS Number" value={patient.id} />
        <Field label="NIK" value={patient.nik || "-"} />
        <Field
          label="Gender"
          value={patient.gender === "male" ? "Laki-laki" : patient.gender === "female" ? "Perempuan" : patient.gender}
        />
        <Field label="Tanggal Lahir" value={patient.birthDate} />
        <Field
          label="Alamat"
          value={patient.address || "-"}
        />
        <Field
          label="Kontak"
          value={patient.telecom.length ? patient.telecom.join(", ") : "-"}
        />
      </div>

      {patient.identifiers.length > 0 && (
        <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <p className="mb-1 text-xs uppercase tracking-wide text-zinc-400">
            Identifier
          </p>
          <div className="flex flex-wrap gap-2">
            {patient.identifiers.map((i) => (
              <span
                key={`${i.label}-${i.value}`}
                className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
              >
                <b>{i.label}:</b> {i.value}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
