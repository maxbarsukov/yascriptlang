import Environment from '../runtime/Environment.js';
import Executor from '../runtime/Executor.js';

export default function makeEnv() {
  const globalEnv = new Environment();

  globalEnv.def('print', function(callback, txt) {
    process.stdout.write(txt.toString());
    callback(false);
  });

  globalEnv.def('println', function(callback, txt) {
    console.log(txt);
    callback(false);
  });

  globalEnv.def('clear', function(callback) {
    console.clear();
    callback(false);
  });

  globalEnv.def('time', function(callback, func) {
    console.time('time');
    func(function(ret){
      console.timeEnd('time');
      callback(ret);
    });
  });

  globalEnv.def('sleep', function(callback, delay) {
    setTimeout(() => {
      Executor.execute(callback, [false]);
    }, delay);
  });

  globalEnv.def("callcc",function(callback,fn, ...args){
    fn(callback,function CC(discard,ret){
      callback(ret);
    }, ...args);
  });

  globalEnv.def('halt', function(k){});

  var pstack = [];

  function _goto(f) {
    f(function KGOTO(r) {
      var h = pstack.pop();
      h(r);
    });
  }

  function reset(KRESET, th) {
    pstack.push(KRESET);
    _goto(th);
  }
  globalEnv.def("reset", reset);

  function shift(KSHIFT, f) {
    _goto(function(KGOTO) {
      f(KGOTO, function SK(k1, v) {
        pstack.push(k1);
        KSHIFT(v);
      });
    });
  }

  return globalEnv;
}
