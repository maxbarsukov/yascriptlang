import NodeTypes from '../parser/NodeTypes.js';

export default class CompilerJS {
  constructor(exp) {
    this.exp = exp;
  }

  compile() {
    return this.js(this.exp);
  }

  js(exp) {
    switch (exp.type) {
      case NodeTypes.NUM:
      case NodeTypes.STR:
      case NodeTypes.BOOL: {
        return this.jsAtom(exp);
      }
      case NodeTypes.VAR: {
        return this.jsVar(exp);
      }
      case NodeTypes.NOT: {
        return this.jsNot(exp);
      }
      case NodeTypes.BINARY: {
        return this.jsBinary(exp);
      }
      case NodeTypes.DEFINE: {
        return this.jsDefine(exp);
      }
      case NodeTypes.ASSIGN: {
        return this.jsAssign(exp);
      }
      case NodeTypes.LET: {
        return this.jsLet(exp);
      }
      case NodeTypes.FN: {
        return this.jsFn(exp);
      }
      case NodeTypes.IF: {
        return this.jsIf(exp);
      }
      case NodeTypes.PROG: {
        return this.jsProg(exp);
      }
      case NodeTypes.CALL: {
        return this.jsCall(exp);
      }
      case NodeTypes._JS_: {
        return this.jsRaw(exp);
      }
      default:
        throw new Error(`Cannot compile to JS ${JSON.stringify(exp)} at ${exp.line}:${exp.col}`);
    }
  }

  jsAtom(exp) {
    return JSON.stringify(exp.value);
  }

  makeVar(name) {
    return name;
  }

  jsVar(exp) {
    return this.makeVar(exp.value);
  }

  jsBinary(exp) {
    return `(${this.js(exp.left)}${exp.operator}${this.js(exp.right)})`;
  }

  jsAssign(exp) {
    return this.jsBinary(exp);
  }

  jsDefine(exp) {
    const defWord = exp.variant === 'immutable' ? 'const' : 'let';
    return `${defWord} ${this.js(exp.left)}=${this.js(exp.right)}`;
  }

  jsNot(exp) {
    return `(!${this.js(exp.value)})`;
  }

  jsFn(exp) {
    let code = '(function ';
    if (exp.name) code += this.makeVar(exp.name);
    code += `(${exp.vars.map((v) => v.value).map(this.makeVar.bind(this)).join(', ')}) {`;
    code += `return ${this.js(exp.body)} })`;
    return code;
  }

  jsLet(exp) {
    if (exp.vars.length === 0) return this.js(exp.body);
    const iife = {
      type: NodeTypes.CALL,
      func: {
        type: NodeTypes.FN,
        vars: [exp.vars[0].name],
        body: {
          type: NodeTypes.LET,
          vars: exp.vars.slice(1),
          body: exp.body,
        },
      },
      args: [exp.vars[0].def || { type: NodeTypes.BOOL, value: false }],
    };
    return `(${this.js(iife)})`;
  }

  jsIf(exp) {
    return `(${
      this.js(exp.cond)} !== false`
      + ` ? ${this.js(exp.then)
      } : ${this.js(exp.else || { type: NodeTypes.BOOL, value: false })
      })`;
  }

  jsProg(exp) {
    return `(function(){${exp.prog.slice(0, exp.prog.length - 1).map(this.js.bind(this)).join('; ')}; return ${this.js(exp.prog.slice(-1)[0])};})()`;
  }

  jsCall(exp) {
    return `${this.js(exp.func)}(${exp.args.map(this.js.bind(this)).join(', ')})`;
  }

  jsRaw(exp) {
    return `(${exp.code})`;
  }
}
