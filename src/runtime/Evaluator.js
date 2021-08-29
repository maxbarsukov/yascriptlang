import NodeTypes from '../parser/NodeTypes.js';

class Evaluator {
  static evaluate(exp, env, callback) {
    switch (exp.type) {
      case NodeTypes.NUM:
      case NodeTypes.STR:
      case NodeTypes.BOOL: {
        callback(exp.value);
        return;
      }
      case NodeTypes.VAR: {
        callback(env.get(exp.value));
        return;
      }
      case NodeTypes.ASSIGN: {
        if (exp.left.type !== NodeTypes.VAR) {
          throw new Error(`Cannot assign to ${JSON.stringify(exp.left)}`);
        }
        this.evaluate(exp.right, env, (right) => {
          callback(env.set(exp.left.value, right));
        });
        return;
      }
      case NodeTypes.BINARY: {
        this.evaluate(exp.left, env, (left) => {
          this.evaluate(exp.right, env, (right) => {
            callback(this.applyOp(exp.operator, left, right));
          });
        });
        return;
      }
      case NodeTypes.LAMBDA: {
        callback(this.makeLambda(env, exp));
        return;
      }
      case NodeTypes.LET: {
        const loop = (curEnv, i) => {
          if (i < exp.vars.length) {
            const v = exp.vars[i];
            if (v.def) {
              this.evaluate(v.def, curEnv, (value) => {
                const scope = curEnv.extend();
                scope.def(v.name, value);
                loop(scope, i + 1);
              });
            } else {
              const scope = curEnv.extend();
              scope.def(v.name, false);
              loop(scope, i + 1);
            }
          } else {
            this.evaluate(exp.body, curEnv, callback);
          }
        };
        loop(env, 0);
        return;
      }
      case NodeTypes.IF: {
        this.evaluate(exp.cond, env, (cond) => {
          if (cond !== false) {
            this.evaluate(exp.then, env, callback);
          } else if (exp.else) {
            this.evaluate(exp.else, env, callback);
          } else {
            callback(false);
          }
        });
        return;
      }
      case NodeTypes.PROG: {
        const loop = (last, i) => {
          if (i < exp.prog.length) {
            this.evaluate(exp.prog[i], env, (val) => {
              loop(val, i + 1);
            });
          } else {
            callback(last);
          }
        };
        loop(false, 0);
        return;
      }
      case NodeTypes.CALL: {
        this.evaluate(exp.func, env, (func) => {
          const loop = (args, i) => {
            if (i < exp.args.length) {
              this.evaluate(exp.args[i], env, (arg) => {
                args[i + 1] = arg;
                loop(args, i + 1);
              });
            } else {
              func(...args);
            }
          };
          loop([callback], 0);
        });
        return;
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
    function lambda(callback) {
      const names = exp.vars;
      const scope = env.extend();
      for (let i = 0; i < names.length; ++i) {
        scope.def(names[i],
          i + 1 < arguments.length
            ? arguments[i + 1]
            : false);
      }
      Evaluator.evaluate(exp.body, scope, callback);
    }
    if (exp.name) {
      env = env.extend();
      env.def(exp.name, lambda);
    }
    return lambda;
  }
}

export default Evaluator;
