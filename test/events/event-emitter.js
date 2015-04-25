import assert from "power-assert";
import EventEmitter from "../../src/events/event-emitter";

describe("events/EventEmitter", function() {
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
      emitter.on("bang", it);

      assert(emitter.hasListeners("bang") === true);
      assert(emitter.hasListeners("ding") === false);
    });
  });

  describe("#listeners", function() {
    it("(type: string): function[]", function() {
      emitter.on("bang", it);

      assert.deepEqual(emitter.listeners("bang"), [ it ]);
      assert.deepEqual(emitter.listeners("ding"), []);
    });
  });

  describe("#on", function() {
    it("(type: string, callback: function): self", function() {
      let passed = [];

      emitter.on("bang", function(data) {
        passed.push("!", data);
      });
      emitter.on("bang", function(data) {
        passed.push("?", data);
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

      emitter.once("bang", function(data) {
        passed.push("!", data);
      });

      emitter.once("bang", function(data) {
        passed.push("?", data);
      });

      emitter.once("ding", "ding");

      emitter.emit("bang", 1);
      emitter.emit("ding", 2);
      emitter.emit("bang", 3);

      assert.deepEqual(passed, [ "!", 1, "?", 1 ]);
    });
  });


  describe("#addListener", function() {
    it("(type: string, callback: function): self", function() {
      let passed = [];

      emitter.addListener("bang", function(data) {
        passed.push("!", data);
      });
      emitter.addListener("bang", function(data) {
        passed.push("?", data);
      });
      emitter.addListener("ding", "ding");

      emitter.emit("bang", 1);
      emitter.emit("ding", 2);
      emitter.emit("bang", 3);

      assert.deepEqual(passed, [ "!", 1, "?", 1, "!", 3, "?", 3 ]);
    });
  });

  describe("#removeListener", function() {
    it("(type: string, callback: function): self", function() {
      let passed = [];

      function bang(data) {
        passed.push("!", data);
      }

      emitter.on("bang", bang);

      emitter.on("bang", function(data) {
        passed.push("?", data);
      });

      emitter.removeListener("bang", bang);
      // emitter.removeListener("ding", bang);

      emitter.emit("bang", 1);
      emitter.emit("ding", 2);
      emitter.emit("bang", 3);

      assert.deepEqual(passed, [ "?", 1, "?", 3 ]);
    });
    it("(type: string, callback: function): self // works with #once()", function() {
      let passed = [];

      function bang(data) {
        passed.push("!", data);
      }

      emitter.once("bang", bang);

      emitter.once("bang", function(data) {
        passed.push("?", data);
      });

      emitter.removeListener("bang", bang);
      emitter.removeListener("ding", bang);

      emitter.emit("bang", 1);
      emitter.emit("ding", 2);
      emitter.emit("bang", 3);

      assert.deepEqual(passed, [ "?", 1 ]);
    });
  });

  describe("#removeAllListeners", function() {
    it("(type: string): self", function() {
      let passed = [];

      emitter.once("bang", function(data) {
        passed.push("!", data);
      });

      emitter.once("bang", function(data) {
        passed.push("?", data);
      });

      emitter.removeAllListeners("bang");
      emitter.removeAllListeners("ding");

      emitter.emit("bang", 1);
      emitter.emit("ding", 2);
      emitter.emit("bang", 3);

      assert.deepEqual(passed, []);
    });
    it("(): self", function() {
      let passed = [];

      emitter.once("bang", function(data) {
        passed.push("!", data);
      });

      emitter.once("bang", function(data) {
        passed.push("?", data);
      });

      emitter.removeAllListeners();

      emitter.emit("bang", 1);
      emitter.emit("ding", 2);
      emitter.emit("bang", 3);

      assert.deepEqual(passed, []);
    });
  });

  describe("#emit", function() {
    it("(type: string, data: any): void", function() {
      let passed = [];

      emitter.on("bang", function(data) {
        assert(this === emitter);
        passed.push(data);
      });
      emitter.on("ding", function(data) {
        assert(this === emitter);
        passed.push(data);
      });

      emitter.emit("bang", 1);
      emitter.emit("ding", 2);

      assert.deepEqual(passed, [ 1, 2 ]);
    });
  });
});
