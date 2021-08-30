# yascriptlang

**Y**et **A**nother **Script** **Lang**uage

## Examples of code

```ruby
### Comments
# comment
// comment
/*
comment
comment
comment
*/

### Strings
println("Hello World!");
println('Hello World!');
println('Hello " World!');
println("Hello ' World!");

### Math
println(2 + 2 * 2);
println(3 ** 3);

### Variables
def pi = 3.14;
println(pi);

### Mutable Variables
def mut a = 3
a = 2;
println(a);

### Functions
def fib = fn (n) -> if n < 2 then n else fib(n - 1) + fib(n - 2);
println(fib(15));

### Pipes
def k = 200;
k |> println; # prints 200

### Benchmarks
time(fn-> {
  println(fib(15));
});

### Lambdas
# fn -> {} is short for fn() -> {}
(fn->{
  println(3 ** 3);
})();

### Let
def a = 1;
let (mut a = 10) -> {
    println(a); # => 10
  };
println(a); # => 1

### if / else
edf f = fn-> { true; };
def a = if f() then "OK" else "FAIL";

### true / false 
if true then print("OK");
if false then print("Won't be printed");

### Lists
def list = cons(1, cons(2, cons(3, cons(4, cons(5, NIL)))));
print(car(list)); # 1
print(car(cdr(list))); # 2
print(car(cdr(cdr(list)))); # 3
print(car(cdr(cdr(cdr(list))))); # 4
print(car(cdr(cdr(cdr(cdr(list)))))); # 5

### Yield
foo = with-yield(lambda(yield){
  yield(1);
  yield(2);
  yield(3);
  "DONE";
});

println(foo()); # 1
println(foo()); # 2
println(foo()); # 3
println(foo()); # DONE

### Some stdlib methods
## foreach
foreach(x, println); # prints from 1 to 5 by println

## range
foreach(range(1, 8), fn(x) -> println(x * x));
# prints 1, 4, 9, 16, ... 49, 64

## throw / catch
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
