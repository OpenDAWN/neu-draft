import TimelineEventEmitter from "../events/timeline-event-emitter";
import Readable from "./readable";

export default class Writable extends TimelineEventEmitter {
  constructor(context) {
    super(context);

    this.readable = false;
    this.writable = true;
    this.reader = new Readable(context);

    this._ended = false;
  }

  write(object) {
    if (!this._ended) {
      this.reader.emit("data", object);
    }
  }

  end(object) {
    if (!this._ended) {
      if (object) {
        this.write(object);
      }
      this.reader.emit("end");
      this._ended = true;
    }
  }
}
