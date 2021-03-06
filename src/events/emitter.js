export default class Emitter {
  constructor() {
    this._callbacks  = {};
  }

  hasListeners(type) {
    return this._callbacks.hasOwnProperty(type);
  }

  listeners(type) {
    return this.hasListeners(type) ? this._callbacks[type].slice() : [];
  }

  on(type, callback) {
    if (typeof callback === "function") {
      if (!this.hasListeners(type)) {
        this._callbacks[type] = [];
      }

      this._callbacks[type].push(callback);
    }

    return this;
  }

  once(type, callback) {
    if (typeof callback === "function") {
      let fn = (data) => {
        this.removeListener(type, fn);
        callback.call(this, data);
      };

      fn.callback = callback;

      this.on(type, fn);
    }

    return this;
  }

  addListener(type, callback) {
    return this.on(type, callback);
  }

  removeListener(type, callback) {
    if (typeof callback === "function" && this.hasListeners(type)) {
      this._callbacks[type] = this._callbacks[type].filter((fn) => {
        return !(fn === callback || fn.callback === callback);
      });
    }

    return this;
  }

  removeAllListeners(type) {
    if (typeof type === "undefined") {
      this._callbacks = {};
    } else if (this.hasListeners(type)) {
      delete this._callbacks[type];
    }

    return this;
  }

  emit(type, data = null) {
    this.listeners(type).forEach((fn) => {
      fn.call(this, data);
    });
  }
}
