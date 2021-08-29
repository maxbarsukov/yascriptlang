let STACK_LENGTH;

const Executor = {
  guard: function guard(func, args) {
    if (--STACK_LENGTH < 0) {
      throw new Continuation(func, args);
    }
  },
  execute: function execute(f, args) {
    while (true) {
      try {
        STACK_LENGTH = 200;
        return f(...args);
      } catch (exception) {
        if (exception instanceof Continuation) {
          f = exception.f;
          args = exception.args;
        } else throw exception;
      }
    }
  },
};

class Continuation {
  constructor(f, args) {
    this.f = f;
    this.args = args;
  }
}

export default Executor;
