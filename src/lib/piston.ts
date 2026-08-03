import vm from "node:vm";

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
