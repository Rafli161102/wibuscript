#!/usr/bin/env bash
# ==============================================================================
# Script Automasi Registrasi WibuScript ke Esolangs Wiki (esolangs.org)
# ==============================================================================
set -e

WIKITEXT_FILE="/Users/macbookpro/Web/wibuscript/.github/esolangs/WibuScript.wikitext"
API_URL="https://esolangs.org/w/api.php"
PAGE_TITLE="WibuScript"
PAGE_URL="https://esolangs.org/wiki/$PAGE_TITLE"
EDIT_URL="https://esolangs.org/wiki/$PAGE_TITLE?action=edit"
COOKIE_FILE="/tmp/esolangs_wiki_session.txt"

if [ ! -f "$WIKITEXT_FILE" ]; then
  echo "[ERROR] File wikitext tidak ditemukan di: $WIKITEXT_FILE"
  exit 1
fi

echo "[INFO] Memeriksa status halaman '$PAGE_TITLE' di Esolangs Wiki..."
EXISTS_CHECK=$(curl -s "$API_URL?action=query&titles=$PAGE_TITLE&format=json")

if echo "$EXISTS_CHECK" | grep -q '"pageid"'; then
  echo "================================================================================"
  echo "[SUKSES] Halaman $PAGE_TITLE SUDAH TERDAFTAR di Esolangs Wiki!"
  echo "Tautan: $PAGE_URL"
  echo "================================================================================"
  exit 0
fi

echo "[INFO] Halaman belum terdaftar. Menyiapkan registrasi automasi..."

# Mode 1: Jika user menyediakan environment variable session cookie atau akun
if [ -n "$ESOLANG_COOKIE" ]; then
  echo "[INFO] Menggunakan ESOLANG_COOKIE untuk mempublikasikan halaman..."
  echo "$ESOLANG_COOKIE" > "$COOKIE_FILE"
  
  CSRF_TOKEN=$(curl -s -b "$COOKIE_FILE" "$API_URL?action=query&meta=tokens&type=csrf&format=json" | grep -o '"csrftoken":"[^"]*"' | cut -d'"' -f4)
  
  echo "[INFO] Mengirim artikel melalui MediaWiki API..."
  RESPONSE=$(curl -s -b "$COOKIE_FILE" -c "$COOKIE_FILE" -X POST "$API_URL" \
    --data-urlencode "action=edit" \
    --data-urlencode "title=$PAGE_TITLE" \
    --data-urlencode "summary=Create WibuScript esoteric programming language article" \
    --data-urlencode "text@$WIKITEXT_FILE" \
    --data-urlencode "token=$CSRF_TOKEN" \
    --data-urlencode "format=json")

  if echo "$RESPONSE" | grep -q '"result":"Success"'; then
    echo "================================================================================"
    echo "[SUKSES] Halaman $PAGE_TITLE berhasil dibuat melalui API!"
    echo "Tautan: $PAGE_URL"
    echo "================================================================================"
    exit 0
  else
    echo "[PERINGATAN] Publikasi API gagal: $RESPONSE"
  fi
fi

# Mode 2: Automasi Clipboard + Web 1-Click
if command -v pbcopy >/dev/null 2>&1; then
  pbcopy < "$WIKITEXT_FILE"
  echo "[INFO] Konten Wikitext resmi WibuScript telah disalin otomatis ke CLIPBOARD komputer Anda!"
fi

echo ""
echo "================================================================================"
echo "REGISTRASI DIREKTORI RESMI: ESOLANGS WIKI"
echo "================================================================================"
echo "Esolangs Wiki (esolangs.org) mewajibkan akun terdaftar untuk pencegahan spam bot."
echo ""
echo "Konten Wikitext WibuScript sudah 100% siap dan otomatis tersalin di Clipboard."
echo ""
echo "Langkah 1-Klik:"
echo "1. Buka tautan pembuatan artikel:"
echo "   $EDIT_URL"
echo "2. Tekan Tempel / Paste (Cmd + V) di kotak teks."
echo "3. Klik 'Save page' (Simpan Halaman)."
echo ""
echo "File referensi wikitext tersimpan di:"
echo "   $WIKITEXT_FILE"
echo "================================================================================"
