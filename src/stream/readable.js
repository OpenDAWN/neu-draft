import * as util from "../util";
import TimelineEventEmitter from "../events/timeline-event-emitter";

export default class ReadableStream extends TimelineEventEmitter {
  constructor(context) {
    super(context);

    this.readable = true;
    this.writable = false;

    this._flowing = true;
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
      if (util.respondTo(dst, "write")) {
        dst.write(data);
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
