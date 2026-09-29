#!/usr/bin/env bash
# File: scripts/submit-linguist.sh
# ============================================================================
# SKRIP 1-KLIK PENGIRIMAN PULL REQUEST KE GITHUB LINGUIST
# ============================================================================

set -euo pipefail

LINGUIST_DIR="/Users/macbookpro/Web/linguist"

if [ ! -d "$LINGUIST_DIR" ]; then
  echo "[Error] Direktori $LINGUIST_DIR tidak ditemukan."
  exit 1
fi

echo "Memeriksa repositori fork Rafli161102/linguist di GitHub..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://github.com/Rafli161102/linguist || echo "000")

if [ "$HTTP_STATUS" = "404" ]; then
  echo ""
  echo "=========================================================================="
  echo "PERHATIAN: Fork belum dibuat di akun GitHub Anda."
  echo "Silakan klik link berikut untuk membuat fork (hanya 1 klik di browser):"
  echo "  https://github.com/github-linguist/linguist/fork"
  echo ""
  echo "Setelah tombol hijau 'Create fork' diklik, jalankan kembali skrip ini:"
  echo "  ./scripts/submit-linguist.sh"
  echo "=========================================================================="
  exit 0
fi

echo "Fork terdeteksi! Mengunggah branch 'add-wibuscript' ke GitHub Anda..."
cd "$LINGUIST_DIR"
git remote remove fork 2>/dev/null || true
git remote add fork https://github.com/Rafli161102/linguist.git
git push -u fork add-wibuscript --force

echo ""
echo "=========================================================================="
echo "BERHASIL! Branch 'add-wibuscript' sudah terkirim ke GitHub Anda."
echo ""
echo "Sekarang, buka tautan berikut untuk langsung membuat Pull Request resmi:"
echo "https://github.com/github-linguist/linguist/compare/master...Rafli161102:linguist:add-wibuscript?expand=1"
echo ""
echo "Judul PR: Add support for WibuScript"
echo "Isi teks PR sudah siap di: .github/linguist/PULL_REQUEST.md"
echo "=========================================================================="
