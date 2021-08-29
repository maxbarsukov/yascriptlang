export default class Executor {
  constructor() {
    this.STACK_LEN = 200
  }

  static guard(func, args) {
    if (--this.STACK_LEN < 0) {
      throw new Continuation(func, args);
    }
  }

  static execute(f, args) {
    while (true) try {
      console.log(f)
      this.STACK_LEN = 200;
      return f(...args);
    } catch(exception) {
      if (exception instanceof Continuation) {
        f = exception.f;
        args = exception.args;
      }
      else throw exception;
    }
  }
}

class Continuation {
  constructor(f, args) {
    this.f = f;
    this.args = args;
  }
}
