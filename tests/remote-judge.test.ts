import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import type { AddressInfo } from "node:net";
import type { runRemoteTestCases as runRemoteTestCasesType } from "../src/lib/piston";

type Mode = "ok" | "compile-error" | "run-error" | "warn";

const testCases = [
  { input: "[[1,2,3],6]", expected: "6" },
  { input: "[[1,2,3],7]", expected: "[1,2]" },
];

let mode: Mode = "ok";
let lastBody: Record<string, unknown> | null = null;
let server: http.Server;
let closed = false;
let runRemoteTestCases: typeof runRemoteTestCasesType;

before(async () => {
  server = http.createServer((req, res) => {
    let raw = "";
    req.on("data", (chunk: Buffer) => (raw += chunk));
    req.on("end", () => {
      try {
        lastBody = JSON.parse(raw);
      } catch {
        lastBody = null;
      }
      res.setHeader("Content-Type", "application/json");
      const base = { status: "0", compiler_error: "", compiler_message: "", program_error: "", signal: "" };
      if (mode === "compile-error") {
        res.end(JSON.stringify({ ...base, status: "1", compiler_error: "boom: syntax", compiler_message: "boom: syntax" }));
      } else if (mode === "run-error") {
        res.end(JSON.stringify({ ...base, status: "1", program_error: "kaboom at line 3" }));
      } else if (mode === "warn") {
        res.end(JSON.stringify({ ...base, compiler_error: "warning: dead code", compiler_message: "warning: dead code", program_output: "6\n[1,2]\n" }));
      } else {
        res.end(JSON.stringify({ ...base, program_output: "6\n[1,2]\n" }));
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
  const { port } = server.address() as AddressInfo;
  process.env.WANDBOX_URL = `http://127.0.0.1:${port}`;
  ({ runRemoteTestCases } = await import("../src/lib/piston"));
});

after(() => {
  if (closed) return;
  closed = true;
  return new Promise<void>((resolve) => server.close(() => resolve()));
});

describe("runRemoteTestCases (Wandbox)", () => {
  it("passes a correct solution against a fake judge", async () => {
    mode = "ok";
    const result = await runRemoteTestCases("python", "def solve(nums, target):\n    return [1, 2]", testCases);
    assert.equal(result.passed, true);
    assert.ok(result.results.every((r) => r.passed));
  });

  it("sends the right compile payload", async () => {
    mode = "ok";
    await runRemoteTestCases("python", "def solve(nums, target):\n    return [1, 2]", testCases);
    assert.equal(lastBody?.compiler, "cpython-3.12.7");
    assert.match(lastBody?.code as string, /def solve/);
    assert.match(lastBody?.stdin as string, /\[\[1,2,3\],6\]/);
    assert.equal(lastBody?.compiler_option_raw, undefined);
  });

  it("sends C++ standard flags", async () => {
    mode = "ok";
    await runRemoteTestCases("cpp", "auto solve(vector<long long> nums, long long target) { return vector<long long>{1, 2}; }", testCases);
    assert.equal(lastBody?.compiler, "gcc-13.2.0");
    assert.match(lastBody?.compiler_option_raw as string, /-std=c\+\+17/);
  });

  it("turns a compile error into per-test-case failures with the message", async () => {
    mode = "compile-error";
    const result = await runRemoteTestCases("python", "def solve(nums): return", testCases);
    assert.equal(result.passed, false);
    assert.ok(result.results.every((r) => !r.passed));
    assert.equal(result.results[0].actual, "boom: syntax");
  });

  it("reports run-time errors with stderr output", async () => {
    mode = "run-error";
    const result = await runRemoteTestCases("python", "def solve(nums, target):\n    raise RuntimeError()", testCases);
    assert.equal(result.passed, false);
    assert.match(result.results[0].actual, /kaboom at line 3/);
  });

  it("ignores compiler warnings when the status is 0", async () => {
    mode = "warn";
    const result = await runRemoteTestCases("rust", "fn solve(nums: Vec<i64>, target: i64) -> i64 { nums[0] + target - 3 }", testCases);
    assert.equal(result.passed, true);
  });

  it("fails gracefully when the judge is unreachable", async () => {
    closed = true;
    await new Promise<void>((resolve) => server.close(() => resolve()));
    const result = await runRemoteTestCases("python", "def solve(nums, target):\n    return [1, 2]", testCases);
    assert.equal(result.passed, false);
    assert.match(result.results[0].actual, /^Judge error/);
  });
});