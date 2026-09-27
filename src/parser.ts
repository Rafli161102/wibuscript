// File: src/parser.ts
// ============================================================================
// WIBUSCRIPT PARSER
// Mengonversi aliran token menjadi pohon sintaksis abstrak (AST).
// Mendukung Deklarasi Variabel, Percabangan Kondisional, Pemanggilan Fungsi,
// Kontrol Perulangan (Break/Continue), Objek Literal {}, dan Akses Titik (obj.prop).
// ============================================================================

import type {
  Program,
  Statement,
  Expression,
  VariableDeclaration,
  IfStatement,
  LoopStatement,
  FunctionDeclaration,
  ReturnStatement,
  BlockStatement,
  ExpressionStatement,
  BreakStatement,
  ContinueStatement,
  TryCatchStatement,
  AssignmentExpression,
  BinaryExpression,
  UnaryExpression,
  CallExpression,
  Identifier,
  NumericLiteral,
  StringLiteral,
  BooleanLiteral,
  NullLiteral,
  ArrayLiteral,
  ObjectLiteral,
  Property,
  MemberExpr,
} from "./ast";
import { TokenType, type Token } from "./lexer";

export class Parser {
  private tokens: Token[] = [];
  private cursor: number = 0;

  /**
   * Menghasilkan pohon sintaksis program (Program AST) dari daftar token.
   */
  public produceAST(tokens: Token[]): Program {
    this.tokens = tokens;
    this.cursor = 0;

    const program: Program = {
      kind: "Program",
      body: [],
    };

    while (!this.isAtEnd()) {
      program.body.push(this.parseStatement());
    }

    return program;
  }

  private isAtEnd(): boolean {
    return this.at().type === TokenType.EOF;
  }

  private at(): Token {
    const token = this.tokens[this.cursor];
    if (!token) {
      return {
        type: TokenType.EOF,
        value: "EndOfFile",
        line: 0,
        column: 0,
      };
    }
    return token;
  }

  private advance(): Token {
    const prev = this.at();
    this.cursor++;
    return prev;
  }

  private expect(type: TokenType, errMessage: string): Token {
    const currentToken = this.advance();
    if (currentToken.type !== type) {
      throw new Error(
        `[Parser Error] ${errMessage} Ditemukan '${currentToken.value}' pada baris ${currentToken.line}, kolom ${currentToken.column}.`
      );
    }
    return currentToken;
  }

  // --------------------------------------------------------------------------
  // STATEMENTS PARSING
  // --------------------------------------------------------------------------

  private parseStatement(): Statement {
    switch (this.at().type) {
      case TokenType.Var:
        return this.parseVariableDeclaration();

      case TokenType.If:
        return this.parseIfStatement();

      case TokenType.Loop:
        return this.parseLoopStatement();

      case TokenType.Break:
        this.advance(); // Konsumsi 'tomare' atau 'berhentiDuluKudasai'
        if (this.at().type === TokenType.Semicolon) {
          this.advance();
        }
        return { kind: "BreakStatement" } as BreakStatement;

      case TokenType.Continue:
        this.advance(); // Konsumsi 'tsugi' atau 'lanjutAksiSugi'
        if (this.at().type === TokenType.Semicolon) {
          this.advance();
        }
        return { kind: "ContinueStatement" } as ContinueStatement;

      case TokenType.Function:
        return this.parseFunctionDeclaration();

      case TokenType.Return:
        return this.parseReturnStatement();

      case TokenType.Try:
        return this.parseTryCatchStatement();

      case TokenType.OpenBrace:
        return this.parseBlockStatement();

      default:
        return this.parseExpressionStatement();
    }
  }

  /**
   * Deklarasi variabel: kore nama = nilai / koreWa nama = nilai
   */
  private parseVariableDeclaration(): VariableDeclaration {
    this.advance(); // Konsumsi 'kore' atau 'koreWa'

    const identToken = this.expect(
      TokenType.Identifier,
      "Diharapkan nama variabel setelah kata kunci deklarasi."
    );

    this.expect(TokenType.Equals, "Diharapkan tanda '=' setelah nama variabel.");
    const value = this.parseExpression();

    if (this.at().type === TokenType.Semicolon) {
      this.advance();
    }

    return {
      kind: "VariableDeclaration",
      identifier: identToken.value,
      value,
    };
  }

