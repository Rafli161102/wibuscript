// File: src/pm.ts
// ============================================================================
// WIBUSCRIPT PACKAGE MANAGER (Wibu PM)
// Modul manajemen dependensi dan resolusi modul eksternal WibuScript.
// Mendukung instalasi paket via npm dan resolusi modul 'npm:nama-paket'.
// ============================================================================

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { createRequire } from "module";

export interface PackageInstallOptions {
  cwd?: string;
  dev?: boolean;
  quiet?: boolean;
}

export interface ResolvedNpmModule {
  kind: "wibu" | "js";
  entryPath: string;
  packageName: string;
}

/**
 * Membersihkan dan menormalisasi nama paket dari awalan 'npm:'.
 */
export function normalizePackageName(rawName: string): string {
  const trimmed = (rawName || "").trim();
  if (trimmed.startsWith("npm:")) {
    return trimmed.slice(4).trim();
  }
  return trimmed;
}

/**
 * Memeriksa apakah specifier modul merujuk ke pustaka npm ('npm:nama-paket').
 */
export function isNpmModuleSpecifier(specifier: string): boolean {
  return typeof specifier === "string" && specifier.startsWith("npm:");
}

/**
 * Mencari direktori node_modules terdekat dengan menelusuri hierarki direktori ke atas.
 */
export function findNodeModulesDir(startDir?: string): string | null {
  if (typeof process === "undefined" || !process.versions?.node) {
    return null;
  }
  let currentDir = path.resolve(/*turbopackIgnore: true*/ startDir || process.cwd());

  while (true) {
    const candidate = path.join(/*turbopackIgnore: true*/ currentDir, "node_modules");
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
      return candidate;
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break;
    }
    currentDir = parentDir;
  }

  return null;
}

/**
 * Mencari berkas entri .wibu utama di dalam direktori suatu paket npm.
 */
export function findPackageWibuEntry(packageDir: string): string | null {
  if (!fs.existsSync(packageDir) || !fs.statSync(packageDir).isDirectory()) {
    return null;
  }

  // 1. Cek konfigurasi package.json paket jika tersedia
  const pkgJsonPath = path.join(/*turbopackIgnore: true*/ packageDir, "package.json");
  if (fs.existsSync(pkgJsonPath)) {
    try {
      const rawPkg = fs.readFileSync(pkgJsonPath, "utf-8");
      const pkg = JSON.parse(rawPkg);

      // Prioritas 1: properti 'wibu' eksplisit pada package.json
      if (typeof pkg.wibu === "string" && pkg.wibu.trim().length > 0) {
        const candidate = path.resolve(/*turbopackIgnore: true*/ packageDir, pkg.wibu.trim());
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
          return candidate;
        }
      }

      // Prioritas 2: properti 'main' jika berakhiran .wibu
      if (typeof pkg.main === "string" && pkg.main.trim().endsWith(".wibu")) {
        const candidate = path.resolve(/*turbopackIgnore: true*/ packageDir, pkg.main.trim());
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
          return candidate;
        }
      }
    } catch {
      // Lanjutkan ke kandidat berkas fisik bawaan jika berkas package.json tidak valid
    }
  }

  // 2. Daftar kandidat konvensional berkas wibu di dalam direktori paket
  const pkgName = path.basename(packageDir);
  const candidateFiles = [
    "index.wibu",
    "main.wibu",
    `${pkgName}.wibu`,
    path.join("dist", "index.wibu"),
    path.join("src", "index.wibu"),
    path.join("src", "main.wibu")
  ];

  for (const relPath of candidateFiles) {
    const candidate = path.join(/*turbopackIgnore: true*/ packageDir, relPath);
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }

  return null;
}

/**
 * Menemukan berkas entri JavaScript utama dari sebuah paket npm di dalam node_modules.
 */
export function findPackageJsEntry(packageDir: string): string | null {
  if (!fs.existsSync(packageDir) || !fs.statSync(packageDir).isDirectory()) {
    return null;
  }

  const pkgJsonPath = path.join(/*turbopackIgnore: true*/ packageDir, "package.json");
  if (fs.existsSync(pkgJsonPath)) {
    try {
      const rawPkg = fs.readFileSync(pkgJsonPath, "utf-8");
      const pkg = JSON.parse(rawPkg);

      if (typeof pkg.main === "string" && pkg.main.trim().length > 0) {
        const candidate = path.resolve(/*turbopackIgnore: true*/ packageDir, pkg.main.trim());
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
          return candidate;
        }
        if (fs.existsSync(`${candidate}.js`) && fs.statSync(`${candidate}.js`).isFile()) {
          return `${candidate}.js`;
        }
      }
    } catch {
      // Abaikan error parse
    }
  }

  const jsCandidates = [
    "index.js",
    "main.js",
    path.join("dist", "index.js"),
    path.join("lib", "index.js")
  ];

  for (const rel of jsCandidates) {
    const candidate = path.join(/*turbopackIgnore: true*/ packageDir, rel);
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }

  return null;
}

