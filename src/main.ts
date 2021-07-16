const LETTER: RegExp = /\w/i;
const NUMBER: RegExp = /\d/i;
const WHITESPACE: RegExp = /\s/i;

interface token {
  type: 'paren' | 'name' | 'number' | 'string';
  value: string;
}

interface ast {
  type: string;
  body: [];
}

function tokenizer(input: string): token[] {
  let tokens: token[] = [];
  const length: number = input.length;
  let i: number = 0;
  while (i < length) {
    let letter: string = input[i];
    if (letter === '(') {
      tokens.push({ type: 'paren', value: '(' });
      i++;
    } else if (WHITESPACE.test(letter)) {
      i++;
    } else if (NUMBER.test(letter)) {
      let value: string = '';
      while (NUMBER.test(letter)) {
        value += letter;
        letter = input[++i];
      }
      tokens.push({
        type: 'number',
        value,
      });
    } else if (letter === '"') {
      let value: string = '';
      letter = input[++i];
      while (letter !== '"') {
        value += letter;
      }
      tokens.push({ type: 'string', value });
    } else if (LETTER.test(letter)) {
      let value: string = '';
      while (LETTER.test(letter)) {
        value += letter;
        letter = input[++i];
      }
      tokens.push({ type: 'name', value });
    } else {
      throw new TypeError('not recognized letter type yet');
    }
  }
  return [];
}

function parse(tokens: token[]): ast {
  const ast = {
    type: 'Program',
    body: [],
  };
  const len: number = tokens.length;
  let i: number = 0;
  function walk() {
    while (i < len) {
      let token: token = tokens[i];
      if (token.type === 'number') {
        return {
          type: 'NumberLiteral',
          value: token.value,
        };
      } else if (token.type === 'string') {
        return {
          type: ' StringLiteral',
          value: token.value,
        };
      } else if (token.type === 'paren' && token.value === '(') {
        token = tokens[++i];
        let node = {
          type: 'CallExpression',
          name: token.value,
          params: [],
        };
        token = tokens[++i];
        while (
          token.type !== 'paren' ||
          (token.type === 'paren' && token.value !== ')')
        ) {
          node.params.push(walk());
          token = tokens[++i];
        }
        return node;
      }
      if (token.value === ')') {
        i++;
      }
    }
  }
  ast.body.push(walk());
  return ast;
}

function traverser(ast, visitor) {
  function transArray(array, parent) {
    array.forEach((node) => {
      transNode(node, parent);
    });
  }
  function transNode(node, parent) {
    const methods = visitor[node.type];
    if (methods && methods.enter) {
      methods.enter(node, parent);
    }
    switch (node.type) {
      case 'Program':
        transArray(node.body, node);
        break;
      case 'CallExpression':
        transArray(node.params, node);
        break;
      case 'NumberLiteral':
      case 'StringLiteral':
        break;
      default:
        break;
    }
    if (methods && methods.exit) {
      methods.exit(node, parent);
    }
  }
  transNode(ast, null);
}

function transform(ast: ast) {
  let newAst = {
    type: 'Program',
    body: [],
  };

  ast._context = newAst.body;

  traverser(ast, {
    NumberLiteral: {
      enter(node, parent) {
        parent._context.push({
          type: 'NumberLiteral',
          value: node.value,
        });
      },
      exit(node, parent) {},
    },
    StringLiteral: {
      enter(node, parent) {
        parent._context.push({
          type: 'StringLiteral',
          value: node.value,
        });
      },
      exit(node, parent) {},
    },
    CallExpression: {
      enter(node, parent) {
        let expression = {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: node.name },
          arguments: [],
        };
        node._context = expression.arguments;

        if (parent.type !== 'CallExpression') {
          expression = {
            type: 'ExpressionStatement',
            expression,
          };
        }
        parent._context.push(expression);
      },
      exit(node, parent) {},
    },
  });
}

function compiler(input) {
  const tokens: token[] = tokenizer(input);
  const ast: ast = parse(tokens);
  const newAst: ast = transform(ast);
  const output = codeGen(newAst);
  return output;
}
