import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTestCases, runMarkupTestCases } from "../src/lib/piston";

describe("runTestCases", () => {
  const testCases = [
    { input: "[1, 2, 3]", expected: "6" },
    { input: "[]", expected: "0" },
  ];

  it("passes a correct solution", async () => {
    const result = await runTestCases(
      "function main(...nums) { return nums.reduce((a, b) => a + b, 0); }",
      testCases
    );
    assert.equal(result.passed, true);
    assert.ok(result.results.every((r) => r.passed));
  });

  it("fails an incorrect solution and reports actual output", async () => {
    const result = await runTestCases("function main(nums) { return 42; }", testCases);
    assert.equal(result.passed, false);
    assert.equal(result.results[0].passed, false);
    assert.equal(result.results[0].actual, "42");
  });

  it("reports a runtime error message instead of crashing", async () => {
    const result = await runTestCases("function main(nums) { return nums.nope(); }", testCases);
    assert.equal(result.passed, false);
    assert.ok(result.results[0].actual.length > 0);
  });

  it("reports a syntax error", async () => {
    const result = await runTestCases("function main(nums) { return", testCases);
    assert.equal(result.passed, false);
  });
});

describe("runMarkupTestCases", () => {
  it("passes HTML that contains the expected markup", () => {
    const result = runMarkupTestCases(
      "<div class=\"card\">  <h1>Hello</h1>  </div>",
      [{ input: "", expected: "<div class=\"card\"><h1>Hello</h1></div>" }],
      "html"
    );
    assert.equal(result.passed, true);
  });

  it("fails HTML missing the expected markup", () => {
    const result = runMarkupTestCases(
      "<p>no card here</p>",
      [{ input: "", expected: "<div class=\"card\"></div>" }],
      "html"
    );
    assert.equal(result.passed, false);
  });

  it("normalizes CSS whitespace before comparing", () => {
    const result = runMarkupTestCases(
      "body { margin: 0 ;  padding : 0 }",
      [{ input: "", expected: "body{margin:0;padding:0}" }],
      "css"
    );
    assert.equal(result.passed, true);
  });
});
