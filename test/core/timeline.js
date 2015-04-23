"use strict";

import "web-audio-test-api";
import assert from "power-assert";
import tickable from "tickable-timer";
import Timeline from "../../src/core/timeline";

describe("Timeline", function() {
  let audioContext;

  beforeEach(function() {
    audioContext = new global.AudioContext();
  });

  describe("constructor", function() {
    it("(audioContext: AudioContext)", function() {
      let timeline = new Timeline(audioContext);

      assert(timeline.audioContext instanceof global.AudioContext);
      assert(typeof timeline.interval === "number");
      assert(typeof timeline.aheadTime === "number");
      assert(typeof timeline.offsetTime === "number");
      assert(timeline.timerAPI === global);
    });
    it("(audioContext: AudioContext, opts: object)", function() {
      let timeline = new Timeline(audioContext, {
        interval: 0.1,
        aheadTime: 0.25,
        offsetTime: 0,
        timerAPI: tickable,
      });

      assert(timeline.audioContext === audioContext);
      assert(timeline.interval === 0.1);
      assert(timeline.aheadTime === 0.25);
      assert(timeline.offsetTime === 0);
      assert(timeline.timerAPI === tickable);
    });
  });

  describe("#currentTime", function() {
    it("getter: number", function() {
      let timeline = new Timeline(audioContext);

      assert(typeof timeline.currentTime === "number");
    });
  });

  describe("#playbackTime", function() {
    it("getter: number", function() {
      let timeline = new Timeline(audioContext);

      assert(typeof timeline.playbackTime === "number");
    });
  });

  describe("#events", function() {
    it("getter: object[]", function() {
      let timeline = new Timeline(audioContext);

      assert(Array.isArray(timeline.events));
    });
  });

  describe("#start", function() {
    it("(): self", function() {
      let timeline = new Timeline(audioContext, {
        timerAPI: tickable
      });

      assert(timeline.start() === timeline);
    });
    it("(callback: function): self", function() {
      let timeline = new Timeline(audioContext, {
        timerAPI: tickable
      });

      let callback = () => {};

      assert(timeline.start(callback) === timeline);
      assert(timeline.events[0].callback === callback);
    });
  });

  describe("#stop", function() {
    it("(): self", function() {
      let timeline = new Timeline(audioContext, {
        timerAPI: tickable
      });

      timeline.insert(1, () => {});

      assert(timeline.stop() === timeline);
      assert(timeline.events.length === 1);
    });
    it("(reset: boolean)", function() {
      let timeline = new Timeline(audioContext, {
        timerAPI: tickable
      });

      timeline.insert(1, () => {});

      assert(timeline.stop(true) === timeline);
      assert(timeline.events.length === 0);
    });
  });

  describe("#insert", function() {
    it("(time: number, callback: function): number", function() {
      let timeline = new Timeline(audioContext);

      let e1 = { time: 1, callback: () => {} };
      let e2 = { time: 2, callback: () => {} };
      let e3 = { time: 3, callback: () => {} };
      let id1 = timeline.insert(e1.time, e1.callback);
      let id3 = timeline.insert(e3.time, e3.callback);
      let id2 = timeline.insert(e2.time, e2.callback);

      assert.deepEqual(timeline.events, [
        { id: id1, time: e1.time, callback: e1.callback },
        { id: id2, time: e2.time, callback: e2.callback },
        { id: id3, time: e3.time, callback: e3.callback },
      ]);
    });
  });

  describe("#nextTick", function() {
    it("(callback: function): number", function() {
      let timeline = new Timeline(audioContext);

      let e1 = { callback: () => {} };
      let e2 = { callback: () => {} };
      let e3 = { callback: () => {} };
      let id1 = timeline.nextTick(e1.callback);
      let id3 = timeline.nextTick(e3.callback);
      let id2 = timeline.nextTick(e2.callback);
      let nextTickTime = timeline.playbackTime + timeline.aheadTime;

      assert.deepEqual(timeline.events, [
        { id: id1, time: nextTickTime, callback: e1.callback },
        { id: id3, time: nextTickTime, callback: e3.callback },
        { id: id2, time: nextTickTime, callback: e2.callback },
      ]);
    });
  });

  describe("#remove", function() {
   it("(schedId: number): number", function() {
     let timeline = new Timeline(audioContext);

     let e1 = { time: 1, callback: () => {} };
     let e2 = { time: 2, callback: () => {} };
     let e3 = { time: 3, callback: () => {} };
     let id1 = timeline.insert(e1.time, e1.callback);
     let id3 = timeline.insert(e3.time, e3.callback);
     let id2 = timeline.insert(e2.time, e2.callback);
     let removedId = timeline.remove(id2);

     assert(id2 === removedId);
     assert.deepEqual(timeline.events, [
       { id: id1, time: e1.time, callback: e1.callback },
       { id: id3, time: e3.time, callback: e3.callback },
     ]);
   });
 });

 describe("works", function() {
    let timeline, passed;

    function callback(value) {
      return function(playbackTime) {
        passed.push([ value, playbackTime ]);
      };
    }

    before(function() {
      timeline = new Timeline(audioContext, {
        interval: 0.025,
        aheadTime: 0.1,
        offsetTime: 0.005,
        timerAPI: tickable
      });
    });

    beforeEach(function() {
      passed = [];
    });

    it("00:00.000 -> 00:00.100", function() {
      assert(timeline.events.length === 0);

      timeline.start();
      timeline.start();

      timeline.insert(0.000, callback(  0));
      timeline.insert(0.100, callback(100));
      timeline.insert(0.125, callback(125));
      timeline.insert(0.150, callback(150));
      timeline.insert(0.175, callback(175));

      tickable.tick(25);
      timeline.audioContext.$process(0.025);

      assert.deepEqual(passed, [
        [   0, 0.000 + 0.005 ],
      ]);

      assert(timeline.events.length === 4); // 100, 125, 150, 175
    });
    it("00:00.025 -> 00:00.125", function() {
      assert(timeline.events.length === 4); // 100, 125, 150, 175

      timeline.insert(0.050, callback(50));
      timeline.insert(0.075, callback(75));

      tickable.tick(25);
      timeline.audioContext.$process(0.025);

      assert.deepEqual(passed, [
        [  50, 0.050 + 0.005 ],
        [  75, 0.075 + 0.005 ],
        [ 100, 0.100 + 0.005 ],
      ]);

      assert(timeline.events.length === 3); // 125, 150, 175
    });
    it("00:00.050 -> 00:00.150+", function() {
      assert(timeline.events.length === 3); // 125, 150, 175

      timeline.insert(0.025, callback(25));

      tickable.tick(25);
      timeline.audioContext.$process(0.025);

      assert.deepEqual(passed, [
        [  25, 0.050 + 0.005 ],
        [ 125, 0.125 + 0.005 ],
        [ 150, 0.150 + 0.005 ],
      ]);

      assert(timeline.events.length === 1); // 175
    });
    it("00:00.075 -> 00:00.175", function() {
      assert(timeline.events.length === 1); // 175

      timeline.stop();
      timeline.stop();

      tickable.tick(25);
      timeline.audioContext.$process(0.025);

      assert.deepEqual(passed, [
      ]);

      assert(timeline.events.length === 1); // 175
    });
    it("00:00.100 -> 00:00.200", function() {
      assert(timeline.events.length === 1); // 175

      timeline.insert(0.250, callback(250));

      tickable.tick(25);
      timeline.audioContext.$process(0.025);

      assert.deepEqual(passed, [
      ]);

      assert(timeline.events.length === 2); // 175, 250
    });
    it("00:00.125 -> 00:00.225", function() {
      assert(timeline.events.length === 2); // 175, 250

      timeline.start();
      timeline.start();

      tickable.tick(25);
      timeline.audioContext.$process(0.025);

      assert.deepEqual(passed, [
        [ 175, 0.175 + 0.005 ],
      ]);

      assert(timeline.events.length === 1); // 250
    });
    it("00:00.150 -> 00:00.250", function() {
      assert(timeline.events.length === 1); // 250

      timeline.stop();
      timeline.stop();

      tickable.tick(25);
      timeline.audioContext.$process(0.025);

      assert.deepEqual(passed, [
      ]);

      assert(timeline.events.length === 1); // 250
    });
    it("00:00.175 -> 00:00.275", function() {
      assert(timeline.events.length === 1); // 250

      timeline.remove();

      tickable.tick(25);
      timeline.audioContext.$process(0.025);

      assert.deepEqual(passed, [
      ]);

      assert(timeline.events.length === 0);
    });
  });

});
