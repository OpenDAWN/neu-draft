import TimelineEventEmitter from "../events/timeline-event-emitter";
import Readable from "./readable";

const FLOWING = 0x01;
const PAUSED  = 0x02;
const ENDING  = 0x04;
const ENDED   = 0x08;

export default class Writable extends TimelineEventEmitter {
  constructor(context) {
    super(context);

    this.readable = false;
    this.writable = true;
    this.reader = new Readable(context);

    this.reader.on("pause", () => {
      this._pause();
    });
    this.reader.on("resume", () => {
      this._resume();
    });

    this._state = FLOWING;
  }

  write(object) {
    if (this._state === FLOWING) {
      this.reader.emit("data", object);
    }
    return this._state === FLOWING;
  }

  end(object) {
    if (this._state === FLOWING) {
      if (object) {
        this.write(object);
      }
      this.reader.emit("end");
      this._state = ENDED;
    } else {
      this._state = ENDING;
    }

    return false;
  }

  _pause() {
    if (this._state === FLOWING) {
      this._state = PAUSED;
    }
  }

  _resume() {
    if (this._state & (PAUSED|ENDING)) {
      this._state = FLOWING;
      this.reader.emit("drain");
      if (this._state === ENDING) {
        this.reader.emit("end");
        this._state = ENDED;
      }
    }
  }
}
