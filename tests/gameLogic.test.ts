import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateScore, generateRoomCode, assignPlayerColors } from "../src/lib/gameLogic";

describe("generateRoomCode", () => {
  it("returns a 6-character code", () => {
    assert.equal(generateRoomCode().length, 6);
  });

  it("only uses unambiguous alphanumeric characters", () => {
    const allowed = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/;
    for (let i = 0; i < 100; i++) {
      assert.match(generateRoomCode(), allowed);
    }
  });

  it("generates distinct codes in practice", () => {
    const codes = new Set(Array.from({ length: 1000 }, () => generateRoomCode()));
    assert.ok(codes.size > 990, `expected near-unique codes, got ${codes.size} unique`);
  });
});

describe("calculateScore", () => {
  it("awards base + full time bonus when solved instantly", () => {
    assert.equal(calculateScore(0, 600, "easy"), 200);
    assert.equal(calculateScore(0, 600, "medium"), 500);
    assert.equal(calculateScore(0, 600, "hard"), 1000);
  });

  it("awards base + half time bonus midway", () => {
    assert.equal(calculateScore(300, 600, "easy"), 150);
    assert.equal(calculateScore(300, 600, "medium"), 375);
  });

  it("never drops below the base score", () => {
    assert.equal(calculateScore(600, 600, "easy"), 100);
    assert.equal(calculateScore(900, 600, "medium"), 250);
    assert.equal(calculateScore(3600, 600, "hard"), 500);
  });

  it("clamps negative bonuses to zero", () => {
    const score = calculateScore(601, 600, "easy");
    assert.equal(score, 100);
    assert.ok(Number.isInteger(score));
  });
});

describe("assignPlayerColors", () => {
  it("returns one color per player, up to the palette size", () => {
    assert.equal(assignPlayerColors(1).length, 1);
    assert.equal(assignPlayerColors(4).length, 4);
    assert.equal(assignPlayerColors(8).length, 8);
    assert.equal(assignPlayerColors(12).length, 8);
  });
});
