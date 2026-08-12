import vm from "node:vm";
import { buildHarness, compareJson, inferSignature, type ProblemLanguage } from "./languages";

const WANDBOX_URL = (process.env.WANDBOX_URL ?? "https://wandbox.org").replace(/\/+$/, "");

const WANDBOX_COMPILERS: Record<ProblemLanguage, string> = {
  javascript: "cpython-3.12.7",
  python: "cpython-3.12.7",
  java: "openjdk-jdk-21+35",
  cpp: "gcc-13.2.0",
  go: "go-1.23.2",
  rust: "rust-1.82.0",
  csharp: "mono-6.12.0.199",
  typescript: "typescript-5.6.2",
};

function truncate(s: string, max = 400): string {
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

export interface TestCaseResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export async function runRemoteTestCases(
  language: string,
  code: string,
  testCases: { input: string; expected: string }[]
): Promise<{ passed: boolean; results: TestCaseResult[] }> {
  const lang = language as ProblemLanguage;
  const signature = inferSignature(testCases);
  const inputs =
    lang === "typescript"
      ? testCases.map((tc) => {
          try {
            return JSON.parse(tc.input) as unknown[];
          } catch {
            return [];
          }
        })
      : undefined;
  const harness = buildHarness(lang, code, signature, inputs);
  const stdin = testCases.map((tc) => tc.input).join("\n");

  const failAll = (actual: string) => ({
    passed: false,
    results: testCases.map((tc) => ({
      input: tc.input, expected: tc.expected, actual, passed: false,
    })),
  });

  let data: {
    status?: number;
    compiler_error?: string;
    compiler_message?: string;
    program_output?: string;
    program_error?: string;
    program_message?: string;
    signal?: string;
  };
  try {
    const res = await fetch(`${WANDBOX_URL}/api/compile.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        compiler: WANDBOX_COMPILERS[lang],
        code: harness,
        stdin,
        compiler_option_raw: lang === "cpp" ? "-std=c++17 -O2" : undefined,
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error(`Judge returned HTTP ${res.status}`);
    data = await res.json();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Judge unreachable";
    return failAll(`Judge error: ${message}`);
  }

const status = data.status == null ? 0 : Number(data.status);
  if (status !== 0) {
    const message = truncate(
      data.program_error?.trim() ||
        data.compiler_error?.trim() ||
        data.compiler_message?.trim() ||
        `Judge exited with status ${status}`
    );
    return failAll(message);
  }
  const signal = data.signal?.trim();
  if (signal) return failAll(truncate(signal));

  const outLines = String(data.program_output ?? "").split("\n");
  const results = testCases.map((tc, i) => {
    const actual = (outLines[i] ?? "").trim();
    return { input: tc.input, expected: tc.expected, actual, passed: compareJson(actual, tc.expected) };
  });
  return { passed: results.every((r) => r.passed), results };
}

export async function runTestCases(
  code: string,
  testCases: { input: string; expected: string }[]
): Promise<{
  passed: boolean;
  results: { input: string; expected: string; actual: string; passed: boolean }[];
}> {
  const results = [];

  for (const tc of testCases) {
    try {
      const args: unknown[] = JSON.parse(tc.input);
      const wrapped = `${code}\nJSON.stringify(main(...${JSON.stringify(args)}))`;

      const sandbox = {
        console: { log: () => {} },
        setTimeout: undefined,
        clearTimeout: undefined,
      };

      const script = new vm.Script(wrapped);
      const actual = String(
        script.runInNewContext(sandbox, { timeout: 3000 })
      );
      const passed = actual === tc.expected.trim();

      results.push({ input: tc.input, expected: tc.expected, actual, passed });
    } catch (err) {
      const message =
        err instanceof Error ? err.message :
        typeof err === "string" ? err : "ERROR";
      results.push({
        input: tc.input,
        expected: tc.expected,
        actual: message,
        passed: false,
      });
    }
  }

  return {
    passed: results.every((r) => r.passed),
    results,
  };
}

function normalizeMarkup(code: string, category: string): string {
  let s = code
    .trim()
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .toLowerCase();

  s = s.replace(/\s+/g, " ");

  if (category === "html") {
    s = s.replace(/>\s+</g, "><");
    s = s.replace(/\s+>/g, ">");
    s = s.replace(/<\s+/g, "<");
  } else {
    s = s.replace(/\s*([{}:;,])\s*/g, "$1");
    s = s.replace(/;}/g, "}");
  }

  return s.trim();
}

export function runMarkupTestCases(
  code: string,
  testCases: { input: string; expected: string }[],
  category: string
): {
  passed: boolean;
  results: { input: string; expected: string; actual: string; passed: boolean }[];
} {
  const results = testCases.map((tc) => {
    const normalized = normalizeMarkup(code, category);
    const expected = normalizeMarkup(tc.expected, category);
    const passed = expected === "" ? normalized === "" : normalized.includes(expected);
    return {
      input: tc.input,
      expected: tc.expected,
      actual: code,
      passed,
    };
  });

  return {
    passed: results.every((r) => r.passed),
    results,
  };
}
