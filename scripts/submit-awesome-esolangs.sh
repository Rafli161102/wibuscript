#!/usr/bin/env bash
# ==============================================================================
# Script Automasi Registrasi WibuScript ke angrykoala/awesome-esolangs
# ==============================================================================
set -e

REPO_DIR="/Users/macbookpro/Web/awesome-esolangs"
FORK_URL="https://github.com/Rafli161102/awesome-esolangs.git"
UPSTREAM_URL="https://github.com/angrykoala/awesome-esolangs.git"
BRANCH_NAME="add-wibuscript"

echo "[INFO] Menyiapkan repository awesome-esolangs..."

if [ ! -d "$REPO_DIR" ]; then
  echo "[INFO] Melakukan clone upstream awesome-esolangs..."
  git clone "$UPSTREAM_URL" "$REPO_DIR"
fi

cd "$REPO_DIR"

git checkout -B "$BRANCH_NAME"

# Pastikan remote fork terdaftar
if ! git remote | grep -q "^fork$"; then
  echo "[INFO] Menambahkan remote fork: $FORK_URL"
  git remote add fork "$FORK_URL"
else
  git remote set-url fork "$FORK_URL"
fi

# Cek apakah WibuScript sudah ada di README.md
if ! grep -q "WibuScript" README.md; then
  echo "[INFO] Menyisipkan WibuScript ke daftar bahasa..."
  python3 -c '
path = "README.md"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

target = "* [Whitespace](http://web.archive.org/web/20150623025348/http://compsoc.dur.ac.uk/whitespace) - Use only white-characters (space, tabs and newlines).\n"
replacement = target + "* [WibuScript](https://github.com/Rafli161102/wibuscript) - Multi-dialect esoteric programming language and JavaScript transpiler based on otaku subculture.\n"

if target not in content:
    print("[ERROR] Target penempatan tidak ditemukan di README.md")
    exit(1)

new_content = content.replace(target, replacement, 1)
with open(path, "w", encoding="utf-8") as f:
    f.write(new_content)
print("[OK] Entry WibuScript berhasil ditambahkan.")
'
fi

# Commit jika ada perubahan
if git status --porcelain | grep -q "README.md"; then
  echo "[INFO] Membuat commit perubahan..."
  git add README.md
  git commit -m "Add WibuScript to Languages"
fi

echo "[INFO] Melakukan push ke fork GitHub ($FORK_URL)..."
if git push -u fork "$BRANCH_NAME" 2>&1; then
  echo ""
  echo "================================================================================"
  echo "[SUKSES] Branch $BRANCH_NAME berhasil di-push ke fork Rafli161102/awesome-esolangs!"
  echo ""
  echo "Buka tautan berikut untuk membuka Pull Request secara langsung:"
  echo "https://github.com/angrykoala/awesome-esolangs/compare/master...Rafli161102:awesome-esolangs:add-wibuscript?expand=1"
  echo "================================================================================"
else
  echo ""
  echo "================================================================================"
  echo "[PERINGATAN] Push ke fork gagal karena repositori fork belum dibuat di GitHub."
  echo ""
  echo "Langkah 1-Klik:"
  echo "1. Buka tautan: https://github.com/angrykoala/awesome-esolangs/fork"
  echo "2. Klik tombol 'Create fork'"
  echo "3. Jalankan kembali script ini: bash scripts/submit-awesome-esolangs.sh"
  echo "================================================================================"
fi
