import "web-audio-test-api";
import tickable from "tickable-timer";
import assert from "power-assert";
import Context from "../../src/core/context";
import Flow from "../../src/events/flow";

describe.skip("events/Flow", function() {
  let flow;

  beforeEach(function() {
    let context = new Context(new global.AudioContext(), {
      interval: 0.1,
      aheadTime: 0.105,
      offsetTime: 0,
      timerAPI: tickable,
    });
    context.start();
    flow = new Flow(context);
  });

  describe("constructor", function() {
    it("(context: Context)", function() {
      assert(flow instanceof Flow);
      assert(flow.context instanceof Context);
    });
  });

  describe("write", function() {
    it("(object: { playbackTime: number, data: any }): void", function() {
      let passed = [];

      flow.write({ playbackTime: 0.100, data: 100 });
      flow.write({ playbackTime: 0.200, data: 200 });
      flow.write({ playbackTime: 0.150, data: 150 });
      flow.write({ playbackTime: 0.300, data: 300 });
      flow.write({ playbackTime: 0.400, data: 400 });

      flow.on("data", (object) => {
        passed.push(object);
      });

      assert.deepEqual(passed, []);

      tickable.tick(100);
      flow.context.audioContext.$process(0.100);

      assert.deepEqual(passed, [
        { playbackTime: 0.100, data: 100 },
      ]);

      tickable.tick(100);
      flow.context.audioContext.$process(0.100);

      assert.deepEqual(passed, [
        { playbackTime: 0.100, data: 100 },
        { playbackTime: 0.150, data: 150 },
        { playbackTime: 0.200, data: 200 },
      ]);
    });
  });

  describe("merge", function() {
    it("(fn: function): Flow", function() {
      let passed = [];
      var flow2 = new Flow(flow.context);

      flow.write({ playbackTime: 0.100, data: 100 });
      flow.write({ playbackTime: 0.200, data: 200 });
      flow.write({ playbackTime: 0.150, data: 150 });
      flow.write({ playbackTime: 0.300, data: 300 });
      flow.write({ playbackTime: 0.400, data: 400 });

      flow2.write({ playbackTime: 0.150, data: 151 });
      flow2.write({ playbackTime: 0.250, data: 251 });
      flow2.write({ playbackTime: 0.200, data: 201 });
      flow2.write({ playbackTime: 0.350, data: 351 });
      flow2.write({ playbackTime: 0.450, data: 451 });

      flow = flow.merge(flow2);

      flow.on("data", (object) => {
        passed.push(object);
      });

      assert.deepEqual(passed, []);

      tickable.tick(100);
      flow.context.audioContext.$process(0.100);

      assert.deepEqual(passed, [
        { playbackTime: 0.100, data: 100 },
      ]);

      tickable.tick(100);
      flow.context.audioContext.$process(0.100);

      assert.deepEqual(passed, [
        { playbackTime: 0.100, data: 100 },
        { playbackTime: 0.150, data: 150 },
        { playbackTime: 0.150, data: 151 },
        { playbackTime: 0.200, data: 200 },
        { playbackTime: 0.200, data: 201 },
      ]);
    });
  });

  describe("map", function() {
    it("(fn: function): Flow", function() {
      let passed = [];

      flow.write({ playbackTime: 0.100, data: 100 });
      flow.write({ playbackTime: 0.200, data: 200 });
      flow.write({ playbackTime: 0.150, data: 150 });
      flow.write({ playbackTime: 0.300, data: 300 });
      flow.write({ playbackTime: 0.400, data: 400 });

      flow = flow.map(function(data) {
        return data * 2;
      });

      flow.on("data", (object) => {
        passed.push(object);
      });

      assert.deepEqual(passed, []);

      tickable.tick(100);
      flow.context.audioContext.$process(0.100);

      assert.deepEqual(passed, [
        { playbackTime: 0.100, data: 200 },
      ]);

      tickable.tick(100);
      flow.context.audioContext.$process(0.100);

      assert.deepEqual(passed, [
        { playbackTime: 0.100, data: 200 },
        { playbackTime: 0.150, data: 300 },
        { playbackTime: 0.200, data: 400 },
      ]);
    });
  });

  describe("filter", function() {
    it("(fn: function): Flow", function() {
      let passed = [];

      flow.write({ playbackTime: 0.100, data: 100 });
      flow.write({ playbackTime: 0.200, data: 200 });
      flow.write({ playbackTime: 0.150, data: 150 });
      flow.write({ playbackTime: 0.300, data: 300 });
      flow.write({ playbackTime: 0.400, data: 400 });

      flow = flow.filter(function(data) {
        return data !== 150;
      });

      flow.on("data", (object) => {
        passed.push(object);
      });

      assert.deepEqual(passed, []);

      tickable.tick(100);
      flow.context.audioContext.$process(0.100);

      assert.deepEqual(passed, [
        { playbackTime: 0.100, data: 100 },
      ]);

      tickable.tick(100);
      flow.context.audioContext.$process(0.100);

      assert.deepEqual(passed, [
        { playbackTime: 0.100, data: 100 },
        { playbackTime: 0.200, data: 200 },
      ]);
    });
  });

  describe("scan", function() {
    it("(intValue: any, fn: function): Flow", function() {
      let passed = [];

      flow.write({ playbackTime: 0.100, data: 100 });
      flow.write({ playbackTime: 0.200, data: 200 });
      flow.write({ playbackTime: 0.150, data: 150 });
      flow.write({ playbackTime: 0.300, data: 300 });
      flow.write({ playbackTime: 0.400, data: 400 });

      flow = flow.scan(0, function(a, b) {
        return a + b;
      });

      flow.on("data", (object) => {
        passed.push(object);
      });

      assert.deepEqual(passed, []);

      tickable.tick(100);
      flow.context.audioContext.$process(0.100);

      assert.deepEqual(passed, [
        { playbackTime: 0.100, data: 100 },
      ]);

      tickable.tick(100);
      flow.context.audioContext.$process(0.100);

      assert.deepEqual(passed, [
        { playbackTime: 0.100, data: 100 },
        { playbackTime: 0.150, data: 250 },
        { playbackTime: 0.200, data: 450 },
      ]);
    });
  });

  describe("delay", function() {
    it("(fn: function): Flow", function() {
      let passed = [];

      flow.write({ playbackTime: 0.100, data: 100 });
      flow.write({ playbackTime: 0.200, data: 200 });
      flow.write({ playbackTime: 0.150, data: 150 });
      flow.write({ playbackTime: 0.300, data: 300 });
      flow.write({ playbackTime: 0.400, data: 400 });

      flow = flow.delay(0.100);

      flow.on("data", (object) => {
        passed.push(object);
      });

      assert.deepEqual(passed, []);

      tickable.tick(100);
      flow.context.audioContext.$process(0.100);

      assert.deepEqual(passed, []);

      tickable.tick(100);
      flow.context.audioContext.$process(0.100);

      assert.deepEqual(passed, [
        { playbackTime: 0.100 + 0.100, data: 100 },
      ]);

      tickable.tick(100);
      flow.context.audioContext.$process(0.100);

      assert.deepEqual(passed, [
        { playbackTime: 0.100 + 0.100, data: 100 },
        { playbackTime: 0.150 + 0.100, data: 150 },
        { playbackTime: 0.200 + 0.100, data: 200 },
      ]);
    });
  });


});
