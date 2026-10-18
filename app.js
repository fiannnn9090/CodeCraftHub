// ============================================================
// CodeCraftHub - REST API pelacak tujuan belajar pribadi
// Node.js + Express, data disimpan di file JSON (tanpa database)
// ============================================================

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
// Port bisa diganti lewat environment variable, contoh: PORT=5001 npm start
const PORT = process.env.PORT || 5000;

// Lokasi file penyimpanan data
const DATA_FILE = path.join(__dirname, 'courses.json');

// Nilai status yang diperbolehkan
const VALID_STATUSES = ['Not Started', 'In Progress', 'Completed'];

// Middleware: membaca body request berformat JSON
app.use(express.json());

// Middleware CORS: mengizinkan dasbor HTML (yang dibuka dari alamat/port lain,
// misalnya Live Server) memanggil API ini. Tanpa ini browser akan memblokir request.
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204); // jawaban untuk preflight
  next();
});

// Menyajikan dasbor di http://localhost:PORT/ (hanya file index.html, bukan seluruh folder)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ------------------------------------------------------------
// Fungsi pembantu (helper)
// ------------------------------------------------------------

// Membuat courses.json berisi array kosong jika belum ada
function initDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf8');
    console.log('courses.json tidak ditemukan, file baru dibuat.');
  }
}

// Membaca semua kursus dari file JSON
function loadCourses() {
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  if (raw.trim() === '') return [];
  return JSON.parse(raw);
}

// Menulis semua kursus ke file JSON
function saveCourses(courses) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(courses, null, 2), 'utf8');
}

// Menghasilkan ID baru: ID terbesar saat ini + 1 (mulai dari 1)
function getNextId(courses) {
  if (courses.length === 0) return 1;
  return Math.max(...courses.map((c) => c.id)) + 1;
}

// Timestamp format "YYYY-MM-DD HH:MM:SS"
function getTimestamp() {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

// Validasi format tanggal YYYY-MM-DD (dan tanggalnya benar-benar ada)
function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value);
  return !isNaN(d.getTime()) && d.toISOString().startsWith(value);
}

// Memvalidasi data kursus; mengembalikan pesan error atau null jika valid
// requireAll = true  -> semua field wajib ada (untuk POST)
// requireAll = false -> hanya field yang dikirim yang divalidasi (untuk PUT)
function validateCourse(body, requireAll) {
  const fields = ['name', 'description', 'target_date', 'status'];

  if (requireAll) {
    const missing = fields.filter(
      (f) => body[f] === undefined || body[f] === null || String(body[f]).trim() === ''
    );
    if (missing.length > 0) {
      return `Missing required field(s): ${missing.join(', ')}`;
    }
  }

  if (body.name !== undefined && String(body.name).trim() === '') {
    return 'name cannot be empty';
  }
  if (body.description !== undefined && String(body.description).trim() === '') {
    return 'description cannot be empty';
  }
  if (body.target_date !== undefined && !isValidDate(body.target_date)) {
    return 'target_date must be a valid date in YYYY-MM-DD format';
  }
  if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
    return `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`;
  }
  return null;
}

// Membungkus handler agar error baca/tulis file ditangani di satu tempat
function safe(handler) {
  return (req, res) => {
    try {
      handler(req, res);
    } catch (err) {
      console.error('Error:', err.message);
      res.status(500).json({ error: 'File read/write error: ' + err.message });
    }
  };
}

// ------------------------------------------------------------
// Endpoint
// ------------------------------------------------------------

// BONUS: statistik kursus. Harus didefinisikan SEBELUM /api/courses/:id
app.get('/api/courses/stats', safe((req, res) => {
  const courses = loadCourses();
  const byStatus = { 'Not Started': 0, 'In Progress': 0, 'Completed': 0 };
  courses.forEach((c) => {
    if (byStatus[c.status] !== undefined) byStatus[c.status]++;
  });
  res.json({ total: courses.length, by_status: byStatus });
}));

// BONUS: cari kursus berdasarkan nama/deskripsi. GET /api/courses/search?q=python
app.get('/api/courses/search', safe((req, res) => {
  const q = (req.query.q || '').trim().toLowerCase();
  if (!q) {
    return res.status(400).json({ error: 'Query parameter q is required' });
  }
  const results = loadCourses().filter(
    (c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
  );
  res.json(results);
}));

// POST /api/courses - tambah kursus baru
app.post('/api/courses', safe((req, res) => {
  const error = validateCourse(req.body || {}, true);
  if (error) return res.status(400).json({ error });

  const courses = loadCourses();
  const newCourse = {
    id: getNextId(courses),
    name: req.body.name.trim(),
    description: req.body.description.trim(),
    target_date: req.body.target_date,
    status: req.body.status,
    created_at: getTimestamp(),
  };
  courses.push(newCourse);
  saveCourses(courses);
  res.status(201).json(newCourse);
}));

// GET /api/courses - ambil semua kursus
app.get('/api/courses', safe((req, res) => {
  res.json(loadCourses());
}));

// GET /api/courses/:id - ambil satu kursus
app.get('/api/courses/:id', safe((req, res) => {
  const id = parseInt(req.params.id, 10);
  const course = loadCourses().find((c) => c.id === id);
  if (!course) return res.status(404).json({ error: `Course with id ${req.params.id} not found` });
  res.json(course);
}));

// PUT /api/courses/:id - perbarui kursus (field yang dikirim saja yang diubah)
app.put('/api/courses/:id', safe((req, res) => {
  const id = parseInt(req.params.id, 10);
  const courses = loadCourses();
  const index = courses.findIndex((c) => c.id === id);
  if (index === -1) return res.status(404).json({ error: `Course with id ${req.params.id} not found` });

  const body = req.body || {};
  const error = validateCourse(body, false);
  if (error) return res.status(400).json({ error });

  // Hanya field yang boleh diubah; id dan created_at tetap
  ['name', 'description', 'target_date', 'status'].forEach((f) => {
    if (body[f] !== undefined) {
      courses[index][f] = typeof body[f] === 'string' ? body[f].trim() : body[f];
    }
  });
  saveCourses(courses);
  res.json(courses[index]);
}));

// DELETE /api/courses/:id - hapus kursus
app.delete('/api/courses/:id', safe((req, res) => {
  const id = parseInt(req.params.id, 10);
  const courses = loadCourses();
  const index = courses.findIndex((c) => c.id === id);
  if (index === -1) return res.status(404).json({ error: `Course with id ${req.params.id} not found` });

  const [removed] = courses.splice(index, 1);
  saveCourses(courses);
  res.json({ message: 'Course deleted successfully', course: removed });
}));

// JSON yang rusak di body request -> 400, bukan crash
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// ------------------------------------------------------------
// Jalankan server
// ------------------------------------------------------------
try {
  initDataFile();
} catch (err) {
  console.error('Cannot create courses.json:', err.message);
  process.exit(1);
}

app.listen(PORT, () => {
  console.log('CodeCraftHub API is starting...');
  console.log(`Data will be stored in: ${DATA_FILE}`);
  console.log(`API is available at: http://localhost:${PORT}`);
});
