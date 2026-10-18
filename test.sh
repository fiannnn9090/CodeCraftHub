#!/bin/bash
# Uji semua endpoint CodeCraftHub. Jalankan server dulu: npm start
BASE=http://localhost:${PORT:-5000}/api/courses
echo "== POST (tambah)";        curl -sS -X POST $BASE -H "Content-Type: application/json" -d '{"name":"Python Basics","description":"Learn Python fundamentals","target_date":"2025-12-31","status":"Not Started"}'; echo
echo "== POST (field kurang)";  curl -sS -X POST $BASE -H "Content-Type: application/json" -d '{"name":"X"}'; echo
echo "== POST (status salah)";  curl -sS -X POST $BASE -H "Content-Type: application/json" -d '{"name":"X","description":"Y","target_date":"2025-12-31","status":"Done"}'; echo
echo "== GET semua";            curl -sS $BASE; echo
echo "== GET id 1";             curl -sS $BASE/1; echo
echo "== GET id 99 (404)";      curl -sS $BASE/99; echo
echo "== PUT id 1";             curl -sS -X PUT $BASE/1 -H "Content-Type: application/json" -d '{"status":"In Progress"}'; echo
echo "== STATS";                curl -sS $BASE/stats; echo
echo "== SEARCH python";        curl -sS "$BASE/search?q=python"; echo
echo "== DELETE id 1";          curl -sS -X DELETE $BASE/1; echo
