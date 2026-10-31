/**
 * Safe Mathematical Expression Evaluator
 * Evaluates algebraic expressions safely using Shunting-Yard & Reverse Polish Notation.
 * Never uses unsafe eval() or Function constructors.
 */

type TokenType = 'NUMBER' | 'OPERATOR' | 'LPAREN' | 'RPAREN';

interface Token {
  type: TokenType;
  value: string | number;
}

const PRECEDENCE: Record<string, number> = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
  '%': 2,
  '^': 4,
  'u-': 3, // unary minus
};

const RIGHT_ASSOCIATIVE: Record<string, boolean> = {
  '^': true,
  'u-': true,
};

function tokenize(expression: string): Token[] {
  const sanitized = expression
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/\s+/g, '');

  const tokens: Token[] = [];
  let i = 0;
  let expectUnary = true;

  while (i < sanitized.length) {
    const char = sanitized[i];

    if (char >= '0' && char <= '9' || char === '.') {
      let numStr = '';
      let hasDot = false;
      while (i < sanitized.length && ((sanitized[i] >= '0' && sanitized[i] <= '9') || sanitized[i] === '.')) {
        if (sanitized[i] === '.') {
          if (hasDot) throw new Error('Invalid number format: multiple decimal points');
          hasDot = true;
        }
        numStr += sanitized[i];
        i++;
      }
      tokens.push({ type: 'NUMBER', value: parseFloat(numStr) });
      expectUnary = false;
      continue;
    }

    if (char === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      expectUnary = true;
      i++;
      continue;
    }

    if (char === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      expectUnary = false;
      i++;
      continue;
    }

    if ('+-*/%^'.includes(char)) {
      if (char === '-' && expectUnary) {
        tokens.push({ type: 'OPERATOR', value: 'u-' });
      } else if (char === '+' && expectUnary) {
        // Unary plus can simply be ignored
      } else {
        tokens.push({ type: 'OPERATOR', value: char });
      }
      expectUnary = true;
      i++;
      continue;
    }

    throw new Error(`Unexpected character in expression: '${char}'`);
  }

  return tokens;
}

export function evaluateExpression(expression: string): { success: boolean; result?: number; error?: string } {
  if (!expression || !expression.trim()) {
    return { success: false, error: 'Expression is empty' };
  }

  try {
    const tokens = tokenize(expression);
    if (tokens.length === 0) {
      return { success: false, error: 'Expression is empty' };
    }

    // Shunting-Yard: Convert Infix to RPN (Postfix)
    const outputQueue: Token[] = [];
    const operatorStack: Token[] = [];

    for (const token of tokens) {
      if (token.type === 'NUMBER') {
        outputQueue.push(token);
      } else if (token.type === 'OPERATOR') {
        const op1 = token.value as string;
        while (operatorStack.length > 0) {
          const top = operatorStack[operatorStack.length - 1];
          if (top.type === 'OPERATOR') {
            const op2 = top.value as string;
            const p1 = PRECEDENCE[op1] || 0;
            const p2 = PRECEDENCE[op2] || 0;
            const isRightAssoc = !!RIGHT_ASSOCIATIVE[op1];

            if ((!isRightAssoc && p1 <= p2) || (isRightAssoc && p1 < p2)) {
              outputQueue.push(operatorStack.pop()!);
              continue;
            }
          }
          break;
        }
        operatorStack.push(token);
      } else if (token.type === 'LPAREN') {
        operatorStack.push(token);
      } else if (token.type === 'RPAREN') {
        let foundLparen = false;
        while (operatorStack.length > 0) {
          const popped = operatorStack.pop()!;
          if (popped.type === 'LPAREN') {
            foundLparen = true;
            break;
          }
          outputQueue.push(popped);
        }
        if (!foundLparen) {
          return { success: false, error: 'Mismatched parentheses: extra ")"' };
        }
      }
    }

    while (operatorStack.length > 0) {
      const op = operatorStack.pop()!;
      if (op.type === 'LPAREN' || op.type === 'RPAREN') {
        return { success: false, error: 'Mismatched parentheses: unclosed "("' };
      }
      outputQueue.push(op);
    }

    // Evaluate RPN
    const evalStack: number[] = [];

    for (const token of outputQueue) {
      if (token.type === 'NUMBER') {
        evalStack.push(token.value as number);
      } else if (token.type === 'OPERATOR') {
        const op = token.value as string;

        if (op === 'u-') {
          if (evalStack.length < 1) throw new Error('Invalid syntax for unary minus');
          const val = evalStack.pop()!;
          evalStack.push(-val);
          continue;
        }

        if (evalStack.length < 2) {
          throw new Error('Malformed expression: missing operand');
        }

        const b = evalStack.pop()!;
        const a = evalStack.pop()!;

        switch (op) {
          case '+':
            evalStack.push(a + b);
            break;
          case '-':
            evalStack.push(a - b);
            break;
          case '*':
            evalStack.push(a * b);
            break;
          case '/':
            if (Math.abs(b) < 1e-15) {
              return { success: false, error: 'Cannot divide by zero' };
            }
            evalStack.push(a / b);
            break;
          case '%':
            if (Math.abs(b) < 1e-15) {
              return { success: false, error: 'Cannot calculate modulo by zero' };
            }
            evalStack.push(a % b);
            break;
          case '^': {
            const powered = Math.pow(a, b);
            if (isNaN(powered) || !isFinite(powered)) {
              return { success: false, error: 'Power resulted in invalid/complex value' };
            }
            evalStack.push(powered);
            break;
          }
          default:
            throw new Error(`Unknown operator: ${op}`);
        }
      }
    }

    if (evalStack.length !== 1) {
      return { success: false, error: 'Invalid expression structure' };
    }

    const finalResult = evalStack[0];
    if (isNaN(finalResult) || !isFinite(finalResult)) {
      return { success: false, error: 'Calculation resulted in infinity or undefined' };
    }

    return { success: true, result: finalResult };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Calculation error';
    return { success: false, error: msg };
  }
}

export function formatValue(value: number, precision: number = 4, useGrouping: boolean = true): string {
  if (value === null || value === undefined || isNaN(value)) return '0';

  if (Math.abs(value - Math.round(value)) < 1e-12) {
    const intVal = Math.round(value);
    return useGrouping ? intVal.toLocaleString('en-US') : intVal.toString();
  }

  // Format to decimal places
  const fixed = value.toFixed(precision);
  const trimmed = fixed.replace(/\.?0+$/, '');

  if (!useGrouping) return trimmed;

  const [intPart, decPart] = trimmed.split('.');
  const formattedInt = parseInt(intPart, 10).toLocaleString('en-US');
  return decPart ? `${formattedInt}.${decPart}` : formattedInt;
}
