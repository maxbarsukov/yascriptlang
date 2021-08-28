class Environment {
  constructor(parent) {
    this.parent = parent;
    this.vars = Object.create(parent ? parent.vars : null);
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
    return scope;
  }

  get(name) {
    if (name in this.vars) {
      return this.vars[name];
    }
    throw new Error(`Undefined variable ${name}`);
  }

  set(name, value) {
    const scope = this.lookup(name);
    if (!scope && this.parent) {
      throw new Error(`Undefined variable ${name}`);
    }
    return (scope || this).vars[name] = value;
  }

  def(name, value) {
    return this.vars[name] = value;
  }
}

export default Environment;
