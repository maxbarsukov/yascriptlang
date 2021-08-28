import NodeTypes from '../parser/NodeTypes.js';

class Evaluator {
  static evaluate(exp, env) {
    switch (exp.type) {
      case NodeTypes.NUM:
      case NodeTypes.STR:
      case NodeTypes.BOOL: {
        return exp.value;
      }
      case NodeTypes.VAR: {
        return env.get(exp.value);
      }
      case NodeTypes.ASSIGN: {
        if (exp.left.type !== NodeTypes.VAR) {
          throw new Error(`Cannot assign to ${JSON.stringify(exp.left)}`);
        }
        return env.set(exp.left.value, this.evaluate(exp.right, env));
      }
      case NodeTypes.BINARY: {
        return this.applyOp(exp.operator,
          this.evaluate(exp.left, env),
          this.evaluate(exp.right, env));
      }
      case NodeTypes.LAMBDA: {
        return this.makeLambda(env, exp);
      }
      case NodeTypes.IF: {
        const cond = this.evaluate(exp.cond, env);
        if (cond !== false) return this.evaluate(exp.then, env);
        return exp.else ? this.evaluate(exp.else, env) : false;
      }
      case NodeTypes.PROG: {
        let val = false;
        exp.prog.forEach((anotherExp) => {
          val = this.evaluate(anotherExp, env);
        });
        return val;
      }
      case NodeTypes.CALL: {
        const func = this.evaluate(exp.func, env);
        return func(...exp.args.map((arg) => this.evaluate(arg, env)));
      }
      default:
        throw new Error(`I don't know how to evaluate ${exp.type}`);
    }
  }

  static applyOp(op, a, b) {
    function num(x) {
      if (typeof x !== 'number') {
        throw new Error(`Expected number but got ${x}`);
      }
      return x;
    }
    function div(x) {
      if (num(x) === 0) {
        throw new Error('Divide by zero');
      }
      return x;
    }
    switch (op) {
      case '+': return num(a) + num(b);
      case '-': return num(a) - num(b);
      case '*': return num(a) * num(b);
      case '/': return num(a) / div(b);
      case '%': return num(a) % div(b);
      case '&&': return a !== false && b;
      case '||': return a !== false ? a : b;
      case '<': return num(a) < num(b);
      case '>': return num(a) > num(b);
      case '<=': return num(a) <= num(b);
      case '>=': return num(a) >= num(b);
      case '==': return a === b;
      case '!=': return a !== b;
      default: throw new Error(`Can't apply operator ${op}`);
    }
  }

  static makeLambda(env, exp) {
    return function() {
      const names = exp.vars;
      const scope = env.extend();
      for (let i = 0; i < names.length; ++i) {
        scope.def(names[i], i < arguments.length ? arguments[i] : false);
      }
      return Evaluator.evaluate(exp.body, scope);
    }
  }
}

export default Evaluator;