  /**
   * Percabangan kondisional: moshi (kondisi) { ... } chigau { ... }
   */
  private parseIfStatement(): IfStatement {
    this.advance(); // Konsumsi 'moshi' atau 'kaloMoshi'

    this.expect(
      TokenType.OpenParen,
      "Diharapkan tanda kurung buka '(' setelah kata kunci kondisi."
    );
    const condition = this.parseExpression();
    this.expect(
      TokenType.CloseParen,
      "Diharapkan tanda kurung tutup ')' setelah ekspresi kondisi."
    );

    const thenBranch = this.parseBlockOrSingleStatement();
    let elseBranch: Statement[] | undefined = undefined;

    if (this.at().type === TokenType.Else) {
      this.advance(); // Konsumsi 'chigau' atau 'chigauDong'
      elseBranch = this.parseBlockOrSingleStatement();
    }

    return {
      kind: "IfStatement",
      condition,
      thenBranch,
      elseBranch,
    };
  }

  /**
   * Perulangan: zutto (kondisi) { ... } / ulangZutto (kondisi) { ... }
   */
  private parseLoopStatement(): LoopStatement {
    this.advance(); // Konsumsi 'zutto' atau 'ulangZutto'

    this.expect(TokenType.OpenParen, "Diharapkan '(' setelah kata kunci perulangan.");
    const condition = this.parseExpression();
    this.expect(TokenType.CloseParen, "Diharapkan ')' setelah kondisi perulangan.");

    const body = this.parseBlockOrSingleStatement();

    return {
      kind: "LoopStatement",
      condition,
      body,
    };
  }

  /**
   * Deklarasi fungsi: jutsu nama(param1, param2) { ... }
   */
  private parseFunctionDeclaration(): FunctionDeclaration {
    this.advance(); // Konsumsi 'jutsu' atau 'bikinJutsu'

    const nameToken = this.expect(TokenType.Identifier, "Diharapkan nama fungsi.");
    this.expect(TokenType.OpenParen, "Diharapkan '(' setelah nama fungsi.");

    const parameters: string[] = [];
    if (this.at().type !== TokenType.CloseParen) {
      parameters.push(this.expect(TokenType.Identifier, "Diharapkan nama parameter.").value);
      while (this.at().type === TokenType.Comma) {
        this.advance();
        parameters.push(
          this.expect(TokenType.Identifier, "Diharapkan nama parameter setelah tanda koma.").value
        );
      }
    }

    this.expect(TokenType.CloseParen, "Diharapkan ')' setelah daftar parameter.");
    const body = this.parseBlockOrSingleStatement();

    return {
      kind: "FunctionDeclaration",
      name: nameToken.value,
      parameters,
      body,
    };
  }

  /**
   * Pengembalian nilai: kaesu nilai / balikinDesu nilai
   */
  private parseReturnStatement(): ReturnStatement {
    this.advance(); // Konsumsi 'kaesu' atau 'balikinDesu'

    let value: Expression | undefined = undefined;
    if (
      this.at().type !== TokenType.Semicolon &&
      this.at().type !== TokenType.CloseBrace &&
      this.at().type !== TokenType.EOF
    ) {
      value = this.parseExpression();
    }

    if (this.at().type === TokenType.Semicolon) {
      this.advance();
    }

    return {
      kind: "ReturnStatement",
      value,
    };
  }

  /**
   * Penanganan galat: kokoromi { ... } yurusu (err) { ... }
   */
  private parseTryCatchStatement(): TryCatchStatement {
    this.advance(); // Konsumsi kata kunci TRY (kokoromi, koko, cobaDuluBanh, gasTesLur)

    const tryBranch = this.parseBlockOrSingleStatement();

    this.expect(
      TokenType.Catch,
      "Diharapkan kata kunci CATCH (yurusu / yuru / santaiAja / amanBos) setelah blok TRY."
    );

    let catchVariable: string | undefined = undefined;
    if (this.at().type === TokenType.OpenParen) {
      this.advance(); // Konsumsi '('
      catchVariable = this.expect(
        TokenType.Identifier,
        "Diharapkan nama variabel galat (error) di dalam tanda kurung."
      ).value;
      this.expect(
        TokenType.CloseParen,
        "Diharapkan tanda kurung tutup ')' setelah nama variabel galat."
      );
    } else if (this.at().type === TokenType.Identifier) {
      catchVariable = this.advance().value;
    }

    const catchBranch = this.parseBlockOrSingleStatement();

    return {
      kind: "TryCatchStatement",
      tryBranch,
      catchVariable,
      catchBranch,
    };
  }

