// File: scripts/check-branch.cjs
const { execSync } = require("child_process");

try {
  const currentBranch = execSync("git rev-parse --abbrev-ref HEAD", {
    encoding: "utf8",
  }).trim();

  if (currentBranch === "main" || currentBranch === "master") {
    console.error(
      "\x1b[31m[WIBUSCRIPT ENTERPRISE] Akses Ditolak: Dilarang keras melakukan direct push ke branch main! Silakan buat branch baru (feature/ atau fix/) dan ajukan Pull Request.\x1b[0m"
    );
    process.exit(1);
  }
} catch (error) {
  if (error.status === 1) {
    process.exit(1);
  }
}
