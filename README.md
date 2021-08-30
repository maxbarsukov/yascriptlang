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
```
