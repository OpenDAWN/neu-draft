import TimelineEventEmitter from "../events/timeline-event-emitter";

export default class ReadableStream extends TimelineEventEmitter {
  constructor(context) {
    super(context);
    this.readable = true;
    this.writable = false;
    this._flowing = true;
  }

  pause() {
    if (this._flowing) {
      this._flowing = false;
      this.emit("pause");
    }

    return this;
  }

  resume() {
    if (this._flowing) {
      this._flowing = true;
      this.emit("resume");
    }

    return this;
  }

  isPaused() {
    return !this._flowing;
  }

  pipe(dst) {
    let src = this;
    let listeners = [];

    function cleanup() {
      listeners.splice(0).forEach((listener) => {
        listener.dispose();
      });
    }

    function onData(data) {
      if (dst.writable && dst.write(data) === false) {
        src.pause();
      }
    }

    function onDrain() {
      if (src.readable) {
        src.resume();
      }
    }

    function onError(error) {
      cleanup();
      dst.emit("error", error);
    }

    function listen(target, event, listener) {
      target.on(event, listener);
      return {
        dispose() {
          return target.removeListener(event, listener);
        },
      };
    }

    listeners.push(
      listen(src, "data", onData),
      listen(dst, "drain", onDrain),
      listen(src, "end", cleanup),
      listen(src, "close", cleanup),
      listen(dst, "close", cleanup),
      listen(src, "error", onError),
      listen(dst, "error", cleanup)
    );

    dst.emit("pipe", src);

    return dst;
  }
}
