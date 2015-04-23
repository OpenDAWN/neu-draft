"use strict";

import * as util from "../util";

export default class Timeline {
  constructor(audioContext, opts = {}) {
    this.audioContext = audioContext;
    this.interval = +util.defaults(opts.interval, 0.025);
    this.aheadTime = +util.defaults(opts.aheadTime, 0.1);
    this.offsetTime = +util.defaults(opts.offsetTime, 0.005);
    this.timerAPI = util.defaults(opts.timerAPI, global);
    this.playbackTime = 0;

    this._timerId = 0;
    this._schedId = 0;
    this._events = [];
  }

  get currentTime() {
    return this.audioContext.currentTime;
  }

  get events() {
    return this._events.slice();
  }

  start(callback) {
    if (this._timerId === 0) {
      this._timerId = this.timerAPI.setInterval(() => {
        let t0 = this.audioContext.currentTime;
        let t1 = t0 + this.aheadTime;

        this._process(t0, t1);
      }, this.interval * 1000);
    }
    if (callback) {
      this.insert(0, callback);
    }
    return this;
  }

  stop(reset) {
    if (this._timerId !== 0) {
      this.timerAPI.clearInterval(this._timerId);
      this._timerId = 0;
    }
    if (reset) {
      this._events.splice(0);
    }
    return this;
  }

  insert(time, callback) {
    this._schedId += 1;

    let id = this._schedId;
    let event = { id, time, callback };
    let events = this._events;

    if (events.length === 0 || events[events.length - 1].time <= time) {
      events.push(event);
    } else {
      for (let i = 0, imax = events.length; i < imax; i++) {
        if (time < events[i].time) {
          events.splice(i, 0, event);
          break;
        }
      }
    }

    return event.id;
  }

  nextTick(callback) {
    return this.insert(this.playbackTime + this.aheadTime, callback);
  }

  remove(schedId) {
    let events = this._events;

    if (typeof schedId === "undefined") {
      events.splice(0);
    } else {
      for (let i = 0, imax = events.length; i < imax; i++) {
        if (schedId === events[i].id) {
          events.splice(i, 1);
          break;
        }
      }
    }

    return schedId;
  }

  _process(t0, t1) {
    let events = this._events;

    this.playbackTime = t0;

    while (events.length && events[0].time < t1) {
      let event = events.shift();

      this.playbackTime = Math.max(this.audioContext.currentTime, event.time) + this.offsetTime;

      event.callback(this.playbackTime);
    }

    this.playbackTime = t0;
  }
}
