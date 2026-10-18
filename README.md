# CodeCraftHub

REST API sederhana untuk melacak kursus yang ingin dipelajari developer. Dibangun dengan Node.js + Express, data disimpan di file JSON (tanpa database, tanpa autentikasi).

## Fitur

- CRUD kursus (Create, Read, Update, Delete)
- Validasi field wajib, format tanggal `YYYY-MM-DD`, dan nilai status
- `courses.json` dibuat otomatis jika belum ada
- Penanganan error: field kurang, kursus tidak ditemukan, status tidak valid, JSON rusak, error baca/tulis file
- Bonus: endpoint statistik dan pencarian

## Instalasi

Prasyarat: Node.js 18+ dan npm.

```bash
cd codecrafthub
npm install
```

## Menjalankan

```bash
npm start
```

Server berjalan di `http://localhost:5000`.

## Struktur Data Kursus

| Field | Keterangan |
|---|---|
| `id` | Otomatis, mulai dari 1 |
| `name` | Wajib |
| `description` | Wajib |
| `target_date` | Wajib, format `YYYY-MM-DD` |
| `status` | Wajib: `Not Started`, `In Progress`, atau `Completed` |
| `created_at` | Otomatis, `YYYY-MM-DD HH:MM:SS` |

## Dokumentasi Endpoint

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/api/courses` | Tambah kursus |
| GET | `/api/courses` | Ambil semua kursus |
| GET | `/api/courses/:id` | Ambil satu kursus |
| PUT | `/api/courses/:id` | Perbarui kursus |
| DELETE | `/api/courses/:id` | Hapus kursus |
| GET | `/api/courses/stats` | Statistik kursus (bonus) |
| GET | `/api/courses/search?q=term` | Cari kursus (bonus) |

### Contoh

**Tambah kursus**
```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d '{"name":"Python Basics","description":"Learn Python fundamentals","target_date":"2025-12-31","status":"Not Started"}'
```
Respons `201`:
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

**Ambil semua / satu kursus**
```bash
curl http://localhost:5000/api/courses
curl http://localhost:5000/api/courses/1
```

**Perbarui kursus** (cukup kirim field yang diubah)
```bash
curl -X PUT http://localhost:5000/api/courses/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"In Progress"}'
```

**Hapus kursus**
```bash
curl -X DELETE http://localhost:5000/api/courses/1
```

**Statistik**
```bash
curl http://localhost:5000/api/courses/stats
```
```json
{ "total": 3, "by_status": { "Not Started": 1, "In Progress": 1, "Completed": 1 } }
```

**Cari**
```bash
curl "http://localhost:5000/api/courses/search?q=python"
```

### Kode Respons

| Kode | Arti |
|---|---|
| 200 | Berhasil |
| 201 | Kursus berhasil dibuat |
| 400 | Field wajib kurang, status/tanggal tidak valid, atau JSON rusak |
| 404 | Kursus tidak ditemukan |
| 500 | Error baca/tulis file |

Contoh error:
```json
{ "error": "Invalid status. Must be one of: Not Started, In Progress, Completed" }
```

## Pengujian

Dengan server berjalan, buka terminal lain:

```bash
bash test.sh
```

## Pemecahan Masalah

- **`Cannot find module 'express'`** — jalankan `npm install` di dalam folder proyek.
- **`EADDRINUSE: port 5000 already in use`** — hentikan proses lain di port 5000 atau ubah `PORT` di `app.js`.
- **`courses.json` rusak / error parse** — hapus file tersebut; akan dibuat ulang kosong saat server dijalankan (data lama hilang).
- **Error 500 baca/tulis file** — pastikan folder proyek punya izin tulis.
- **`Invalid JSON in request body`** — pastikan header `Content-Type: application/json` dan JSON valid (perhatikan tanda kutip pada curl).
- **`/stats` atau `/search` dianggap id** — pastikan route tersebut didefinisikan sebelum `/api/courses/:id` (sudah benar di `app.js`).
