import * as util from "../util";
import EventEmitter from "./event-emitter";

export default class TimelineEventEmitter extends EventEmitter {
  constructor(context) {
    super();
    this.context = context;
  }

  emit(type, object) {
    let event = util.extend({
      playbackTime: this.context.playbackTime,
      data        : null,
    }, object);
    this.context.sched(event.playbackTime, () => {
      super.emit(type, event);
    });
  }
}
