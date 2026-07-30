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
        script.runInNewContext(sandbox, { timeout: 3000 } as any)
      );
      const passed = actual === tc.expected.trim();

      results.push({ input: tc.input, expected: tc.expected, actual, passed });
    } catch (err) {
      const message =
        typeof err === "object" && err !== null && typeof (err as any).message === "string"
          ? (err as any).message
          : typeof err === "string"
            ? err
            : "ERROR";
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
