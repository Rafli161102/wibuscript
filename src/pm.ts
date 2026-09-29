// File: src/pm.ts
// ============================================================================
// WIBUSCRIPT PACKAGE MANAGER (Wibu PM)
// Modul manajemen dependensi dan resolusi modul eksternal WibuScript.
// Mendukung instalasi paket via npm dan resolusi modul 'npm:nama-paket'.
// ============================================================================

import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";

export interface PackageInstallOptions {
  cwd?: string;
  dev?: boolean;
  quiet?: boolean;
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
  let currentDir = path.resolve(startDir || process.cwd());

  while (true) {
    const candidate = path.join(currentDir, "node_modules");
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
  const pkgJsonPath = path.join(packageDir, "package.json");
  if (fs.existsSync(pkgJsonPath)) {
    try {
      const rawPkg = fs.readFileSync(pkgJsonPath, "utf-8");
      const pkg = JSON.parse(rawPkg);

      // Prioritas 1: properti 'wibu' eksplisit pada package.json
      if (typeof pkg.wibu === "string" && pkg.wibu.trim().length > 0) {
        const candidate = path.resolve(packageDir, pkg.wibu.trim());
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
          return candidate;
        }
      }

      // Prioritas 2: properti 'main' jika berakhiran .wibu
      if (typeof pkg.main === "string" && pkg.main.trim().endsWith(".wibu")) {
        const candidate = path.resolve(packageDir, pkg.main.trim());
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
    const candidate = path.join(packageDir, relPath);
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }

  return null;
}

/**
 * Menyelesaikan lokasi absolut berkas .wibu dari specifier 'npm:nama-paket[/subpath]'.
 */
export function resolveNpmModule(
  importSpecifier: string,
  fromDir?: string
): string | null {
  if (!isNpmModuleSpecifier(importSpecifier)) {
    return null;
  }

  const rawPath = importSpecifier.slice(4).trim(); // Menghapus awalan 'npm:'
  if (rawPath.length === 0) {
    return null;
  }

  const nodeModulesDir = findNodeModulesDir(fromDir);
  if (!nodeModulesDir) {
    return null;
  }

  // Pisahkan nama paket dan subpath (mendukung scoped package seperti @organisasi/paket)
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

  const packageDir = path.join(nodeModulesDir, packageName);
  if (!fs.existsSync(packageDir)) {
    return null;
  }

  // Jika menyertakan subpath spesifik (misal 'npm:matematika/aljabar')
  if (subPath.length > 0) {
    const cleanSubPath = subPath.endsWith(".wibu") ? subPath : `${subPath}.wibu`;
    const directCandidate = path.join(packageDir, cleanSubPath);
    if (fs.existsSync(directCandidate) && fs.statSync(directCandidate).isFile()) {
      return directCandidate;
    }

    const indexCandidate = path.join(packageDir, subPath, "index.wibu");
    if (fs.existsSync(indexCandidate) && fs.statSync(indexCandidate).isFile()) {
      return indexCandidate;
    }

    return null;
  }

  // Jika tanpa subpath, cari berkas entri utama
  return findPackageWibuEntry(packageDir);
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
 * Menginstal paket pustaka eksternal ke dalam direktori node_modules menggunakan npm CLI.
 */
export function installPackage(
  packageName: string,
  options?: PackageInstallOptions
): boolean {
  const targetPkg = (packageName || "").trim();
  if (targetPkg.length === 0) {
    console.error("[Wibu PM Error] Nama paket tidak boleh kosong.");
    return false;
  }

  // Validasi karakter dasar untuk mencegah injection
  if (!/^(@?[a-zA-Z0-9_.-]+)(\/[a-zA-Z0-9_.-]+)?(@[a-zA-Z0-9^~_.-]+)?$/.test(targetPkg)) {
    console.error(`[Wibu PM Error] Format nama paket tidak valid: '${targetPkg}'`);
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
      stdio: isQuiet ? "ignore" : "inherit",
      encoding: "utf-8"
    });

    if (!isQuiet) {
      console.log(`[Wibu PM] Sukses memasang pustaka '${targetPkg}'.`);
    }
    return true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[Wibu PM Error] Gagal memasang paket '${targetPkg}': ${message}`);
    return false;
  }
}

/**
 * Menghasilkan daftar nama paket yang terpasang di direktori node_modules proyek.
 */
export function getInstalledPackages(projectRoot?: string): string[] {
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

    const fullPath = path.join(nodeModulesDir, entry);
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
