# SatuSehat-Intero

## Ringkasan
Proyek tugas Interoperabilitas Kelompok 6: frontend Next.js untuk pencarian pasien yang
mengonsumsi **SatuSehat FHIR Patient API** (environment sandbox) melalui backend Express
sebagai proxy. Backend menangani OAuth2 (client credentials) dan menyembunyikan client
secret, frontend hanya memanggil backend.

## Struktur
- be-kelompok6: backend API (Express) — proxy ke SatuSehat
  - `services/satusehat.js`: ambil & cache access token, request FHIR Patient
  - `services/normalize.js`: ubah resource FHIR menjadi objek sederhana
  - `routes/patient.js`: endpoint `/api/patient`
- fe-kelompok6: frontend web (Next.js + React + Tailwind)

## Endpoint Backend
Proxy SatuSehat (data resmi, read-only):
- `GET /api/patient?nik=<NIK>` — cari pasien via NIK
- `GET /api/patient?name=<nama>&gender=<male|female>&birthdate=<YYYY-MM-DD>` — cari via demografi
- `GET /api/patient/:id` — ambil pasien via IHS Number

Pasien lokal (data buatan sendiri, disimpan ke `be-kelompok6/data/patients.json`):
- `POST /api/local-patient` — tambah pasien (body: name, gender, birthDate, nik?, address?, phone?)
- `GET /api/local-patient` — daftar pasien tersimpan
- `GET /api/local-patient/:id` — ambil satu pasien lokal
- `DELETE /api/local-patient/:id` — hapus pasien lokal

> Catatan: SatuSehat tidak mengizinkan pembuatan Patient sembarangan (data resmi
> berasal dari Dukcapil/NIK terverifikasi), sehingga fitur "Tambah Pasien"
> menyimpan data secara lokal di backend.

## Kredensial (SatuSehat)
Backend membaca `be-kelompok6/.env` (lihat `.env.example`). Environment yang dipakai adalah
**sandbox**: `https://api-satusehat-stg.dto.kemkes.go.id`.

## Prasyarat
- Node.js dan npm (disarankan Node.js 18+)
- Git (opsional, untuk clone)

## Instalasi
### Backend
1. cd be-kelompok6
2. npm install
3. Jika muncul error module not found, instal paket berikut:
   - npm install cors dotenv
   - npm install -D nodemon

### Frontend
1. cd fe-kelompok6
2. npm install

## Menjalankan
### Backend
- Mode dev (auto reload): npm run dev
- Mode produksi: npm start
- Default port: 3001 (bisa diubah lewat env PORT)
- Cek endpoint: GET http://localhost:3001/ -> { "message": "Server berjalan!" }

### Frontend
- Mode dev: npm run dev (http://localhost:3000)
- Build: npm run build
- Jalankan hasil build: npm run start

## Penjelasan Package
### Backend
- express: framework web server untuk routing dan middleware.
- cors: mengizinkan akses dari domain berbeda (CORS).
- dotenv: membaca variabel lingkungan dari file .env.
- nodemon (dev): me-restart server otomatis saat file berubah.

### Frontend
- next: framework React untuk SSR/SSG dan routing.
- react, react-dom: library UI utama.
- typescript: dukungan tipe untuk pengembangan.
- tailwindcss, @tailwindcss/postcss: utility-first CSS.
- eslint, eslint-config-next: linting standar Next.js.
- @types/node, @types/react, @types/react-dom: tipe untuk TS.

## Konfigurasi
- Backend: buat file .env di folder be-kelompok6 jika ingin mengubah PORT.
  Contoh:
  PORT=3001

## Catatan
- Jalankan backend dan frontend di terminal terpisah.
- Jika port 3001/3000 bentrok, ganti lewat env PORT (backend) atau opsi Next.js.