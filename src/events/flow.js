import Emitter from "./emitter";
import * as util from "../util";

// unscheduled

export default class Flow extends Emitter {
  constructor(context) {
    super();

    this.context = context;
    this._flowing = false;
    this._running = false;
  }

  write(object) {
    if (this._flowing) {
      this.context.sched(object.playbackTime, () => {
        this.emit("data", object);
      });
    }
  }

  end(object) {
    let playbackTime;

    if (this._flowing) {
      if (object) {
        playbackTime = object.playbackTime;
      }
      playbackTime = util.defaults(playbackTime, this.context.playbackTime);

      this.context.sched(playbackTime, () => {
        if (object) {
          this.write(object);
        }
        this._flowing = false;
        this.emit("end");
      });
    }
  }

  start(playbackTime) {
    if (!this._running) {
      this._running = true;

      playbackTime = util.defaults(playbackTime, this.context.playbackTime);

      this.context.sched(playbackTime, () => {
        this._flowing = true;
        this.emit("start");
      });
    }

    return this;
  }

  stop(playbackTime) {
    if (this._running) {
      this._running = false;

      playbackTime = util.defaults(playbackTime, this.context.playbackTime);

      this.context.sched(playbackTime, () => {
        this._flowing = false;
        this.emit("stop");
      });
    }
  }

  merge(that) {
    let flow = new Flow(this.context);

    let onData = (object) => {
      flow.write(object);
    };

    this.on("data", onData);
    that.on("data", onData);

    return flow;
  }

  map(fn) {
    let flow = new Flow(this.context);

    this.on("data", (object) => {
      let nextObject = util.extend(object, {
        data: fn(object.data),
      });
      flow.write(nextObject);
    });
    this.on("end", () => {
      flow.end();
    });

    return flow;
  }

  filter(fn) {
    let flow = new Flow(this.context);

    this.on("data", (object) => {
      if (fn(object.data)) {
        flow.write(object);
      }
    });
    this.on("end", () => {
      flow.end();
    });

    return flow;
  }

  scan(initValue, fn) {
    let flow = new Flow(this.context);
    let prevValue = initValue;

    this.on("data", (object) => {
      let nextObject = util.extend(object, {
        data: fn(prevValue, object.data),
      });
      prevValue = nextObject.data;
      flow.write(nextObject);
    });
    this.on("end", () => {
      flow.end();
    });

    return flow;
  }

  delay(delayTime) {
    let flow = new Flow(this.context);

    this.on("data", (object) => {
      let nextObject = util.extend(object, {
        playbackTime: object.playbackTime + delayTime,
      });
      flow.write(nextObject);
    });
    this.on("end", () => {
      flow.end();
    });

    return flow;
  }
}
