// File: src/ast.ts
// ============================================================================
// WIBUSCRIPT ABSTRACT SYNTAX TREE (AST) DEFINITIONS
// Mendefinisikan struktur simpul pohon sintaksis abstrak WibuScript.
// Mendukung Objek Kamus (ObjectLiteral), Akses Anggota (MemberExpr),
// dan Kontrol Perulangan (BreakStatement & ContinueStatement).
// ============================================================================

export type NodeType =
  // Statements
  | "Program"
  | "VariableDeclaration"
  | "IfStatement"
  | "LoopStatement"
  | "FunctionDeclaration"
  | "ReturnStatement"
  | "BlockStatement"
  | "ExpressionStatement"
  | "BreakStatement"
  | "ContinueStatement"
  | "TryCatchStatement"

  // Expressions
  | "AssignmentExpression"
  | "BinaryExpression"
  | "UnaryExpression"
  | "CallExpression"
  | "Identifier"
  | "NumericLiteral"
  | "StringLiteral"
  | "BooleanLiteral"
  | "NullLiteral"
  | "ArrayLiteral"
  | "ObjectLiteral"
  | "Property"
  | "MemberExpr";

/**
 * Antarmuka dasar untuk semua simpul Statement.
 */
export interface Statement {
  kind: NodeType;
}

/**
 * Simpul teratas program (kumpulan pernyataan).
 */
export interface Program extends Statement {
  kind: "Program";
  body: Statement[];
}

/**
 * Deklarasi variabel: kore <nama> = <nilai> / koreWa <nama> = <nilai>
 */
export interface VariableDeclaration extends Statement {
  kind: "VariableDeclaration";
  identifier: string;
  value: Expression;
}

/**
 * Percabangan kondisi: moshi (<kondisi>) { <then> } chigau { <else> }
 */
export interface IfStatement extends Statement {
  kind: "IfStatement";
  condition: Expression;
  thenBranch: Statement[];
  elseBranch?: Statement[] | undefined;
}

/**
 * Perulangan: zutto (<kondisi>) { <body> } / ulangZutto (<kondisi>) { <body> }
 */
export interface LoopStatement extends Statement {
  kind: "LoopStatement";
  condition: Expression;
  body: Statement[];
}

/**
 * Deklarasi fungsi: jutsu <nama>(<parameter>) { <body> }
 */
export interface FunctionDeclaration extends Statement {
  kind: "FunctionDeclaration";
  name: string;
  parameters: string[];
  body: Statement[];
}

/**
 * Pengembalian nilai fungsi: kaesu <nilai> / balikinDesu <nilai>
 */
export interface ReturnStatement extends Statement {
  kind: "ReturnStatement";
  value?: Expression | undefined;
}

/**
 * Penghentian perulangan: tomare / berhentiDuluKudasai
 */
export interface BreakStatement extends Statement {
  kind: "BreakStatement";
}

/**
 * Peloncatan iterasi perulangan: tsugi / lanjutAksiSugi
 */
export interface ContinueStatement extends Statement {
  kind: "ContinueStatement";
}

/**
 * Penanganan galat: kokoromi { ... } yurusu (err) { ... }
 */
export interface TryCatchStatement extends Statement {
  kind: "TryCatchStatement";
  tryBranch: Statement[];
  catchVariable?: string | undefined;
  catchBranch: Statement[];
}

/**
 * Blok pernyataan dalam kurung kurawal { ... }
 */
export interface BlockStatement extends Statement {
  kind: "BlockStatement";
  body: Statement[];
}

/**
 * Pembungkus ekspresi yang berdiri sebagai pernyataan tunggal (misal: pemanggilan fungsi).
 */
export interface ExpressionStatement extends Statement {
  kind: "ExpressionStatement";
  expression: Expression;
}

/**
 * Antarmuka dasar untuk semua simpul Ekspresi.
 */
export interface Expression extends Statement {}

/**
 * Penugasan nilai ke variabel yang sudah ada: <nama> = <nilai>
 */
export interface AssignmentExpression extends Expression {
  kind: "AssignmentExpression";
  assignee: Expression;
  value: Expression;
}

/**
 * Operasi biner: <kiri> <operator> <kanan>
 */
export interface BinaryExpression extends Expression {
  kind: "BinaryExpression";
  left: Expression;
  operator: string;
  right: Expression;
}

/**
 * Operasi uner: !<ekspresi> atau -<angka>
 */
export interface UnaryExpression extends Expression {
  kind: "UnaryExpression";
  operator: string;
  operand: Expression;
}

/**
 * Pemanggilan fungsi: <callee>(<argumen>)
 */
export interface CallExpression extends Expression {
  kind: "CallExpression";
  callee: string;
  args: Expression[];
}

/**
 * Simbol pengenal (nama variabel atau nama fungsi).
 */
export interface Identifier extends Expression {
  kind: "Identifier";
  symbol: string;
}

/**
 * Literal angka (bilangan bulat atau pecahan desimal).
 */
export interface NumericLiteral extends Expression {
  kind: "NumericLiteral";
  value: number;
}

/**
 * Literal teks string.
 */
export interface StringLiteral extends Expression {
  kind: "StringLiteral";
  value: string;
}

/**
 * Literal logika boolean (maji / majiBener = true, uso / usoBanget = false).
 */
export interface BooleanLiteral extends Expression {
  kind: "BooleanLiteral";
  value: boolean;
}

/**
 * Literal kosong null (kara / kosongZannen).
 */
export interface NullLiteral extends Expression {
  kind: "NullLiteral";
  value: null;
}

/**
 * Literal Barisan / Array: [ el1, el2, ... ]
 */
export interface ArrayLiteral extends Expression {
  kind: "ArrayLiteral";
  elements: Expression[];
}

/**
 * Properti pasangan kunci-nilai pada objek literal.
 */
export interface Property extends Statement {
  kind: "Property";
  key: string;
  value?: Expression | undefined;
}

/**
 * Literal Objek / Kamus: { kunci: nilai, ... }
 */
export interface ObjectLiteral extends Expression {
  kind: "ObjectLiteral";
  properties: Property[];
}

/**
 * Akses Anggota / Properti Objek dengan Titik: objek.properti
 */
export interface MemberExpr extends Expression {
  kind: "MemberExpr";
  object: Expression;
  property: Expression;
  computed: boolean;
}
