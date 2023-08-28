/**
 * An error that is thrown if the expression {@link Parser} encounters an error.
 */
export class ParserError extends SyntaxError {
  /**
   * The expression that caused the error.
   */
  readonly expression: string;
  /**
   * The column number in which the error occurred.
   */
  readonly column: number;
  /**
   * The line number in which the error occurred.
   */
  readonly line: number;

  /**
   * Constructs a new parser error.
   *
   * @param message - The error message
   * @param expression - The expression that caused the error
   * @param column - The column number in which the error occurred
   * @param line - The line number in which the error occurred
   */
  constructor(message: string, expression: string, column: number, line = 1) {
    super(message);
    this.expression = expression;
    this.column = column;
    this.line = line;
  }
}
