#!/usr/bin/env node

import run from '../src/index.js'

const args = process.argv.splice(process.execArgv.length + 2);

const code = `
# comment
// comment
/*
comment
comment
comment
*/

println("Hello World!");
println('Hello World!');
println('Hello " World!');
println("Hello ' World!");

println(2 + 3 * 4);
println(3 ** 3);

def fib = fn (n) -> if n < 2 then n else fib(n - 1) + fib(n - 2);

println(fib(15));

def print-range = fn(a, b) ->
                if a <= b then {
                  print(a);
                  if a + 1 <= b {
                    print(", ");
                    print-range(a + 1, b);
                  } else println("");
                };
print-range(1, 5);

`

run(code, result => {
  console.log('Result: ', result);
});
