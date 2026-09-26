// ============================================================================
// WIBUSCRIPT PARSER
// Mengonversi aliran token menjadi pohon sintaksis abstrak (AST).
// Mendukung Deklarasi Variabel, Percabangan Kondisional, Pemanggilan Fungsi,
// dan Ekspresi Logika/Aritmatika dengan Sistem Alias.
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
  AssignmentExpression,
  BinaryExpression,
  CallExpression,
  Identifier,
  NumericLiteral,
  StringLiteral,
  BooleanLiteral,
  NullLiteral,
} from "./ast.js";
import { TokenType, type Token } from "./lexer.js";

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

      case TokenType.Function:
        return this.parseFunctionDeclaration();

      case TokenType.Return:
        return this.parseReturnStatement();

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

    this.expect(TokenType.OpenParen, "Diharapkan tanda kurung buka '(' setelah kata kunci kondisi.");
    const condition = this.parseExpression();
    this.expect(TokenType.CloseParen, "Diharapkan tanda kurung tutup ')' setelah ekspresi kondisi.");

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
        parameters.push(this.expect(TokenType.Identifier, "Diharapkan nama parameter setelah tanda koma.").value);
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
   * Penugasan nilai: variabel = nilai
   */
  private parseAssignmentExpression(): Expression {
    const left = this.parseComparisonExpression();

    if (this.at().type === TokenType.Equals) {
      this.advance(); // Konsumsi '='
      const value = this.parseAssignmentExpression();

      if (left.kind !== "Identifier") {
        throw new Error("[Parser Error] Sisi kiri dari tanda penugasan '=' harus berupa identifier variabel.");
      }

      return {
        kind: "AssignmentExpression",
        assignee: (left as Identifier).symbol,
        value,
      } as AssignmentExpression;
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
    let left = this.parseCallMemberExpression();

    while (this.at().type === TokenType.Multiply || this.at().type === TokenType.Divide) {
      const operator = this.advance().value;
      const right = this.parseCallMemberExpression();
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
   * Pemanggilan fungsi: fn() atau mite()
   */
  private parseCallMemberExpression(): Expression {
    const member = this.parsePrimaryExpression();

    if (this.at().type === TokenType.OpenParen) {
      return this.parseCallExpression(member);
    }

    return member;
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
   * Elemen ekspresi dasar: Identifier, Literal, Tanda Kurung
   */
  private parsePrimaryExpression(): Expression {
    const token = this.at();

    switch (token.type) {
      case TokenType.Identifier:
      case TokenType.Print:
        // 'mite' atau 'kasihMite' dapat berperan sebagai nama fungsi pemanggilan
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

      case TokenType.OpenParen: {
        this.advance(); // Konsumsi '('
        const value = this.parseExpression();
        this.expect(TokenType.CloseParen, "Diharapkan tanda kurung tutup ')' setelah ekspresi.");
        return value;
      }

      default:
        throw new Error(
          `[Parser Error] Simbol tidak terduga: '${token.value}' pada baris ${token.line}, kolom ${token.column}.`
        );
    }
  }
}
