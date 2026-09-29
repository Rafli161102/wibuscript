// File: scripts/empty-node.js
// Stub kosong untuk modul bawaan Node.js di lingkungan browser/Turbopack
export const existsSync = () => false;
export const readFileSync = () => "";
export const writeFileSync = () => {};
export const readdirSync = () => [];
export const statSync = () => ({ isDirectory: () => false, isFile: () => false });
export const lstatSync = () => ({ isDirectory: () => false, isFile: () => false });

export const resolve = (...args) => args.join("/");
export const join = (...args) => args.join("/");
export const dirname = () => "";
export const basename = (p = "") => p.split("/").pop() || "";
export const isAbsolute = () => false;
export const extname = () => "";

export const execSync = () => "";
export const createRequire = () => () => ({});

const empty = {
  existsSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  lstatSync,
  resolve,
  join,
  dirname,
  basename,
  isAbsolute,
  extname,
  execSync,
  createRequire,
};

export default empty;
