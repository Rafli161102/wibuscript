// File: scripts/fix-esm-imports.cjs
// Skrip post-build untuk menambahkan ekstensi .js pada relative imports
// di dalam folder dist/. Diperlukan karena:
// - Turbopack (Next.js) membutuhkan import TANPA ekstensi .js pada source .ts
// - Node.js ESM membutuhkan import DENGAN ekstensi .js pada output .js

const fs = require("fs");
const path = require("path");

const distDir = path.resolve(__dirname, "..", "dist");

const jsFiles = fs
  .readdirSync(distDir)
  .filter((file) => file.endsWith(".js"));

let totalPatched = 0;

for (const file of jsFiles) {
  const filePath = path.join(distDir, file);
  let content = fs.readFileSync(filePath, "utf8");
  const original = content;

  // Menambahkan .js ke import relatif: from "./module" -> from "./module.js"
  content = content.replace(
    /from\s+["'](\.\/.+?)["']/g,
    (match, importPath) => {
      if (importPath.endsWith(".js")) return match;
      return `from "${importPath}.js"`;
    }
  );

  // Menambahkan .js ke re-export: export * from "./module" -> export * from "./module.js"
  content = content.replace(
    /export\s+\*\s+from\s+["'](\.\/.+?)["']/g,
    (match, importPath) => {
      if (importPath.endsWith(".js")) return match;
      return `export * from "${importPath}.js"`;
    }
  );

  // Menambahkan .js ke dynamic import relatif: import("./module") -> import("./module.js")
  content = content.replace(
    /import\(\s*["'](\.\/.+?)["']\s*\)/g,
    (match, importPath) => {
      if (importPath.endsWith(".js")) return match;
      return `import("${importPath}.js")`;
    }
  );

  if (file === "cli.js" && !content.startsWith("#!/usr/bin/env node")) {
    content = `#!/usr/bin/env node\n${content}`;
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf8");
    totalPatched++;
  }
}

console.log(
  `[fix-esm-imports] ${totalPatched} berkas di dist/ berhasil diperbarui.`
);
