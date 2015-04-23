"use strict";

import "web-audio-test-api";
import assert from "power-assert";
import tickable from "tickable-timer";
import Context from "../../src/core/context";
import EventEmitter from "../../src/events/event-emitter";

let nop = () => {};

describe("EventEmitter", function() {
  let context, emitter;

  beforeEach(function() {
    context = new Context(new global.AudioContext(), {
      interval: 0.025,
      aheadTime: 0.1,
      offsetTime: 0,
      timerAPI: tickable
    });
    context.timeline.start();
    emitter = new EventEmitter(context);
  });

  describe("constructor", function() {
    it("()", function() {
      assert(emitter instanceof EventEmitter);
    });
  });

  describe("#hasListeners", function() {
    it("(type: stirng): boolean", function() {
      emitter.on("bang", nop);

      assert(emitter.hasListeners("bang") === true);
      assert(emitter.hasListeners("ding") === false);
    });
  });

  describe("#listeners", function() {
    it("(type: string): function[]", function() {
      emitter.on("bang", nop);

      assert.deepEqual(emitter.listeners("bang"), [ nop ]);
      assert.deepEqual(emitter.listeners("ding"), []);
    });
  });

  describe("#on", function() {
    it("(type: string, callback: function): self", function() {
      let passed = [];

      emitter.on("bang", (e) => {
        passed.push("!", e.data);
      });
      emitter.on("bang", (e) => {
        passed.push("?", e.data);
      });
      emitter.on("ding", "ding");

      emitter.emit("bang", { playbackTime: 0, data: 1 });
      emitter.emit("ding", { playbackTime: 0, data: 2 });
      emitter.emit("bang", { playbackTime: 0, data: 3 });

      tickable.tick(25);
      context.audioContext.$process(0.025);

      assert.deepEqual(passed, [ "!", 1, "?", 1, "!", 3, "?", 3 ]);
    });
  });

  describe("#once", function() {
    it("(type: string, callback: function): self", function() {
      let passed = [];

      emitter.once("bang", (e) => {
        passed.push("!", e.data);
      });

      emitter.once("bang", (e) => {
        passed.push("?", e.data);
      });

      emitter.once("ding", "ding");

      emitter.emit("bang", { playbackTime: 0, data: 1 });
      emitter.emit("ding", { playbackTime: 0, data: 2 });
      emitter.emit("bang", { playbackTime: 0, data: 3 });

      tickable.tick(25);
      context.audioContext.$process(0.025);

      assert.deepEqual(passed, [ "!", 1, "?", 1 ]);
    });
  });

  describe("#off", function() {
    it("(type: string, callback: function): self", function() {
      let passed = [];

      let bang = (e) => {
        passed.push("!", e.data);
      };

      emitter.on("bang", bang);

      emitter.on("bang", (e) => {
        passed.push("?", e.data);
      });

      emitter.off("bang", bang);
      // emitter.off("ding", bang);

      emitter.emit("bang", { playbackTime: 0, data: 1 });
      emitter.emit("ding", { playbackTime: 0, data: 2 });
      emitter.emit("bang", { playbackTime: 0, data: 3 });

      tickable.tick(25);
      context.audioContext.$process(0.025);

      assert.deepEqual(passed, [ "?", 1, "?", 3 ]);
    });
    it("(type: string, callback: function): self // works with #once()", function() {
      let passed = [];

      let bang = (e) => {
        passed.push("!", e.data);
      };

      emitter.once("bang", bang);

      emitter.once("bang", (e) => {
        passed.push("?", e.data);
      });

      emitter.off("bang", bang);
      emitter.off("ding", bang);

      emitter.emit("bang", { playbackTime: 0, data: 1 });
      emitter.emit("ding", { playbackTime: 0, data: 2 });
      emitter.emit("bang", { playbackTime: 0, data: 3 });

      tickable.tick(25);
      context.audioContext.$process(0.025);

      assert.deepEqual(passed, [ "?", 1 ]);
    });
    it("(type: string): self", function() {
      let passed = [];

      emitter.once("bang", (e) => {
        passed.push("!", e.data);
      });

      emitter.once("bang", (e) => {
        passed.push("?", e.data);
      });

      emitter.off("bang");
      emitter.off("ding");

      emitter.emit("bang", { playbackTime: 0, data: 1 });
      emitter.emit("ding", { playbackTime: 0, data: 2 });
      emitter.emit("bang", { playbackTime: 0, data: 3 });

      tickable.tick(25);
      context.audioContext.$process(0.025);

      assert.deepEqual(passed, []);
    });
    it("(): self", function() {
      let passed = [];

      emitter.once("bang", (e) => {
        passed.push("!", e.data);
      });

      emitter.once("bang", (e) => {
        passed.push("?", e.data);
      });

      emitter.off();

      emitter.emit("bang", { playbackTime: 0, data: 1 });
      emitter.emit("ding", { playbackTime: 0, data: 2 });
      emitter.emit("bang", { playbackTime: 0, data: 3 });

      tickable.tick(25);
      context.audioContext.$process(0.025);

      assert.deepEqual(passed, []);
    });
  });

  describe("#emit", function() {
    it("(type: string, data: any): void", function() {
      let passed = [];

      emitter.on("bang", function(e) {
        passed.push(e.data);
      });
      emitter.on("ding", function(e) {
        passed.push(e.data);
      });

      emitter.emit("bang", { playbackTime: 0.000, data: 1 });
      emitter.emit("ding", { playbackTime: 0.100, data: 2 });

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
