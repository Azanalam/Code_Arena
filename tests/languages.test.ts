import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildHarness,
  compareJson,
  generateStarterCode,
  inferSignature,
  inferType,
  LANGUAGE_IDS,
  PROBLEM_LANGUAGES,
  type Signature,
} from "../src/lib/languages";

const twoSum = {
  params: [
    { name: "nums", type: "int[]" },
    { name: "target", type: "int" },
  ],
  returns: "int[]",
} satisfies Signature;

const scalar = { params: [{ name: "n", type: "int" }], returns: "int" } satisfies Signature;

describe("inferType", () => {
  it("distinguishes ints from doubles", () => {
    assert.equal(inferType(1), "int");
    assert.equal(inferType(1.5), "double");
  });
  it("maps booleans, strings and arrays", () => {
    assert.equal(inferType(true), "bool");
    assert.equal(inferType("x"), "string");
    assert.equal(inferType([]), "int[]");
    assert.equal(inferType([1, 2]), "int[]");
    assert.equal(inferType([[1]]), "int[][]");
    assert.equal(inferType(["a"]), "string[]");
    assert.equal(inferType([1.5]), "double[]");
  });
});

describe("inferSignature", () => {
  it("derives params and return type from the first test case", () => {
    const sig = inferSignature([{ input: "[[2,7,11,15],9]", expected: "[0,1]" }]);
    assert.deepEqual(sig.params, [
      { name: "p0", type: "int[]" },
      { name: "p1", type: "int" },
    ]);
    assert.equal(sig.returns, "int[]");
  });
  it("handles string returns and string params", () => {
    const sig = inferSignature([{ input: `["()"]`, expected: `"true"` }]);
    assert.equal(sig.params[0].type, "string");
    assert.equal(sig.returns, "string");
  });
});

describe("LANGUAGE_IDS", () => {
  it("exposes exactly the 8 supported languages", () => {
    assert.equal(LANGUAGE_IDS.length, 8);
    assert.deepEqual(
      [...LANGUAGE_IDS].sort(),
      ["cpp", "csharp", "go", "java", "javascript", "python", "rust", "typescript"]
    );
    assert.equal(PROBLEM_LANGUAGES.length, LANGUAGE_IDS.length);
  });
});

describe("generateStarterCode", () => {
  it("uses main for JavaScript and solve elsewhere", () => {
    assert.match(generateStarterCode("javascript", scalar), /^function main\(n\)/);
    assert.match(generateStarterCode("python", scalar), /^def solve\(n\)/);
    assert.match(generateStarterCode("typescript", scalar), /^function solve\(n: number\)/);
  });
  it("emits valid Java stubs for array returns", () => {
    const code = generateStarterCode("java", twoSum);
    assert.match(code, /public static int\[\] solve\(int\[\] nums, int target\)/);
    assert.match(code, /return null;/);
  });
  it("emits valid C++ stubs for array returns", () => {
    const code = generateStarterCode("cpp", twoSum);
    assert.match(code, /vector<long long> solve\(vector<long long> nums, long long target\)/);
    assert.match(code, /return \{\};/);
  });
  it("returns nil for Go arrays and String::new() for Rust strings", () => {
    assert.match(generateStarterCode("go", twoSum), /return nil/);
    assert.match(
      generateStarterCode("rust", { params: [{ name: "s", type: "string" }], returns: "string" }),
      /String::new\(\)/
    );
  });
  it("returns null for C# arrays and a placeholder for Python", () => {
    assert.match(generateStarterCode("csharp", twoSum), /return null;/);
    assert.match(generateStarterCode("python", scalar), /return 0/);
  });
});

describe("buildHarness", () => {
  for (const lang of ["python", "java", "cpp", "go", "rust", "csharp", "typescript"] as const) {
    it(`produces a harness for ${lang} that embeds the user code and calls solve`, () => {
      const harness = buildHarness(lang, "function solve(nums) { return nums; }", twoSum);
      assert.ok(harness.length > 100);
      assert.match(harness, /solve/);
    });
  }
  it("rejects javascript (judged locally, not via Piston)", () => {
    assert.throws(() => buildHarness("javascript", "x", scalar), /unsupported language/);
  });
});

describe("compareJson", () => {
  it("treats integers and their float forms as equal", () => {
    assert.equal(compareJson("1", "1.0"), true);
    assert.equal(compareJson("0.1", "0.10000000001"), true);
  });
  it("compares arrays and objects structurally", () => {
    assert.equal(compareJson("[1,2]", "[1,2]"), true);
    assert.equal(compareJson("[1,2]", "[1,3]"), false);
    assert.equal(compareJson(`["a","b"]`, `["a","b"]`), true);
    assert.equal(compareJson("true", "true"), true);
    assert.equal(compareJson("false", "true"), false);
  });
  it("falls back to trimmed string equality for non-JSON output", () => {
    assert.equal(compareJson("a b", "a b"), true);
    assert.equal(compareJson("a b", "a  b"), false);
  });
});
