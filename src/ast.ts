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
  | "ForEachStatement"
  | "ClassDeclaration"
  | "ExportStatement"
  | "ImportStatement"
  | "MatchStatement"

  // Expressions
  | "AssignmentExpression"
  | "BinaryExpression"
  | "UnaryExpression"
  | "ArrowFunctionExpression"
  | "CallExpression"
  | "NewExpression"
  | "ThisExpression"
  | "Identifier"
  | "NumericLiteral"
  | "StringLiteral"
  | "BooleanLiteral"
  | "NullLiteral"
  | "ArrayLiteral"
  | "ObjectLiteral"
  | "Property"
  | "MemberExpr"
  | "SpreadElement"
  | "ArrayPattern"
  | "ObjectPattern";

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
 * Pola pembongkaran data (Destructuring Pattern)
 */
export type DestructuringPattern = ArrayPattern | ObjectPattern;

export interface RestElement {
  kind: "RestElement";
  argument: string;
}

export interface ArrayPattern {
  kind: "ArrayPattern";
  elements: (string | RestElement | null)[];
}

export interface ObjectPattern {
  kind: "ObjectPattern";
  properties: { key: string; target?: string }[];
}

/**
 * Deklarasi variabel: kore <nama> = <nilai> atau kore [a, b] = <nilai> atau kore { x, y } = <nilai>
 */
export interface VariableDeclaration extends Statement {
  kind: "VariableDeclaration";
  identifier: string;
  pattern?: DestructuringPattern | undefined;
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
 * Perulangan iterasi koleksi: subete (item no koleksi) { <body> }
 */
export interface ForEachStatement extends Statement {
  kind: "ForEachStatement";
  item: string;
  collection: Expression;
  body: Statement[];
}

/**
 * Deklarasi kelas / sekte: sekte Nama [keishou Induk] { ... }
 */
export interface ClassDeclaration extends Statement {
  kind: "ClassDeclaration";
  name: string;
  parentClass?: string | undefined;
  constructorMethod?: FunctionDeclaration | undefined;
  methods: FunctionDeclaration[];
}

/**
 * Ekspor modul: koukai { nama1, nama2 } atau koukai jutsu foo() { ... }
 */
export interface ExportStatement extends Statement {
  kind: "ExportStatement";
  exportedNames: string[];
  declaration?: Statement | undefined;
}

/**
 * Impor modul: toriyoseru { nama1, nama2 } kara "./modul.wibu"
 */
export interface ImportStatement extends Statement {
  kind: "ImportStatement";
  importedNames: string[];
  source: string;
}

/**
 * Kasus cabang dalam pencocokan pola: baai <nilai>: { ... } atau hyoujun: { ... }
 */
export interface MatchCase {
  value?: Expression | undefined; // undefined = kasus default (hyoujun / sisaan)
  body: Statement[];
}

/**
 * Pencocokan pola / percabangan banyak: shougo (<diskriminan>) { baai ...: ... hyoujun: ... }
 */
export interface MatchStatement extends Statement {
  kind: "MatchStatement";
  discriminant: Expression;
  cases: MatchCase[];
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
 * Fungsi sebaris / lambda: (x, y) => x + y atau x => { <body> }
 */
export interface ArrowFunctionExpression extends Expression {
  kind: "ArrowFunctionExpression";
  parameters: string[];
  body: Statement[];
  isExpressionBody?: boolean | undefined;
}

/**
 * Penugasan nilai ke variabel yang sudah ada: <nama> = <nilai> atau [a, b] = <nilai>
 */
export interface AssignmentExpression extends Expression {
  kind: "AssignmentExpression";
  assignee: Expression | DestructuringPattern;
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
  callee: string | Expression;
  args: Expression[];
}

/**
 * Instansiasi objek baru: atarashii / ata / bikinBaru / anyaran NamaKelas(arg1, arg2)
 */
export interface NewExpression extends Expression {
  kind: "NewExpression";
  className: string;
  args: Expression[];
}

/**
 * Referensi instans objek saat ini: jibun / ji / siAing / awakku
 */
export interface ThisExpression extends Expression {
  kind: "ThisExpression";
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
 * Elemen sebar (Spread / Rest): ...argument
 */
export interface SpreadElement {
  kind: "SpreadElement";
  argument: Expression;
}

/**
 * Literal Barisan / Array: [ el1, el2, ... ]
 */
export interface ArrayLiteral extends Expression {
  kind: "ArrayLiteral";
  elements: (Expression | SpreadElement)[];
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
