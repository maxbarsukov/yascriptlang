export default function makeCompilerEnv() {
  return `
global.print = function(...txt) {
  txt.forEach(i => process.stdout.write(i.toString()));
};

global.println = function(...txt) {
  txt.forEach(i => console.log(i));
};

global.clear = console.clear;

global.time = (callback, func) => {
  console.log(callback, func);
  console.time('time');
  func((ret) => {
    console.timeEnd('time');
    callback(ret);
  });
};

global.sleep = (callback, delay) => {
  setTimeout(() => {
    callback();
  }, delay);
};

global.callcc = (callback, fn, ...args) => {
  fn(callback, (discard, ret) => {
    callback(ret);
  }, ...args);
};

global.halt = (k) => {};

global.pstack = [];

global._goto = function(f) {
  f((r) => {
    const h = pstack.pop();
    h(r);
  });
};

global.reset = function(KRESET, th) {
  pstack.push(KRESET);
  _goto(th);
};

global.shift = function(KSHIFT, f) {
  _goto((KGOTO) => {
    f(KGOTO, (k1, v) => {
      pstack.push(k1);
      KSHIFT(v);
    });
  });
  };`;
}
