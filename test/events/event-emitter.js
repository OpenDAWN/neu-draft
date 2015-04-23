"use strict";

import assert from "power-assert";
import EventEmitter from "../../src/events/event-emitter";

let nop = () => {};

describe("EventEmitter", function() {
  let emitter;

  beforeEach(function() {
    emitter = new EventEmitter();
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

      emitter.on("bang", (val) => {
        passed.push("!", val);
      });
      emitter.on("bang", (val) => {
        passed.push("?", val);
      });
      emitter.on("ding", "ding");

      emitter.emit("bang", 1);
      emitter.emit("ding", 2);
      emitter.emit("bang", 3);

      assert.deepEqual(passed, [ "!", 1, "?", 1, "!", 3, "?", 3 ]);
    });
  });

  describe("#once", function() {
    it("(type: string, callback: function): self", function() {
      let passed = [];

      emitter.once("bang", (val) => {
        passed.push("!", val);
      });

      emitter.once("bang", (val) => {
        passed.push("?", val);
      });

      emitter.once("ding", "ding");

      emitter.emit("bang", 1);
      emitter.emit("ding", 2);
      emitter.emit("bang", 3);

      assert.deepEqual(passed, [ "!", 1, "?", 1 ]);
    });
  });

  describe("#off", function() {
    it("(type: string, callback: function): self", function() {
      let passed = [];

      let bang = (val) => {
        passed.push("!", val);
      };

      emitter.on("bang", bang);

      emitter.on("bang", (val) => {
        passed.push("?", val);
      });

      emitter.off("bang", bang);
      // emitter.off("ding", bang);

      emitter.emit("bang", 1);
      emitter.emit("ding", 2);
      emitter.emit("bang", 3);

      assert.deepEqual(passed, [ "?", 1, "?", 3 ]);
    });
    it("(type: string, callback: function): self // works with #once()", function() {
      let passed = [];

      let bang = (val) => {
        passed.push("!", val);
      };

      emitter.once("bang", bang);

      emitter.once("bang", (val) => {
        passed.push("?", val);
      });

      emitter.off("bang", bang);
      emitter.off("ding", bang);

      emitter.emit("bang", 1);
      emitter.emit("ding", 2);
      emitter.emit("bang", 3);

      assert.deepEqual(passed, [ "?", 1 ]);
    });
    it("(type: string): self", function() {
      let passed = [];

      emitter.once("bang", (val) => {
        passed.push("!", val);
      });

      emitter.once("bang", (val) => {
        passed.push("?", val);
      });

      emitter.off("bang");
      emitter.off("ding");

      emitter.emit("bang", 1);
      emitter.emit("ding", 2);
      emitter.emit("bang", 3);

      assert.deepEqual(passed, []);
    });
    it("(): self", function() {
      let passed = [];

      emitter.once("bang", (val) => {
        passed.push("!", val);
      });

      emitter.once("bang", (val) => {
        passed.push("?", val);
      });

      emitter.off();

      emitter.emit("bang", 1);
      emitter.emit("ding", 2);
      emitter.emit("bang", 3);

      assert.deepEqual(passed, []);
    });
  });

  describe("#emit", function() {
    it("(type: string, data: any): void", function() {
      let passed = [];

      emitter.on("bang", function(val) {
        assert(this === emitter);
        passed.push(val);
      });
      emitter.on("ding", function(val) {
        assert(this === emitter);
        passed.push(val);
      });

      emitter.emit("bang", 1);
      emitter.emit("ding", 2);
      emitter.emit("bang");

      assert.deepEqual(passed, [ 1, 2, null ]);
    });
  });
});
