import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const tarballArgument = process.argv[2];
if (!tarballArgument) {
  throw new Error("Usage: node scripts/smoke-test-package.mjs <package-tarball>");
}

const tarballPath = resolve(tarballArgument);
const packageMetadata = JSON.parse(readFileSync("package.json", "utf8"));
const expectedVersionOutput = `wibuscript v${packageMetadata.version}`;
const tempRoot = await mkdtemp(join(tmpdir(), "wibuscript-package-smoke-"));
const installDir = join(tempRoot, "install");

try {
  await mkdir(installDir, { recursive: true });
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  execFileSync(npmCommand, [
    "install", "--prefix", installDir, "--no-save", "--ignore-scripts",
    "--no-audit", "--no-fund", tarballPath,
  ], { stdio: "inherit" });

  const cliPath = join(installDir, "node_modules", "wibuscript", "dist", "cli.js");
  const cliVersion = execFileSync(process.execPath, [cliPath, "--version"], {
    cwd: installDir,
    encoding: "utf8",
  }).trim();
  if (cliVersion !== expectedVersionOutput) {
    throw new Error(`CLI version mismatch: expected "${expectedVersionOutput}", received "${cliVersion}".`);
  }

  const packageApiCheck = `
    const core = await import("wibuscript");
    const web = await import("wibuscript/web");
    const server = await import("wibuscript/server");
    const container = await import("wibuscript/container");

    if (typeof core.tokenize !== "function" || typeof core.transpileToJS !== "function") {
      throw new Error("Core package exports are missing.");
    }
    if (typeof web.fetchData !== "function" || typeof server.createServer !== "function") {
      throw new Error("Web/server package subpath exports are missing.");
    }
    if (typeof container.ContainerSandbox !== "function") {
      throw new Error("Container package subpath export is missing.");
    }

    const tokens = core.tokenize("kore smoke = 42;");
    if (!Array.isArray(tokens) || tokens.length === 0) {
      throw new Error("Core lexer smoke test returned no tokens.");
    }
    const js = core.transpileToJS('mite("package smoke");');
    if (typeof js !== "string" || js.length === 0) {
      throw new Error("Core transpiler smoke test returned no JavaScript.");
    }
    console.log("Core, web, server, and container exports verified.");
  `;

  execFileSync(process.execPath, ["--input-type=module", "-e", packageApiCheck], {
    cwd: installDir,
    stdio: "inherit",
  });
  console.log(`npm package smoke test passed for wibuscript@${packageMetadata.version}.`);
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}
