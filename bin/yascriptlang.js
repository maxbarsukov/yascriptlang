#!/usr/bin/env node

import Yascriptlang from '../src/index.js'

const {
  Parser,
  InputStream,
  TokenStream,
  Environment,
  evaluate,
  Executor,
} = Yascriptlang;

const args = process.argv.splice(process.execArgv.length + 2);

const stdLib = `
cons = lambda(a, b) lambda(f) f(a, b);
car = lambda(cell) cell(lambda(a, b) a);
cdr = lambda(cell) cell(lambda(a, b) b);
NIL = lambda(f) f(NIL, NIL);

pstack = NIL;

goto = false;

reset = lambda(th) {
  call-cc(lambda(k){
    pstack = cons(k, pstack);
    goto(th);
  });
};

shift = lambda(f) {
  call-cc(lambda(k){
    goto(lambda(){
      f(lambda(v){
        call-cc(lambda(k1){
          pstack = cons(k1, pstack);
          k(v);
        });
      });
    });
  });
};

let (v = call-cc( lambda(k){ goto = k; k(false) } )) {
  if v then let (r = v(), h = car(pstack)) {
    pstack = cdr(pstack);
    h(r);
  }
};

with-yield = lambda(func) {
  let (yield) {
    yield = lambda(val) {
      shift(lambda(SK){
        func = SK;
        val;
      });
    };
    lambda(val) {
      reset( lambda() func(val || yield) );
    };
  }
};

`

const code = stdLib + `
foo = with-yield(lambda(yield){
  yield(1);
  yield(2);
  yield(3);
  "DONE";
});

println(foo());  # prints 1
println(foo());  # prints 2
println(foo());  # prints 3
println(foo());  # prints DONE
`

const inputStream = new InputStream(code);
const tokenStream = new TokenStream(inputStream);
const parser = new Parser(tokenStream);

const ast = parser.parse();
const globalEnv = new Environment();

globalEnv.def("print", function(callback, txt){
  process.stdout.write(txt.toString());
  callback(false);
});

globalEnv.def("println", function(callback, txt){
  console.log(txt);
  callback(false);
});

globalEnv.def("time", function(callback, func){
  console.time("time");
  func(function(ret){
    console.timeEnd("time");
    callback(ret);
  });
});

globalEnv.def("call-cc", function CallCC(callback, func){
  Executor.guard(CallCC, arguments);
  func(callback, function curCont(discarded, ret){
    Executor.guard(curCont, arguments);
    callback(ret);
  });
});

Executor.execute(evaluate, [ ast, globalEnv, result => {
  console.log("Result: ", result);
}]);
