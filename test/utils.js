import "web-audio-test-api";
import assert from "power-assert";
import * as util from "../src/util";

describe("util", function() {
  describe("defaults", function() {
    it("(value: any, defaultValue: any): any", function() {
      assert(util.defaults(0        , 1000) === 0);
      assert(util.defaults(null     , 1000) === null);
      assert(util.defaults(undefined, 1000) === 1000);
    });
  });

  describe("respondTo", function() {
    it("(object: any, methodName: function): boolean", function() {
      assert(util.respondTo({}, "toString") === true);
      assert(util.respondTo({}, "toNumber") === false);
      assert(util.respondTo(0, "toString") === true);
      assert(util.respondTo(null, "toString") === false);
    });
  });

  describe("extend", function() {
    it("(a: object, b: object): object", function() {
      assert.deepEqual(util.extend({ a: 10, b: 20 }, { b: 40, c: 50 }), {
        a: 10, b: 40, c: 50,
      });
      assert.deepEqual(util.extend({ a: 10, b: 20 }, null), {
        a: 10, b: 20,
      });
    });
  });
});