/**
 * Menyelesaikan metadata paket npm (apakah modul WibuScript atau pustaka JavaScript FFI).
 */
export function resolveNpmPackage(
  importSpecifier: string,
  fromDir?: string
): ResolvedNpmModule | null {
  if (!isNpmModuleSpecifier(importSpecifier)) {
    return null;
  }

  const rawPath = normalizePackageName(importSpecifier);
  if (rawPath.length === 0) {
    return null;
  }

  const nodeModulesDir = findNodeModulesDir(fromDir);
  if (!nodeModulesDir) {
    return null;
  }

  // Pisahkan nama paket dan subpath (mendukung scoped package seperti @scope/pkg)
  let packageName = "";
  let subPath = "";

  if (rawPath.startsWith("@")) {
    const parts = rawPath.split("/");
    if (parts.length >= 2) {
      packageName = `${parts[0]}/${parts[1]}`;
      subPath = parts.slice(2).join("/");
    } else {
      packageName = rawPath;
    }
  } else {
    const parts = rawPath.split("/");
    packageName = parts[0] || "";
    subPath = parts.slice(1).join("/");
  }

  const packageDir = path.join(/*turbopackIgnore: true*/ nodeModulesDir, packageName);
  if (!fs.existsSync(packageDir)) {
    return null;
  }

  // Kasus 1: Subpath tertentu (misal 'npm:matematika/kalkulator')
  if (subPath.length > 0) {
    const wibuSubPath = subPath.endsWith(".wibu") ? subPath : `${subPath}.wibu`;
    const candidateWibu = path.join(/*turbopackIgnore: true*/ packageDir, wibuSubPath);
    if (fs.existsSync(candidateWibu) && fs.statSync(candidateWibu).isFile()) {
      return { kind: "wibu", entryPath: candidateWibu, packageName };
    }

    const indexWibu = path.join(/*turbopackIgnore: true*/ packageDir, subPath, "index.wibu");
    if (fs.existsSync(indexWibu) && fs.statSync(indexWibu).isFile()) {
      return { kind: "wibu", entryPath: indexWibu, packageName };
    }

    const jsSubPath = subPath.endsWith(".js") ? subPath : `${subPath}.js`;
    const candidateJs = path.join(/*turbopackIgnore: true*/ packageDir, jsSubPath);
    if (fs.existsSync(candidateJs) && fs.statSync(candidateJs).isFile()) {
      return { kind: "js", entryPath: candidateJs, packageName };
    }
  }

  // Kasus 2: Entri berkas WibuScript (.wibu)
  const wibuEntry = findPackageWibuEntry(packageDir);
  if (wibuEntry) {
    return { kind: "wibu", entryPath: wibuEntry, packageName };
  }

  // Kasus 3: Pustaka JavaScript umum (Foreign Function Interface / FFI)
  const jsEntry = findPackageJsEntry(packageDir) || packageDir;
  return { kind: "js", entryPath: jsEntry, packageName };
}

/**
 * Menyelesaikan lokasi absolut berkas .wibu dari specifier 'npm:nama-paket[/subpath]'.
 */
export function resolveNpmModule(
  importSpecifier: string,
  fromDir?: string
): string | null {
  const resolved = resolveNpmPackage(importSpecifier, fromDir);
  if (resolved && resolved.kind === "wibu") {
    return resolved.entryPath;
  }
  return null;
}

/**
 * Menyelesaikan lokasi absolut berkas modul WibuScript (lokal maupun dependensi npm:).
 */
export function resolveModulePath(
  specifier: string,
  currentFileDir?: string
): string | null {
  if (isNpmModuleSpecifier(specifier)) {
    return resolveNpmModule(specifier, currentFileDir);
  }

  const baseDir = currentFileDir ? path.resolve(currentFileDir) : process.cwd();
  const directPath = path.isAbsolute(specifier)
    ? specifier
    : path.resolve(baseDir, specifier);

  if (fs.existsSync(directPath) && fs.statSync(directPath).isFile()) {
    return directPath;
  }

  if (!directPath.endsWith(".wibu")) {
    const withExt = `${directPath}.wibu`;
    if (fs.existsSync(withExt) && fs.statSync(withExt).isFile()) {
      return withExt;
    }
  }

  return null;
}

/**
 * Memuat modul JavaScript eksternal dari direktori node_modules pada lingkungan Node.js.
 */