  /**
   * Blok kode: { statement1; statement2; }
   */
  private parseBlockStatement(): BlockStatement {
    this.expect(TokenType.OpenBrace, "Diharapkan '{' pada awal blok.");
    const body: Statement[] = [];

    while (this.at().type !== TokenType.CloseBrace && !this.isAtEnd()) {
      body.push(this.parseStatement());
    }

    this.expect(TokenType.CloseBrace, "Diharapkan '}' pada akhir blok.");
    return {
      kind: "BlockStatement",
      body,
    };
  }

  private parseBlockOrSingleStatement(): Statement[] {
    if (this.at().type === TokenType.OpenBrace) {
      const block = this.parseBlockStatement();
      return block.body;
    }
    return [this.parseStatement()];
  }

  /**
   * Pernyataan ekspresi (misal: pemanggilan fungsi mite(x);)
   */
  private parseExpressionStatement(): ExpressionStatement {
    const expression = this.parseExpression();

    if (this.at().type === TokenType.Semicolon) {
      this.advance();
    }

    return {
      kind: "ExpressionStatement",
      expression,
    };
  }

  // --------------------------------------------------------------------------
  // EXPRESSIONS PARSING
  // --------------------------------------------------------------------------

  private parseExpression(): Expression {
    return this.parseAssignmentExpression();
  }

  /**
   * Penugasan nilai: variabel = nilai atau objek.prop = nilai atau arr[indeks] = nilai
   */
  private parseAssignmentExpression(): Expression {
    const left = this.parseLogicalOrExpression();

    if (this.at().type === TokenType.Equals) {
      this.advance(); // Konsumsi '='
      const value = this.parseAssignmentExpression();

      if (left.kind !== "Identifier" && left.kind !== "MemberExpr") {
        throw new Error(
          "[Parser Error] Sisi kiri dari tanda penugasan '=' harus berupa identifier variabel atau akses anggota objek/barisan."
        );
      }

      return {
        kind: "AssignmentExpression",
        assignee: left,
        value,
      } as AssignmentExpression;
    }

    return left;
  }

  /**
   * Operator logika OR: ||
   */
  private parseLogicalOrExpression(): Expression {
    let left = this.parseLogicalAndExpression();

    while (this.at().type === TokenType.PipePipe) {
      const operator = this.advance().value;
      const right = this.parseLogicalAndExpression();
      left = {
        kind: "BinaryExpression",
        left,
        operator,
        right,
      } as BinaryExpression;
    }

    return left;
  }

  /**
   * Operator logika AND: &&
   */
  private parseLogicalAndExpression(): Expression {
    let left = this.parseComparisonExpression();

    while (this.at().type === TokenType.AmpersandAmpersand) {
      const operator = this.advance().value;
      const right = this.parseComparisonExpression();
      left = {
        kind: "BinaryExpression",
        left,
        operator,
        right,
      } as BinaryExpression;
    }

    return left;
  }

  /**
   * Operator perbandingan: ==, !=, <, <=, >, >=
   */
  private parseComparisonExpression(): Expression {
    let left = this.parseAdditiveExpression();

    while (
      this.at().type === TokenType.DoubleEquals ||
      this.at().type === TokenType.NotEquals ||
      this.at().type === TokenType.LessThan ||
      this.at().type === TokenType.LessEquals ||
      this.at().type === TokenType.GreaterThan ||
      this.at().type === TokenType.GreaterEquals
    ) {
      const operator = this.advance().value;
      const right = this.parseAdditiveExpression();
      left = {
        kind: "BinaryExpression",
        left,
        operator,
        right,
      } as BinaryExpression;
    }

    return left;
  }

