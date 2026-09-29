// File: scripts/extract-changelog.cjs
const fs = require("fs");
const path = require("path");

function getReleaseNotes(targetVersion) {
  const rootDir = path.resolve(__dirname, "..");
  const pkgPath = path.join(rootDir, "package.json");
  const changelogPath = path.join(rootDir, "CHANGELOG.md");

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const version = targetVersion || pkg.version;
  const cleanVersion = version.replace(/^v/, "");

  if (!fs.existsSync(changelogPath)) {
    return `Rilis resmi WibuScript versi ${cleanVersion}.`;
  }

  const changelog = fs.readFileSync(changelogPath, "utf8");
  const escapedVersion = cleanVersion.replace(/\./g, "\\.");
  const sectionRegex = new RegExp(
    `## \\[v?${escapedVersion}\\][^\n]*\n([\\s\\S]*?)(?=\n## \\[|$)`
  );
  const match = changelog.match(sectionRegex);

  if (match && match[1]) {
    return match[1].replace(/\n---\s*$/, "").trim();
  }

  return `Pembaruan resmi WibuScript versi ${cleanVersion}.`;
}

if (require.main === module) {
  const argVersion = process.argv[2];
  const notes = getReleaseNotes(argVersion);
  process.stdout.write(notes + "\n");
}

module.exports = { getReleaseNotes };
