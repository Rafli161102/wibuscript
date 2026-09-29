#!/usr/bin/env bash
# File: scripts/prepare-linguist-pr.sh
# ============================================================================
# WIBUSCRIPT GITHUB LINGUIST REGISTRATION HELPER
# Menyiapkan berkas-berkas pendaftaran WibuScript ke github-linguist/linguist.
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
LINGUIST_DIR="${1:-${ROOT_DIR}/../linguist}"

echo "======================================================="
echo "WibuScript GitHub Linguist Registration Generator"
echo "======================================================="

echo "Direktori repositori WibuScript: ${ROOT_DIR}"
echo "Direktori target Linguist:       ${LINGUIST_DIR}"

if [ ! -d "${LINGUIST_DIR}" ]; then
  echo ""
  echo "Direktori Linguist belum ditemukan di ${LINGUIST_DIR}."
  echo "Untuk melakukan kloning fork github-linguist/linguist:"
  echo "  git clone https://github.com/<username-github>/linguist.git \"${LINGUIST_DIR}\""
  echo "  cd \"${LINGUIST_DIR}\""
  echo "  git checkout -b add-wibuscript"
  echo "  ${SCRIPT_DIR}/prepare-linguist-pr.sh \"${LINGUIST_DIR}\""
  exit 0
fi

echo "1. Menyalin berkas sampel ke ${LINGUIST_DIR}/samples/WibuScript/..."
mkdir -p "${LINGUIST_DIR}/samples/WibuScript"
cp -v "${ROOT_DIR}/.github/linguist/samples/WibuScript/"*.wibu "${LINGUIST_DIR}/samples/WibuScript/"

echo "2. Definisi bahasa WibuScript siap digabungkan ke ${LINGUIST_DIR}/lib/linguist/languages.yml:"
cat "${ROOT_DIR}/.github/linguist/wibuscript.yml"

echo ""
echo "3. Catatan Pull Request siap diajukan ke github-linguist/linguist:"
echo "   Lihat template lengkap di: .github/linguist/PULL_REQUEST.md"
echo ""
echo "Langkah selanjutnya:"
echo "  1. Buka https://github.com/github-linguist/linguist/fork"
echo "  2. Masukkan definisi WibuScript ke lib/linguist/languages.yml"
echo "  3. Jalankan 'bundle exec rake test' atau verifikasi 'script/update-ids'"
echo "  4. Ajukan Pull Request dengan teks deskripsi dari .github/linguist/PULL_REQUEST.md"
echo "======================================================="
