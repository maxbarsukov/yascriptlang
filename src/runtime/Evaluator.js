import NodeTypes from '../parser/NodeTypes.js';
import Executor from './Executor.js';

export default function evaluate(exp, env, callback) {
  Executor.guard(evaluate, arguments);
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
      evaluate(exp.right, env, function currentContinuation(right) {
        Executor.guard(currentContinuation, arguments);
        callback(env.set(exp.left.value, right));
      });
      return;
    }
    case NodeTypes.BINARY: {
      evaluate(exp.left, env, function leftCont(left) {
        Executor.guard(leftCont, arguments);
        evaluate(exp.right, env, function rightCont(right) {
          Executor.guard(rightCont, arguments);
          callback(applyOp(exp.operator, left, right));
        });
      });
      return;
    }
    case NodeTypes.LAMBDA: {
      callback(makeLambda(env, exp));
      return;
    }
    case NodeTypes.LET: {
      const loop = (curEnv, i) => {
        Executor.guard(loop, arguments);
        if (i < exp.vars.length) {
          const v = exp.vars[i];
          if (v.def) {
            evaluate(v.def, curEnv, function currentContinuation(value) {
              Executor.guard(currentContinuation, arguments);
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
          evaluate(exp.body, curEnv, callback);
        }
      };
      loop(env, 0);
      return;
    }
    case NodeTypes.IF: {
      evaluate(exp.cond, env, function currentContinuation(cond) {
        Executor.guard(currentContinuation, arguments);
        if (cond !== false) {
          evaluate(exp.then, env, callback);
        } else if (exp.else) {
          evaluate(exp.else, env, callback);
        } else {
          callback(false);
        }
      });
      return;
    }
    case NodeTypes.PROG: {
      const loop = (last, i) => {
        Executor.guard(loop, arguments);
        if (i < exp.prog.length) {
          evaluate(exp.prog[i], env, function currentContinuation(val) {
            Executor.guard(currentContinuation, arguments);
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
      evaluate(exp.func, env, function funcCont(func) {
        Executor.guard(funcCont, arguments);
        function loop(args, i) {
          Executor.guard(loop, arguments);
          if (i < exp.args.length) {
            evaluate(exp.args[i], env, function argCont(arg) {
              Executor.guard(argCont, arguments);
              args[i + 1] = arg;
              loop(args, i + 1);
            });
          } else {
            func(...args);
          }
        }
        loop([callback], 0);
      });
      return;
    }
    default:
      throw new Error(`I don't know how to evaluate ${exp.type}`);
  }
}

function applyOp(op, a, b) {
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

function makeLambda(env, exp) {
  function lambda(callback) {
    Executor.guard(lambda, arguments);
    const names = exp.vars;
    const scope = env.extend();
    for (let i = 0; i < names.length; ++i) {
      scope.def(names[i],
        i + 1 < arguments.length
          ? arguments[i + 1]
          : false);
    }
    evaluate(exp.body, scope, callback);
  }
  if (exp.name) {
    env = env.extend();
    env.def(exp.name, lambda);
  }
  return lambda;
}