  /**
   * Operator penjumlahan dan pengurangan: +, -
   */
  private parseAdditiveExpression(): Expression {
    let left = this.parseMultiplicativeExpression();

    while (this.at().type === TokenType.Plus || this.at().type === TokenType.Minus) {
      const operator = this.advance().value;
      const right = this.parseMultiplicativeExpression();
      left = {
        kind: "BinaryExpression",
        left,
        operator,
        right,
      } as BinaryExpression;
    }

    return left;
  }

  /**
   * Operator perkalian dan pembagian: *, /
   */
  private parseMultiplicativeExpression(): Expression {
    let left = this.parseUnaryExpression();

    while (this.at().type === TokenType.Multiply || this.at().type === TokenType.Divide) {
      const operator = this.advance().value;
      const right = this.parseUnaryExpression();
      left = {
        kind: "BinaryExpression",
        left,
        operator,
        right,
      } as BinaryExpression;
    }

    return left;
  }

  /**
   * Operator uner: !<ekspresi> atau -<angka>
   */
  private parseUnaryExpression(): Expression {
    if (this.at().type === TokenType.Not || this.at().type === TokenType.Minus) {
      const operator = this.advance().value;
      const operand = this.parseUnaryExpression();
      return {
        kind: "UnaryExpression",
        operator,
        operand,
      } as UnaryExpression;
    }

    return this.parseCallMemberExpression();
  }

  /**
   * Pemanggilan fungsi dan akses anggota: fn() atau obj.prop atau arr[indeks]
   */
  private parseCallMemberExpression(): Expression {
    let member = this.parseMemberExpression();

    while (this.at().type === TokenType.OpenParen) {
      member = this.parseCallExpression(member);
      // Jika setelah pemanggilan terdapat akses anggota berantai: fn().prop atau fn()[indeks]
      while (this.at().type === TokenType.Dot || this.at().type === TokenType.OpenBracket) {
        if (this.at().type === TokenType.Dot) {
          this.advance();
          const propToken = this.expect(
            TokenType.Identifier,
            "Diharapkan nama properti setelah tanda titik '.'."
          );
          member = {
            kind: "MemberExpr",
            object: member,
            property: {
              kind: "Identifier",
              symbol: propToken.value,
            },
            computed: false,
          } as MemberExpr;
        } else {
          this.advance(); // Konsumsi '['
          const property = this.parseExpression();
          this.expect(
            TokenType.CloseBracket,
            "Diharapkan tanda kurung siku tutup ']' setelah indeks barisan."
          );
          member = {
            kind: "MemberExpr",
            object: member,
            property,
            computed: true,
          } as MemberExpr;
        }
      }
    }

    return member;
  }

  /**
   * Akses anggota dengan titik atau tanda kurung siku: objek.properti atau objek[indeks]
   */
  private parseMemberExpression(): Expression {
    let object = this.parsePrimaryExpression();

    while (this.at().type === TokenType.Dot || this.at().type === TokenType.OpenBracket) {
      if (this.at().type === TokenType.Dot) {
        this.advance(); // Konsumsi '.'
        const propertyToken = this.expect(
          TokenType.Identifier,
          "Diharapkan nama properti setelah tanda titik '.'."
        );

        const property: Identifier = {
          kind: "Identifier",
          symbol: propertyToken.value,
        };

        object = {
          kind: "MemberExpr",
          object,
          property,
          computed: false,
        } as MemberExpr;
      } else {
        this.advance(); // Konsumsi '['
        const property = this.parseExpression();
        this.expect(
          TokenType.CloseBracket,
          "Diharapkan tanda kurung siku tutup ']' setelah indeks barisan."
        );

        object = {
          kind: "MemberExpr",
          object,
          property,
          computed: true,
        } as MemberExpr;
      }
    }

    return object;
  }

  private parseCallExpression(caller: Expression): Expression {
    if (caller.kind !== "Identifier") {
      throw new Error("[Parser Error] Target pemanggilan fungsi harus berupa identifier.");
    }

    const callee = (caller as Identifier).symbol;
    const args = this.parseArgs();

    return {
      kind: "CallExpression",
      callee,
      args,
    } as CallExpression;
  }

  private parseArgs(): Expression[] {
    this.expect(TokenType.OpenParen, "Diharapkan '(' sebelum daftar argumen.");
    const args: Expression[] = [];

    if (this.at().type !== TokenType.CloseParen) {
      args.push(this.parseExpression());
      while (this.at().type === TokenType.Comma) {
        this.advance();
        args.push(this.parseExpression());
      }
    }

    this.expect(TokenType.CloseParen, "Diharapkan ')' setelah daftar argumen.");
    return args;
  }

