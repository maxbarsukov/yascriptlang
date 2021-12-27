import Environment from '../../runtime/Environment.js';
import Executor from '../../runtime/Executor.js';

export default function makeEnv() {
  const globalEnv = new Environment();

  globalEnv.def('print', (callback, txt) => {
    process.stdout.write(txt.toString());
    callback(false);
  });

  globalEnv.def('println', (callback, txt) => {
    console.log(txt);
    callback(false);
  });

  globalEnv.def('clear', (callback) => {
    console.clear();
    callback(false);
  });

  globalEnv.def('time', (callback, func) => {
    console.time('time');
    func((ret) => {
      console.timeEnd('time');
      callback(ret);
    });
  });

  globalEnv.def('sleep', (callback, delay) => {
    setTimeout(() => {
      Executor.execute(callback, [false]);
    }, delay);
  });

  globalEnv.def('callcc', (callback, fn, ...args) => {
    fn(callback, (discard, ret) => {
      callback(ret);
    }, ...args);
  });

  globalEnv.def('halt', (k) => {});

  const pstack = [];

  function _goto(f) {
    f((r) => {
      const h = pstack.pop();
      h(r);
    });
  }
  globalEnv.def('_goto', _goto);

  function reset(KRESET, th) {
    pstack.push(KRESET);
    _goto(th);
  }
  globalEnv.def('reset', reset);

  function shift(KSHIFT, f) {
    _goto((KGOTO) => {
      f(KGOTO, (k1, v) => {
        pstack.push(k1);
        KSHIFT(v);
      });
    });
  }
  globalEnv.def('shift', shift);

  return globalEnv;
}