export function loadNpmJsModule(packageName: string, fromDir?: string): any {
  if (typeof process === "undefined" || !process.versions?.node) {
    throw new Error(
      "[Wibu PM Error] Interop pustaka npm JavaScript hanya didukung pada lingkungan Node.js."
    );
  }

  const cleanName = normalizePackageName(packageName);
  const baseDir = fromDir || process.cwd();
  const req = createRequire(path.resolve(baseDir, "package.json"));

  try {
    return req(cleanName);
  } catch (err: unknown) {
    // Jika paket adalah ES Module murni atau path file langsung
    const packageDir = findNodeModulesDir(baseDir);
    if (packageDir) {
      const directTarget = path.join(/*turbopackIgnore: true*/ packageDir, cleanName);
      if (fs.existsSync(directTarget)) {
        try {
          return req(directTarget);
        } catch {
          // Lanjutkan ke pelemparan error asli
        }
      }
    }

    const errMessage = err instanceof Error ? err.message : String(err);
    throw new Error(
      `[Wibu PM Error] Tidak dapat memuat modul npm '${cleanName}': ${errMessage}`
    );
  }
}

/**
 * Menginstal paket pustaka eksternal ke dalam direktori node_modules menggunakan npm CLI.
 */
export function installPackage(
  packageName: string,
  options?: PackageInstallOptions
): boolean {
  const targetPkg = normalizePackageName(packageName);
  if (targetPkg.length === 0) {
    console.error("[Wibu PM Error] Nama paket tidak boleh kosong.");
    return false;
  }

  // Validasi karakter dasar untuk mencegah injection
  if (!/^(@?[a-zA-Z0-9_.-]+)(\/[a-zA-Z0-9_.-]+)?(@[a-zA-Z0-9^~_.-]+)?$/.test(targetPkg)) {
    console.error(
      `[Wibu PM Error] Format nama paket tidak valid: '${targetPkg}'. Nama paket hanya boleh mengandung huruf, angka, tanda minus (-), underscore (_), titik (.), atau tag versi (@).`
    );
    return false;
  }

  const cwd = options?.cwd ? path.resolve(options.cwd) : process.cwd();
  const isDev = Boolean(options?.dev);
  const isQuiet = Boolean(options?.quiet);

  const command = `npm install ${isDev ? "--save-dev " : ""}${targetPkg}`;

  if (!isQuiet) {
    console.log(`[Wibu PM] Menjalankan instalasi paket: ${targetPkg}...`);
  }

  try {
    execSync(command, {
      cwd,
      stdio: isQuiet ? "ignore" : "pipe",
      encoding: "utf-8"
    });

    if (!isQuiet) {
      console.log(`[Wibu PM] Sukses memasang pustaka '${targetPkg}'.`);
    }
    return true;
  } catch (error: any) {
    const stderr = (error.stderr || error.message || "").toString();

    if (stderr.includes("404") || stderr.includes("E404")) {
      console.error(
        `[Wibu PM Error] Paket '${targetPkg}' tidak ditemukan di registry npm. Pastikan ejaan nama paket sudah benar.`
      );
    } else if (stderr.includes("ETARGET") || stderr.includes("No matching version")) {
      console.error(
        `[Wibu PM Error] Versi yang diminta untuk paket '${targetPkg}' tidak kompatibel atau tidak tersedia di registry npm.`
      );
    } else if (
      stderr.includes("ENOTFOUND") ||
      stderr.includes("ECONNREFUSED") ||
      stderr.includes("ETIMEDOUT")
    ) {
      console.error(
        `[Wibu PM Error] Gagal terhubung ke registry npm saat memasang '${targetPkg}'. Periksa koneksi internet Anda.`
      );
    } else {
      console.error(
        `[Wibu PM Error] Gagal memasang paket '${targetPkg}'. Detail kesalahan:\n${stderr.trim()}`
      );
    }

    return false;
  }
}

/**
 * Menghasilkan daftar nama paket yang terpasang di direktori node_modules proyek.
 */
export function getInstalledPackages(projectRoot?: string): string[] {
  if (typeof process === "undefined" || !process.versions?.node) {
    return [];
  }
  const nodeModulesDir = findNodeModulesDir(projectRoot);
  if (!nodeModulesDir || !fs.existsSync(nodeModulesDir)) {
    return [];
  }

  const results: string[] = [];
  const entries = fs.readdirSync(nodeModulesDir);

  for (const entry of entries) {
    if (entry.startsWith(".")) {
      continue;
    }

    const fullPath = path.join(/*turbopackIgnore: true*/ nodeModulesDir, entry);
    if (!fs.statSync(fullPath).isDirectory()) {
      continue;
    }

    if (entry.startsWith("@")) {
      // Scoped packages
      try {
        const subEntries = fs.readdirSync(fullPath);
        for (const sub of subEntries) {
          if (!sub.startsWith(".")) {
            results.push(`${entry}/${sub}`);
          }
        }
      } catch {
        // Lewati jika tidak dapat dibaca
      }
    } else {
      results.push(entry);
    }
  }

  return results;
}
