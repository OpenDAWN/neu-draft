"use strict";

import Timeline from "./timeline";

export default class Context {
  constructor(destination, opts = {}) {
    if (destination instanceof global.AudioContext) {
      destination = destination.destination;
    }
    this.destination = destination;
    this.audioContext = destination.context;
    this.timeline = new Timeline(this.audioContext, opts);
  }

  get currentTime() {
    return this.timeline.currentTime;
  }

  get playbackTime() {
    return this.timeline.playbackTime;
  }

  start() {
    this.timeline.start();

    return this;
  }

  stop() {
    this.timeline.stop();

    return this;
  }

  sched(time, callback) {
    return this.timeline.insert(time, callback);
  }

  nextTick(callback) {
    return this.timeline.nextTick(callback);
  }

  unsched(schedId) {
    return this.timeline.remove(schedId);
  }
}
