import EventEmitter from "./event-emitter";

export default class TimelineEventEmitter extends EventEmitter {
  constructor(context) {
    super();
    this.context = context;
  }

  emit(type, data) {
    this.context.sched(data.playbackTime, () => {
      super.emit(type, data);
    });
  }
}
