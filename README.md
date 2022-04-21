# Yascriptlang

[![Build Status](https://app.travis-ci.com/maxbarsukov/yascriptlang.svg?branch=master)](https://app.travis-ci.com/maxbarsukov/yascriptlang)
[![npm version](https://badge.fury.io/js/yascriptlang.svg)](https://www.npmjs.com/package/yascriptlang)
[![Downloads](https://img.shields.io/npm/dm/yascriptlang.svg)](https://www.npmjs.com/package/yascriptlang)
[![Package Size](https://img.shields.io/bundlephobia/min/yascriptlang)](https://www.npmjs.com/package/yascriptlang)

![Yascriptlang Logo](https://github.com/maxbarsukov/yascriptlang/blob/master/docs/logo.png?raw=true)

**Y**et **A**nother **Script** **Lang**uage

> Because everyone should have their own Lisp

***Yascriptlang*** is high-level and multi-paradigm language.
It has curly-bracket syntax, strong dynamic typing, recursion, and first-class functions.

As a multi-paradigm language, ***yascriptlang*** supports functional and imperative programming styles both.

***Yascriptlang*** can be interpreted as well as **compiled in JavaScript**.

## Installing

```bash
npm install -g yascriptlang
```

## Documentation

The documentation is located in the [docs](https://github.com/maxbarsukov/yascriptlang/tree/master/docs) folder.

## Usage

Run interpreter:
```bash
yas input.yas
```

Compile to **JS**:
```bash
yasc input.yas output.js
```

Compile to **JS** and run:
```bash
yasjs input.yas
```

## Building

### Pre-reqs

To build and run this app locally you will need a few things:

- Install [Node.js](https://nodejs.org/en/);

### Getting start

- Clone the repository
```bash
git clone --depth=1 https://github.com/maxbarsukov/yascriptlang.git
```
- Install dependencies
```bash
cd yascriptlang
yarn
```
- Run
```bash
node bin/yas.js input.yas
# or
node bin/yasc.js input.yas output.js
# or
node bin/yasjs.js input.yas
````

## Examples of code

Here are some code examples. Go to there [docs](https://github.com/maxbarsukov/yascriptlang/tree/master/docs) to see more.

Comments:
```ruby
### Comments
# comment
```
```js
// comment
/*
multi
line
comment
*/
```

Strings:

```ruby
println("Hello World!");
println('Hello World!');
println('Hello " World!');
println("Hello ' World!");
println('My name is ' ++ 'Max'); # => My name is Max
```

Math:

```ruby
println(2 + 2 * 2); # => 6
println(3 ** 3); # => 27
println(10 / 5); # => 2
println(17 % 3); # => 2
```

Variables:
(variables are *immutable* by default)

```ruby
def pi = 3.14;
println(pi);

def a = {
  10;
  15   # the last semicolon can be missing
};
print(a); # prints 15

def mut b = 1;
b += 2;
b **= 3;
println(b); # => 27
```

Raw JS:

```ruby
println(_js_ '[0, 1, 2, 3].length * 2') # => 8
println(_js_ 'console.log("HI!"); 2+4') # => prints HI! and 6
println(_js_ '((a) => { console.log(`HI, ${a}!`)})("Max")') # => prints HI, Max!
```

Mutable Variables:

```ruby
def mut a = 3
a = 2;
println(a); # => 2
```

Functions:

```ruby
def fib = fn (n) -> if n < 2 then n else fib(n - 1) + fib(n - 2);
println(fib(15));

def print_range = fn(a, b) ->
                if a <= b then {
                  print(a);
                  if a + 1 <= b {
                    print(", ");
                    print_range(a + 1, b);
                  } else println("");
                };
print_range(1, 5); # => 1, 2, 3, 4, 5

def func = fn-> {
  10;
  20;
};

println(func()); # => 20. Functions returns the last var
```

Lambdas:

```ruby
# fn-> {} is short for fn() -> {}

(fn->
  println(3 ** 3);
)();
```

Pipes:

```ruby
def k = 200;
k |> println; # prints 200

2 |> fn(x) -> (x * x) |> println; # prints 4
```

Benchmarks:

```ruby
time(fn-> {
  println(fib(15));
});
```

Let:

```ruby
def a = 1;
let (mut a = 10) -> {
    println(a); # => 10
  };
println(a); # => 1


print(let loop(n = 10) ->
  if n > 0 then n + loop(n - 1)
  else 0);
# => 55

let (x = 2, y = x + 1, z = x + y) ->
  println(x + y + z); # => 10


let (x = 10) -> {
  let (x = x * 2, y = x * x) -> {
    println(x); # 20
    println(y); # 400
  };
  println(x); # 10
};

```

if / else:

```ruby
def f = fn-> { true; };
def a = if f() then "OK" else "FAIL"; # OK
if 1 == 1 && 2 < 5 then print("OK"); # OK
```

true / false :

```ruby
if true then print("OK"); # OK
if !false then print("OK"); # OK
if false then print("Won't be printed");
```

Lists:

```ruby
def list = cons(1, cons(2, cons(3, cons(4, cons(5, NIL)))));
print(car(list)); # 1
print(car(cdr(list))); # 2
print(car(cdr(cdr(list)))); # 3
print(car(cdr(cdr(cdr(list))))); # 4
print(car(cdr(cdr(cdr(cdr(list)))))); # 5
```

Yield:

```ruby
foo = with-yield(fn(yield) -> {
  yield(1);
  yield(2);
  yield(3);
  "DONE";
});

println(foo()); # 1
println(foo()); # 2
println(foo()); # 3
println(foo()); # DONE
```

Some stdlib methods:

```ruby
# foreach
foreach(x, println); # prints from 1 to 5 by println

# range
foreach(range(1, 8), fn(x) -> println(x * x));
# or
foreach(range(1, 8), fn(x) -> (x * x) |> println);
# prints 1, 4, 9, 16, ... 49, 64

# throw / catch
exit = false;
x = 0;
callcc( fn(k) -> exit = k );
if x == 0 then catch("foo", fn-> {
println("in catch");
x = 1;
exit();
});
println("After catch");
throw("foo", "FOO");
```

## License

The package is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
