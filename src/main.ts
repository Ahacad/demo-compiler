const LETTER: RegExp = /\w/i;
const NUMBER: RegExp = /\d/i;
const WHITESPACE: RegExp = /\s/i;

interface token {
  type: "paren" | "name" | "number" | "string";
  value: string;
}

function tokenizer(input: string): token[] {
  let tokens: token[] = [];
  const length: number = input.length;
  let i: number = 0;
  while (i < length) {
    let letter: string = input[i];
    if (letter === "(") {
      tokens.push({ type: "paren", value: "(" });
      i++;
    } else if (WHITESPACE.test(letter)) {
      i++;
    } else if (NUMBER.test(letter)) {
      let value: string = "";
      while (NUMBER.test(letter)) {
        value += letter;
        letter = input[++i];
      }
      tokens.push({
        type: "number",
        value,
      });
    } else if (letter === '"') {
      let value: string = "";
      letter = input[++i];
      while (letter !== '"') {
        value += letter;
      }
      tokens.push({ type: "string", value });
    } else if (LETTER.test(letter)) {
      let value: string = "";
      while (LETTER.test(letter)) {
        value += letter;
        letter = input[++i];
      }
      tokens.push({ type: "name", value });
    } else {
      throw new TypeError("not recognized letter type yet");
    }
  }
  return [];
}