  /**
   * Elemen ekspresi dasar: Identifier, Literal, Objek {}, Tanda Kurung ()
   */
  private parsePrimaryExpression(): Expression {
    const token = this.at();

    switch (token.type) {
      case TokenType.Identifier:
      case TokenType.Print:
        return {
          kind: "Identifier",
          symbol: this.advance().value,
        } as Identifier;

      case TokenType.Number:
        return {
          kind: "NumericLiteral",
          value: parseFloat(this.advance().value),
        } as NumericLiteral;

      case TokenType.String:
        return {
          kind: "StringLiteral",
          value: this.advance().value,
        } as StringLiteral;

      case TokenType.True:
        this.advance();
        return {
          kind: "BooleanLiteral",
          value: true,
        } as BooleanLiteral;

      case TokenType.False:
        this.advance();
        return {
          kind: "BooleanLiteral",
          value: false,
        } as BooleanLiteral;

      case TokenType.Null:
        this.advance();
        return {
          kind: "NullLiteral",
          value: null,
        } as NullLiteral;

      // Literal Barisan / Array: [ el1, el2, ... ]
      case TokenType.OpenBracket: {
        this.advance(); // Konsumsi '['
        const elements: Expression[] = [];

        while (this.at().type !== TokenType.CloseBracket && !this.isAtEnd()) {
          elements.push(this.parseExpression());
          if (this.at().type === TokenType.Comma) {
            this.advance();
          } else if (this.at().type !== TokenType.CloseBracket) {
            this.expect(
              TokenType.CloseBracket,
              "Diharapkan tanda koma ',' atau kurung siku tutup ']' setelah elemen barisan."
            );
          }
        }

        this.expect(
          TokenType.CloseBracket,
          "Diharapkan kurung siku tutup ']' pada akhir literal barisan (array)."
        );

        return {
          kind: "ArrayLiteral",
          elements,
        } as ArrayLiteral;
      }

      // Objek Literal: { kunci: nilai, ... }
      case TokenType.OpenBrace: {
        this.advance(); // Konsumsi '{'
        const properties: Property[] = [];

        while (this.at().type !== TokenType.CloseBrace && !this.isAtEnd()) {
          let key: string;
          if (this.at().type === TokenType.Identifier) {
            key = this.advance().value;
          } else if (this.at().type === TokenType.String) {
            key = this.advance().value;
          } else {
            throw new Error(
              `[Parser Error] Diharapkan kunci properti objek pada baris ${this.at().line}, kolom ${this.at().column}.`
            );
          }

          // Dukungan shorthand: { kunci }
          if (
            this.at().type === TokenType.Comma ||
            this.at().type === TokenType.CloseBrace
          ) {
            properties.push({
              kind: "Property",
              key,
              value: {
                kind: "Identifier",
                symbol: key,
              } as Identifier,
            });
            if (this.at().type === TokenType.Comma) {
              this.advance();
            }
            continue;
          }

          this.expect(
            TokenType.Colon,
            `Diharapkan tanda titik dua ':' setelah kunci properti '${key}'.`
          );

          const value = this.parseExpression();
          properties.push({
            kind: "Property",
            key,
            value,
          });

          if (this.at().type !== TokenType.CloseBrace) {
            this.expect(
              TokenType.Comma,
              "Diharapkan tanda koma ',' atau kurung kurawal tutup '}' setelah pasangan properti."
            );
          }
        }

        this.expect(
          TokenType.CloseBrace,
          "Diharapkan kurung kurawal tutup '}' pada akhir objek."
        );

        return {
          kind: "ObjectLiteral",
          properties,
        } as ObjectLiteral;
      }

      case TokenType.OpenParen: {
        this.advance(); // Konsumsi '('
        const value = this.parseExpression();
        this.expect(
          TokenType.CloseParen,
          "Diharapkan tanda kurung tutup ')' setelah ekspresi."
        );
        return value;
      }

      default:
        throw new Error(
          `[Parser Error] Simbol tidak terduga: '${token.value}' pada baris ${token.line}, kolom ${token.column}.`
        );
    }
  }
}
