import "web-audio-test-api";
import assert from "power-assert";
import tickable from "tickable-timer";
import Context from "../../src/core/context";
import EventEmitter from "../../src/events/event-emitter";
import TimelineEventEmitter from "../../src/events/timeline-event-emitter";

describe("TimelineEventEmitter", function() {
  let context, emitter;

  beforeEach(function() {
    context = new Context(new global.AudioContext(), {
      interval: 0.025,
      aheadTime: 0.1,
      offsetTime: 0,
      timerAPI: tickable,
    });
    context.timeline.start();
    emitter = new TimelineEventEmitter(context);
  });

  describe("constructor", function() {
    it("()", function() {
      assert(emitter instanceof TimelineEventEmitter);
      assert(emitter instanceof EventEmitter);
    });
  });

  describe("#emit", function() {
    it("(type: string, data: object): void", function() {
      let passed = [];

      emitter.on("bang", function(e) {
        passed.push(e.data);
      });
      emitter.on("ding", function(e) {
        passed.push(e.data);
      });

      emitter.emit("bang", { playbackTime: 0.000, data: 1 });
      emitter.emit("ding", { playbackTime: 0.105, data: 2 });

      assert.deepEqual(passed, []);

      tickable.tick(25);
      context.audioContext.$process(0.025);

      assert.deepEqual(passed, [ 1 ]);

      tickable.tick(25);
      context.audioContext.$process(0.025);

      assert.deepEqual(passed, [ 1, 2 ]);
    });
  });
});
