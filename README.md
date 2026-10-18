# CodeCraftHub

**CodeCraftHub** adalah platform pembelajaran pribadi sederhana untuk melacak kursus yang ingin dipelajari developer. Proyek ini terdiri dari REST API berbasis Node.js + Express dan dasbor web (satu file HTML) untuk mengelola kursus. Data disimpan di file JSON, tanpa database dan tanpa autentikasi, sehingga cocok untuk belajar dasar REST API.

## Fitur

- CRUD kursus: tambah, lihat, ubah, dan hapus
- Validasi field wajib, format tanggal `YYYY-MM-DD`, dan nilai status
- Penyimpanan di `courses.json` (dibuat otomatis jika belum ada)
- Penanganan error: field kurang, kursus tidak ditemukan, status tidak valid, JSON rusak, dan error baca/tulis file
- Endpoint bonus: statistik kursus dan pencarian
- Dasbor web responsif dengan form tambah, modal edit, spinner, serta pesan sukses/error

## Teknologi

- Node.js dan Express
- JavaScript, HTML, dan CSS murni untuk dasbor (tanpa framework)
- Penyimpanan data berbasis file JSON

## Struktur Proyek

```
codecrafthub/
├── app.js          # Server Express + semua endpoint API
├── index.html      # Dasbor web (HTML, CSS, JS dalam satu file)
├── courses.json    # Penyimpanan data (dibuat otomatis)
├── package.json    # Dependensi dan skrip npm
├── test.sh         # Skrip uji semua endpoint dengan curl
└── README.md       # Dokumentasi
```

## Instalasi

Prasyarat: Node.js 18 atau lebih baru dan npm.

```bash
git clone https://github.com/fiannnn9090/CodeCraftHub.git
cd CodeCraftHub
npm install
```

## Menjalankan Aplikasi

```bash
npm start
```

Server berjalan di `http://localhost:5000`. Untuk memakai port lain:

```bash
PORT=5001 npm start
```

> **Pengguna macOS:** port 5000 sering dipakai oleh AirPlay Receiver. Jika muncul error `EADDRINUSE`, gunakan `PORT=5001` atau matikan AirPlay Receiver di System Settings → General → AirDrop & Handoff.

## Menggunakan Dasbor

1. Jalankan server (`npm start`).
2. Buka `http://localhost:5000` (atau sesuai port yang kamu pakai) di browser.
3. Tambah kursus lewat form, ubah lewat tombol **Edit**, dan hapus lewat tombol **Remove**.

Dasbor bisa juga dibuka dari server lain (misalnya Live Server). Ubah kolom **Base API URL** di bagian atas dasbor, lalu klik **Muat Ulang**. Server sudah mengaktifkan CORS agar hal ini bisa berjalan.

## Struktur Data Kursus

| Field | Keterangan |
|---|---|
| `id` | Dibuat otomatis, mulai dari 1 |
| `name` | Wajib |
| `description` | Wajib |
| `target_date` | Wajib, format `YYYY-MM-DD` |
| `status` | Wajib: `Not Started`, `In Progress`, atau `Completed` |
| `created_at` | Dibuat otomatis, format `YYYY-MM-DD HH:MM:SS` |

## Dokumentasi API

Base URL: `http://localhost:5000/api/courses`

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/api/courses` | Tambah kursus |
| GET | `/api/courses` | Ambil semua kursus |
| GET | `/api/courses/:id` | Ambil satu kursus |
| PUT | `/api/courses/:id` | Perbarui kursus (cukup kirim field yang diubah) |
| DELETE | `/api/courses/:id` | Hapus kursus |
| GET | `/api/courses/stats` | Statistik kursus (bonus) |
| GET | `/api/courses/search?q=term` | Cari kursus berdasarkan nama atau deskripsi (bonus) |

### Contoh Penggunaan

**Tambah kursus**

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d '{"name":"Python Basics","description":"Learn Python fundamentals","target_date":"2025-12-31","status":"Not Started"}'
```

Respons `201 Created`:

```json
{
  "id": 1,
  "name": "Python Basics",
  "description": "Learn Python fundamentals",
  "target_date": "2025-12-31",
  "status": "Not Started",
  "created_at": "2025-11-04 10:30:00"
}
```

**Ambil semua kursus / satu kursus**

```bash
curl http://localhost:5000/api/courses
curl http://localhost:5000/api/courses/1
```

**Perbarui kursus**

```bash
curl -X PUT http://localhost:5000/api/courses/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"In Progress"}'
```

**Hapus kursus**

```bash
curl -X DELETE http://localhost:5000/api/courses/1
```

Respons:

```json
{ "message": "Course deleted successfully", "course": { "id": 1, "name": "Python Basics", "...": "..." } }
```

**Statistik**

```bash
curl http://localhost:5000/api/courses/stats
```

```json
{ "total": 3, "by_status": { "Not Started": 1, "In Progress": 1, "Completed": 1 } }
```

**Pencarian**

```bash
curl "http://localhost:5000/api/courses/search?q=python"
```

### Kode Respons

| Kode | Arti |
|---|---|
| 200 | Berhasil |
| 201 | Kursus berhasil dibuat |
| 400 | Field wajib kurang, status atau tanggal tidak valid, parameter `q` kosong, atau JSON rusak |
| 404 | Kursus tidak ditemukan |
| 500 | Error baca/tulis file |

Contoh respons error:

```json
{ "error": "Invalid status. Must be one of: Not Started, In Progress, Completed" }
```

## Pengujian

Jalankan server di satu terminal, lalu di terminal lain:

```bash
bash test.sh
```

Jika server memakai port selain 5000:

```bash
PORT=5001 bash test.sh
```

Skrip ini menguji semua endpoint, termasuk kasus error (field kurang, status tidak valid, dan id tidak ada).

## Pemecahan Masalah

| Masalah | Solusi |
|---|---|
| `Cannot find module 'express'` | Jalankan `npm install` di folder proyek |
| `EADDRINUSE: address already in use :::5000` | Port terpakai. Jalankan `PORT=5001 npm start`, atau di macOS matikan AirPlay Receiver |
| Respons `403 Forbidden` dengan header `Server: AirTunes` | Yang menjawab AirPlay macOS, bukan aplikasi ini. Gunakan port lain |
| Dasbor menampilkan "Tidak bisa terhubung ke server" | Pastikan server berjalan dan **Base API URL** di dasbor sesuai port server |
| `Invalid JSON in request body` | Pastikan JSON valid dan header `Content-Type: application/json` disertakan |
| `/stats` atau `/search` mengembalikan 404 | Pastikan route tersebut didefinisikan sebelum `/api/courses/:id` di `app.js` |
| Error 500 saat baca/tulis file | Pastikan folder proyek memiliki izin tulis. Jika `courses.json` rusak, hapus file tersebut agar dibuat ulang |

## Lisensi

Proyek ini dibuat untuk keperluan pembelajaran.