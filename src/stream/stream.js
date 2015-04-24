import Writable from "./writable";

export default class Stream {
  constructor(context) {
    this.readable = true;
    this.writable = true;

    this._writer = new Writable(context);
    this._reader = this._writer.reader;
  }

  write(object) {
    return this._writer.write(object);
  }

  end(object) {
    return this._writer.end(object);
  }

  emit(type, object) {
    return this._reader.emit(type, object);
  }

  on(type, callback) {
    this._reader.on(type, callback);
    return this;
  }

  once(type, callback) {
    this._reader.once(type, callback);
    return this;
  }

  removeListener(type, callback) {
    this._reader.removeListener(type, callback);
    return this;
  }

  pipe(dst) {
    return this._reader.pipe(dst);
  }
}
