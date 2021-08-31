class Environment {
  constructor(parent) {
    this.parent = parent;
    this.vars = Object.create(parent ? parent.vars : {});
  }

  extend() {
    return new Environment(this);
  }

  lookup(name) {
    let scope = this;
    while (scope) {
      if (Object.prototype.hasOwnProperty.call(scope.vars, name)) {
        return scope;
      }
      scope = scope.parent;
    }
    return false;
  }

  get(name, { line, col } = { line: null, col: null }) {
    if (name in this.vars) {
      return this.vars[name].value;
    }
    throw new Error(`Undefined variable "${name}" at ${line}:${col}`);
  }

  set(name, value, { line, col } = { line: null, col: null }) {
    const scope = this.lookup(name);
    if (Object.prototype.hasOwnProperty.call(!(scope || this).vars, name)) {
      throw new Error(`Undefined variable "${name}" at ${line}:${col}`);
    }
    const opt = (scope || this).vars[name];
    if (opt.immutable) {
      throw new Error(`Cannot write to read-only variable ${name} at ${line}:${col}`);
    }
    opt.value = value;
    return value;
  }

  def(name, value, { immutable = true, force = true } = { immutable: true, force: true },
    { line, col } = { line: null, col: null }) {
    if (Object.prototype.hasOwnProperty.call(this.vars, name) && !force) {
      throw new Error(`Variable ${name} is already defined at ${line}:${col}`);
    }
    if (this.parent && !force) {
      throw new Error(`Cannot define value when not in global scope at ${line}:${col}`);
    }
    return this.vars[name] = {
      value,
      immutable,
    };
  }
}

export default Environment;
