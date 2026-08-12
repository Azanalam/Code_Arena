export type ProblemLanguage =
  | "javascript"
  | "python"
  | "java"
  | "cpp"
  | "go"
  | "rust"
  | "csharp"
  | "typescript";

export const PROBLEM_LANGUAGES: { id: ProblemLanguage; label: string; monaco: string }[] = [
  { id: "javascript", label: "JavaScript", monaco: "javascript" },
  { id: "python", label: "Python", monaco: "python" },
  { id: "java", label: "Java", monaco: "java" },
  { id: "cpp", label: "C++", monaco: "cpp" },
  { id: "go", label: "Go", monaco: "go" },
  { id: "rust", label: "Rust", monaco: "rust" },
  { id: "csharp", label: "C#", monaco: "csharp" },
  { id: "typescript", label: "TypeScript", monaco: "typescript" },
];

export const LANGUAGE_IDS = PROBLEM_LANGUAGES.map((l) => l.id);

export function languageLabel(id: string): string {
  return PROBLEM_LANGUAGES.find((l) => l.id === id)?.label ?? id;
}

export type PType =
  | "int"
  | "double"
  | "bool"
  | "string"
  | "int[]"
  | "double[]"
  | "bool[]"
  | "string[]"
  | "int[][]"
  | "double[][]";

export interface ParamSpec {
  name: string;
  type: PType;
}

export interface Signature {
  params: ParamSpec[];
  returns: PType;
}

const TYPE_NAMES: Record<ProblemLanguage, Record<PType, string>> = {
  javascript: {
    int: "number", double: "number", bool: "boolean", string: "string",
    "int[]": "number[]", "double[]": "number[]", "bool[]": "boolean[]", "string[]": "string[]",
    "int[][]": "number[][]", "double[][]": "number[][]",
  },
  python: {
    int: "int", double: "float", bool: "bool", string: "str",
    "int[]": "list[int]", "double[]": "list[float]", "bool[]": "list[bool]", "string[]": "list[str]",
    "int[][]": "list[list[int]]", "double[][]": "list[list[float]]",
  },
  java: {
    int: "int", double: "double", bool: "boolean", string: "String",
    "int[]": "int[]", "double[]": "double[]", "bool[]": "boolean[]", "string[]": "String[]",
    "int[][]": "int[][]", "double[][]": "double[][]",
  },
  cpp: {
    int: "long long", double: "double", bool: "bool", string: "std::string",
    "int[]": "vector<long long>", "double[]": "vector<double>", "bool[]": "vector<bool>", "string[]": "vector<string>",
    "int[][]": "vector<vector<long long>>", "double[][]": "vector<vector<double>>",
  },
  go: {
    int: "int", double: "float64", bool: "bool", string: "string",
    "int[]": "[]int", "double[]": "[]float64", "bool[]": "[]bool", "string[]": "[]string",
    "int[][]": "[][]int", "double[][]": "[][]float64",
  },
  rust: {
    int: "i64", double: "f64", bool: "bool", string: "String",
    "int[]": "Vec<i64>", "double[]": "Vec<f64>", "bool[]": "Vec<bool>", "string[]": "Vec<String>",
    "int[][]": "Vec<Vec<i64>>", "double[][]": "Vec<Vec<f64>>",
  },
  csharp: {
    int: "long", double: "double", bool: "bool", string: "string",
    "int[]": "long[]", "double[]": "double[]", "bool[]": "bool[]", "string[]": "string[]",
    "int[][]": "long[][]", "double[][]": "double[][]",
  },
  typescript: {
    int: "number", double: "number", bool: "boolean", string: "string",
    "int[]": "number[]", "double[]": "number[]", "bool[]": "boolean[]", "string[]": "string[]",
    "int[][]": "number[][]", "double[][]": "number[][]",
  },
};

const DEFAULT_VALUES: Record<PType, string> = {
  int: "0",
  double: "0.0",
  bool: "false",
  string: '""',
  "int[]": "[]",
  "double[]": "[]",
  "bool[]": "[]",
  "string[]": "[]",
  "int[][]": "[]",
  "double[][]": "[]",
};

export function inferType(value: unknown): PType {
  if (typeof value === "number") {
    return Number.isInteger(value) ? "int" : "double";
  }
  if (typeof value === "boolean") return "bool";
  if (typeof value === "string") return "string";
  if (Array.isArray(value)) {
    if (value.length === 0) return "int[]";
    const inner = inferType(value[0]);
    if (inner === "int[]" || inner === "double[]") return inner === "int[]" ? "int[][]" : "double[][]";
    return `${inner}[]` as PType;
  }
  return "string";
}

export function inferSignature(testCases: { input: string; expected: string }[]): Signature {
  const first = testCases[0];
  let params: ParamSpec[] = [];
  try {
    const args = JSON.parse(first.input);
    if (Array.isArray(args)) {
      params = args.map((v, i) => ({ name: `p${i}`, type: inferType(v) }));
    }
  } catch {
    params = [];
  }
  let returns: PType = "int";
  try {
    returns = inferType(JSON.parse(first.expected));
  } catch {
    returns = "int";
  }
  return { params, returns };
}

export function generateStarterCode(language: ProblemLanguage, signature: Signature): string {
  const p = signature.params;
  const name = language === "javascript" ? "main" : "solve";
  const defaultVal = DEFAULT_VALUES[signature.returns];

  switch (language) {
    case "javascript":
      return `function ${name}(${p.map((x) => x.name).join(", ")}) {\n  // Write your code here\n  return ${defaultVal};\n}`;
    case "python":
      return `def ${name}(${p.map((x) => x.name).join(", ")}):\n    # Write your code here\n    return ${defaultVal === '""' ? '""' : defaultVal}`;
    case "java":
      return `class Solution {\n    public static ${TYPE_NAMES.java[signature.returns]} ${name}(${p.map((x) => `${TYPE_NAMES.java[x.type]} ${x.name}`).join(", ")}) {\n        // Write your code here\n        return ${signature.returns.endsWith("[]") ? "null" : defaultVal === '""' ? '""' : defaultVal};\n    }\n}`;
    case "cpp":
      return `${TYPE_NAMES.cpp[signature.returns]} ${name}(${p.map((x) => `${TYPE_NAMES.cpp[x.type]} ${x.name}`).join(", ")}) {\n    // Write your code here\n    return ${signature.returns.endsWith("[]") ? "{}" : defaultVal === '""' ? '""' : defaultVal};\n}`;
    case "go":
      return `func ${name}(${p.map((x) => `${x.name} ${TYPE_NAMES.go[x.type]}`).join(", ")}) ${TYPE_NAMES.go[signature.returns]} {\n    // Write your code here\n    return ${defaultVal === "[]" ? "nil" : defaultVal === '""' ? '""' : defaultVal}\n}`;
    case "rust":
      return `fn ${name}(${p.map((x) => `${x.name}: ${TYPE_NAMES.rust[x.type]}`).join(", ")}) -> ${TYPE_NAMES.rust[signature.returns]} {\n    // Write your code here\n    ${signature.returns === "string" ? 'String::new()' : signature.returns.endsWith("[]") ? "vec![]" : defaultVal}\n}`;
    case "csharp":
      return `static class Solution {\n    public static ${TYPE_NAMES.csharp[signature.returns]} ${name}(${p.map((x) => `${TYPE_NAMES.csharp[x.type]} ${x.name}`).join(", ")}) {\n        // Write your code here\n        return ${defaultVal === "[]" ? "null" : defaultVal === '""' ? '""' : defaultVal};\n    }\n}`;
    case "typescript":
      return `function ${name}(${p.map((x) => `${x.name}: ${TYPE_NAMES.typescript[x.type]}`).join(", ")}): ${TYPE_NAMES.typescript[signature.returns]} {\n    // Write your code here\n    return ${defaultVal};\n}`;
  }
}

const CONVERTER: Record<PType, string> = {
  int: "I", double: "D", bool: "B", string: "S",
  "int[]": "IA", "double[]": "DA", "bool[]": "BA", "string[]": "SA",
  "int[][]": "IAA", "double[][]": "DAA",
};

const CSHARP_CONVERTER: Record<PType, string> = {
  ...CONVERTER,
  "int[]": "LA",
  "int[][]": "LAA",
};

export function buildHarness(language: ProblemLanguage, userCode: string, signature: Signature, inputs?: unknown[][]): string {
  const params = signature.params;
  const converter = language === "csharp" ? CSHARP_CONVERTER : CONVERTER;
  const callArgs = (prefix: string) => params.map((x, i) => `${converter[x.type]}(${prefix}[${i}])`).join(", ");

  switch (language) {
    case "python": {
      return `import sys
import json

${userCode}

def _codearena_run():
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        args = json.loads(line)
        result = solve(*args)
        if isinstance(result, float) and result.is_integer():
            result = int(result)
        print(json.dumps(result))

_codearena_run()
`;
    }
    case "java": {
      return `import java.util.*;

${userCode}

class Main {
    private static Object parse(String s, int[] i) {
        char c = s.charAt(i[0]);
        if (c == '[') {
            List<Object> list = new ArrayList<>();
            i[0]++;
            if (i[0] < s.length() && s.charAt(i[0]) == ']') { i[0]++; return list; }
            while (true) {
                list.add(parse(s, i));
                if (i[0] >= s.length()) return list;
                char d = s.charAt(i[0]);
                if (d == ',') { i[0]++; continue; }
                if (d == ']') { i[0]++; return list; }
            }
        }
        if (c == '"') {
            i[0]++;
            StringBuilder sb = new StringBuilder();
            while (i[0] < s.length()) {
                char d = s.charAt(i[0]);
                if (d == '\\\\' && i[0] + 1 < s.length()) {
                    char e = s.charAt(i[0] + 1);
                    sb.append(e == 'n' ? '\\n' : e);
                    i[0] += 2;
                    continue;
                }
                if (d == '"') { i[0]++; return sb.toString(); }
                sb.append(d);
                i[0]++;
            }
            return sb.toString();
        }
        if (c == 't') { i[0] += 4; return Boolean.TRUE; }
        if (c == 'f') { i[0] += 5; return Boolean.FALSE; }
        if (c == 'n') { i[0] += 4; return null; }
        int j = i[0];
        while (j < s.length() && (Character.isDigit(s.charAt(j)) || s.charAt(j) == '-' || s.charAt(j) == '.' || s.charAt(j) == 'e' || s.charAt(j) == 'E' || s.charAt(j) == '+')) j++;
        String num = s.substring(i[0], j);
        i[0] = j;
        return num.indexOf('.') >= 0 || num.indexOf('e') >= 0 || num.indexOf('E') >= 0 ? Double.parseDouble(num) : Long.parseLong(num);
    }
    private static int I(Object o) { return ((Number) o).intValue(); }
    private static double D(Object o) { return ((Number) o).doubleValue(); }
    private static boolean B(Object o) { return (Boolean) o; }
    private static String S(Object o) { return (String) o; }
    private static int[] IA(Object o) { List<?> l = (List<?>) o; int[] r = new int[l.size()]; for (int k = 0; k < l.size(); k++) r[k] = I(l.get(k)); return r; }
    private static double[] DA(Object o) { List<?> l = (List<?>) o; double[] r = new double[l.size()]; for (int k = 0; k < l.size(); k++) r[k] = D(l.get(k)); return r; }
    private static boolean[] BA(Object o) { List<?> l = (List<?>) o; boolean[] r = new boolean[l.size()]; for (int k = 0; k < l.size(); k++) r[k] = B(l.get(k)); return r; }
    private static String[] SA(Object o) { List<?> l = (List<?>) o; return l.toArray(new String[0]); }
    private static int[][] IAA(Object o) { List<?> l = (List<?>) o; int[][] r = new int[l.size()][]; for (int k = 0; k < l.size(); k++) r[k] = IA(l.get(k)); return r; }
    private static double[][] DAA(Object o) { List<?> l = (List<?>) o; double[][] r = new double[l.size()][]; for (int k = 0; k < l.size(); k++) r[k] = DA(l.get(k)); return r; }

    private static String esc(String s) {
        StringBuilder sb = new StringBuilder();
        sb.append('"');
        for (char ch : s.toCharArray()) {
            if (ch == '"') { sb.append('\\\\'); sb.append('"'); }
            else if (ch == '\\\\') { sb.append('\\\\'); sb.append('\\\\'); }
            else if (ch == '\\n') { sb.append('\\\\'); sb.append('n'); }
            else if (ch == '\\r') { sb.append('\\\\'); sb.append('r'); }
            else if (ch == '\\t') { sb.append('\\\\'); sb.append('t'); }
            else sb.append(ch);
        }
        return sb.append('"').toString();
    }
    private static String fmt(double d) { return d == Math.rint(d) ? String.valueOf((long) d) : String.valueOf(d); }
    private static String j(long v) { return String.valueOf(v); }
    private static String j(double v) { return fmt(v); }
    private static String j(boolean v) { return String.valueOf(v); }
    private static String j(String v) { return esc(v); }
    private static String j(int[] v) { StringBuilder sb = new StringBuilder("["); for (int k = 0; k < v.length; k++) { if (k > 0) sb.append(','); sb.append(v[k]); } return sb.append(']').toString(); }
    private static String j(double[] v) { StringBuilder sb = new StringBuilder("["); for (int k = 0; k < v.length; k++) { if (k > 0) sb.append(','); sb.append(fmt(v[k])); } return sb.append(']').toString(); }
    private static String j(boolean[] v) { StringBuilder sb = new StringBuilder("["); for (int k = 0; k < v.length; k++) { if (k > 0) sb.append(','); sb.append(v[k]); } return sb.append(']').toString(); }
    private static String j(String[] v) { StringBuilder sb = new StringBuilder("["); for (int k = 0; k < v.length; k++) { if (k > 0) sb.append(','); sb.append(esc(v[k])); } return sb.append(']').toString(); }
    private static String j(int[][] v) { StringBuilder sb = new StringBuilder("["); for (int k = 0; k < v.length; k++) { if (k > 0) sb.append(','); sb.append(j(v[k])); } return sb.append(']').toString(); }
    private static String j(double[][] v) { StringBuilder sb = new StringBuilder("["); for (int k = 0; k < v.length; k++) { if (k > 0) sb.append(','); sb.append(j(v[k])); } return sb.append(']').toString(); }

    public static void main(String[] args) throws Exception {
        java.io.BufferedReader br = new java.io.BufferedReader(new java.io.InputStreamReader(System.in));
        String line;
        while ((line = br.readLine()) != null) {
            if (line.trim().isEmpty()) continue;
            List<?> root = (List<?>) parse(line, new int[] { 0 });
            Object[] a = root.toArray();
            System.out.println(j(Solution.solve(${callArgs("a")})));
        }
    }
}
`;
    }
    case "cpp": {
      return `#include <bits/stdc++.h>
using namespace std;

${userCode}

struct J { enum K { NUM, STR, BOOL, NUL, ARR } k; double n = 0; string s; bool b = false; vector<J> a; };
J jn(double v) { J x; x.k = J::NUM; x.n = v; return x; }
J js(string v) { J x; x.k = J::STR; x.s = move(v); return x; }
J jb(bool v) { J x; x.k = J::BOOL; x.b = v; return x; }
J jnil() { J x; x.k = J::NUL; return x; }
J parse(const string& s, size_t& i) {
    char c = s[i];
    if (c == '[') { J x; x.k = J::ARR; i++; if (i < s.size() && s[i] == ']') { i++; return x; }
        while (true) { x.a.push_back(parse(s, i)); if (i >= s.size()) return x; char d = s[i]; if (d == ',') { i++; continue; } if (d == ']') { i++; return x; } } }
    if (c == '"') { i++; string out; while (i < s.size()) { char d = s[i]; if (d == '\\\\' && i + 1 < s.size()) { char e = s[i + 1]; out += (e == 'n' ? '\\n' : e); i += 2; continue; } if (d == '"') { i++; return js(out); } out += d; i++; } return js(out); }
    if (c == 't') { i += 4; return jb(true); }
    if (c == 'f') { i += 5; return jb(false); }
    if (c == 'n') { i += 4; return jnil(); }
    size_t j = i;
    while (j < s.size() && (isdigit((unsigned char)s[j]) || s[j] == '-' || s[j] == '.' || s[j] == 'e' || s[j] == 'E' || s[j] == '+')) j++;
    double v = stod(s.substr(i, j - i));
    i = j;
    return jn(v);
}
long long I(const J& v) { return (long long)v.n; }
double D(const J& v) { return v.n; }
bool B(const J& v) { return v.b; }
string S(const J& v) { return v.s; }
vector<long long> IA(const J& v) { vector<long long> r; for (auto& e : v.a) r.push_back(I(e)); return r; }
vector<double> DA(const J& v) { vector<double> r; for (auto& e : v.a) r.push_back(D(e)); return r; }
vector<bool> BA(const J& v) { vector<bool> r; for (auto& e : v.a) r.push_back(B(e)); return r; }
vector<string> SA(const J& v) { vector<string> r; for (auto& e : v.a) r.push_back(S(e)); return r; }
vector<vector<long long>> IAA(const J& v) { vector<vector<long long>> r; for (auto& e : v.a) r.push_back(IA(e)); return r; }
vector<vector<double>> DAA(const J& v) { vector<vector<double>> r; for (auto& e : v.a) r.push_back(DA(e)); return r; }
string esc(const string& s) { string r; r += '"'; for (char c : s) { if (c == '"') { r += '\\\\'; r += '"'; } else if (c == '\\\\') { r += '\\\\'; r += '\\\\'; } else if (c == '\\n') { r += '\\\\'; r += 'n'; } else if (c == '\\r') { r += '\\\\'; r += 'r'; } else if (c == '\\t') { r += '\\\\'; r += 't'; } else r += c; } r += '"'; return r; }
string num(double d) { if (d == (long long)d && abs(d) < 1e15) return to_string((long long)d); string s = to_string(d); while (!s.empty() && s.back() == '0') s.pop_back(); if (!s.empty() && s.back() == '.') s.pop_back(); return s; }
string j(long long v) { return to_string(v); }
string j(double v) { return num(v); }
string j(bool v) { return v ? "true" : "false"; }
string j(const string& v) { return esc(v); }
string j(const vector<long long>& v) { string r = "["; for (size_t k = 0; k < v.size(); k++) { if (k) r += ","; r += j(v[k]); } return r + "]"; }
string j(const vector<double>& v) { string r = "["; for (size_t k = 0; k < v.size(); k++) { if (k) r += ","; r += j(v[k]); } return r + "]"; }
string j(const vector<bool>& v) { string r = "["; for (size_t k = 0; k < v.size(); k++) { if (k) r += ","; r += j(v[k]); } return r + "]"; }
string j(const vector<string>& v) { string r = "["; for (size_t k = 0; k < v.size(); k++) { if (k) r += ","; r += j(v[k]); } return r + "]"; }
string j(const vector<vector<long long>>& v) { string r = "["; for (size_t k = 0; k < v.size(); k++) { if (k) r += ","; r += j(v[k]); } return r + "]"; }
string j(const vector<vector<double>>& v) { string r = "["; for (size_t k = 0; k < v.size(); k++) { if (k) r += ","; r += j(v[k]); } return r + "]"; }
int main() {
    string line;
    while (getline(cin, line)) {
        if (line.empty()) continue;
        size_t i = 0;
        J root = parse(line, i);
        auto r = solve(${callArgs("root.a")});
        cout << j(r) << endl;
    }
}
`;
    }
    case "go": {
      return `package main

import (
    "bufio"
    "encoding/json"
    "fmt"
    "os"
    "strings"
)

${userCode}

func I(v any) int { return int(v.(float64)) }
func D(v any) float64 { return v.(float64) }
func B(v any) bool { return v.(bool) }
func S(v any) string { return v.(string) }
func IA(v any) []int { a := v.([]any); r := make([]int, len(a)); for i, e := range a { r[i] = I(e) }; return r }
func DA(v any) []float64 { a := v.([]any); r := make([]float64, len(a)); for i, e := range a { r[i] = D(e) }; return r }
func BA(v any) []bool { a := v.([]any); r := make([]bool, len(a)); for i, e := range a { r[i] = B(e) }; return r }
func SA(v any) []string { a := v.([]any); r := make([]string, len(a)); for i, e := range a { r[i] = S(e) }; return r }
func IAA(v any) [][]int { a := v.([]any); r := make([][]int, len(a)); for i, e := range a { r[i] = IA(e) }; return r }
func DAA(v any) [][]float64 { a := v.([]any); r := make([][]float64, len(a)); for i, e := range a { r[i] = DA(e) }; return r }

func main() {
    sc := bufio.NewScanner(os.Stdin)
    sc.Buffer(make([]byte, 1024*1024), 1024*1024)
    for sc.Scan() {
        line := strings.TrimSpace(sc.Text())
        if line == "" { continue }
        var args []any
        if json.Unmarshal([]byte(line), &args) != nil { continue }
        r := solve(${callArgs("args")})
        b, _ := json.Marshal(r)
        fmt.Println(string(b))
    }
}
`;
    }
    case "rust": {
      const ret = signature.returns;
      const rustArgs = params.map((x, i) => `${converter[x.type]}(&a[${i}])`).join(", ");
      const serialize =
        ret === "int" ? "jI(r)" :
        ret === "double" ? "jD(r)" :
        ret === "bool" ? "jB(r)" :
        ret === "string" ? "jS(&r)" :
        ret === "int[]" ? "jIA(&r)" :
        ret === "double[]" ? "jDA(&r)" :
        ret === "bool[]" ? "jBA(&r)" :
        ret === "string[]" ? "jSA(&r)" :
        ret === "int[][]" ? "jIAA(&r)" : "jDAA(&r)";
      return `#![allow(dead_code)]
use std::io::{self, BufRead};

${userCode}

#[derive(Clone)]
enum Jv { Num(f64), Str(String), Bool(bool), Nul, Arr(Vec<Jv>) }

struct P { s: Vec<u8>, i: usize }
impl P {
    fn peek(&self) -> u8 { *self.s.get(self.i).unwrap_or(&0) }
    fn parse(&mut self) -> Jv {
        let c = self.peek();
        if c == b'[' {
            self.i += 1;
            let mut a = Vec::new();
            if self.peek() == b']' { self.i += 1; return Jv::Arr(a); }
            loop {
                a.push(self.parse());
                match self.peek() {
                    b',' => { self.i += 1; }
                    b']' => { self.i += 1; break; }
                    _ => break,
                }
            }
            return Jv::Arr(a);
        }
        if c == b'"' {
            self.i += 1;
            let mut out = String::new();
            loop {
                if self.i >= self.s.len() { break; }
                let d = self.s[self.i];
                self.i += 1;
                if d == b'"' { break; }
                if d == b'\\\\' {
                    if self.i < self.s.len() {
                        let e = self.s[self.i];
                        self.i += 1;
                        out.push(if e == b'n' { '\\n' } else { e as char });
                    }
                } else {
                    out.push(d as char);
                }
            }
            return Jv::Str(out);
        }
        if c == b't' { self.i += 4; return Jv::Bool(true); }
        if c == b'f' { self.i += 5; return Jv::Bool(false); }
        if c == b'n' { self.i += 4; return Jv::Nul; }
        let start = self.i;
        while self.i < self.s.len() && (self.s[self.i].is_ascii_digit() || self.s[self.i] == b'-' || self.s[self.i] == b'.' || self.s[self.i] == b'e' || self.s[self.i] == b'E' || self.s[self.i] == b'+') {
            self.i += 1;
        }
        let v: f64 = std::str::from_utf8(&self.s[start..self.i]).unwrap_or_default().parse().unwrap_or(0.0);
        Jv::Num(v)
    }
}

fn I(v: &Jv) -> i64 { if let Jv::Num(n) = v { *n as i64 } else { 0 } }
fn D(v: &Jv) -> f64 { if let Jv::Num(n) = v { *n } else { 0.0 } }
fn B(v: &Jv) -> bool { if let Jv::Bool(b) = v { *b } else { false } }
fn S(v: &Jv) -> String { if let Jv::Str(s) = v { s.clone() } else { String::new() } }
fn IA(v: &Jv) -> Vec<i64> { if let Jv::Arr(a) = v { a.iter().map(I).collect() } else { Vec::new() } }
fn DA(v: &Jv) -> Vec<f64> { if let Jv::Arr(a) = v { a.iter().map(D).collect() } else { Vec::new() } }
fn BA(v: &Jv) -> Vec<bool> { if let Jv::Arr(a) = v { a.iter().map(B).collect() } else { Vec::new() } }
fn SA(v: &Jv) -> Vec<String> { if let Jv::Arr(a) = v { a.iter().map(S).collect() } else { Vec::new() } }
fn IAA(v: &Jv) -> Vec<Vec<i64>> { if let Jv::Arr(a) = v { a.iter().map(IA).collect() } else { Vec::new() } }
fn DAA(v: &Jv) -> Vec<Vec<f64>> { if let Jv::Arr(a) = v { a.iter().map(DA).collect() } else { Vec::new() } }

fn esc(s: &str) -> String {
    let mut r = String::from("\\"");
    for c in s.chars() {
        match c {
            '"' => { r.push('\\\\'); r.push('"'); }
            '\\\\' => { r.push('\\\\'); r.push('\\\\'); }
            '\\n' => { r.push('\\\\'); r.push('n'); }
            '\\r' => { r.push('\\\\'); r.push('r'); }
            '\\t' => { r.push('\\\\'); r.push('t'); }
            _ => r.push(c),
        }
    }
    r.push('"');
    r
}
fn num(n: f64) -> String { if n.fract() == 0.0 && n.abs() < 1e15 { (n as i64).to_string() } else { n.to_string() } }
fn jI(v: i64) -> String { v.to_string() }
fn jD(v: f64) -> String { num(v) }
fn jB(v: bool) -> String { if v { "true".to_string() } else { "false".to_string() } }
fn jS(v: &String) -> String { esc(v) }
fn jIA(v: &Vec<i64>) -> String { let mut r = String::from("["); for (k, e) in v.iter().enumerate() { if k > 0 { r.push(',') } r.push_str(&jI(*e)) } r.push(']'); r }
fn jDA(v: &Vec<f64>) -> String { let mut r = String::from("["); for (k, e) in v.iter().enumerate() { if k > 0 { r.push(',') } r.push_str(&num(*e)) } r.push(']'); r }
fn jBA(v: &Vec<bool>) -> String { let mut r = String::from("["); for (k, e) in v.iter().enumerate() { if k > 0 { r.push(',') } r.push_str(&jB(*e)) } r.push(']'); r }
fn jSA(v: &Vec<String>) -> String { let mut r = String::from("["); for (k, e) in v.iter().enumerate() { if k > 0 { r.push(',') } r.push_str(&esc(e)) } r.push(']'); r }
fn jIAA(v: &Vec<Vec<i64>>) -> String { let mut r = String::from("["); for (k, e) in v.iter().enumerate() { if k > 0 { r.push(',') } r.push_str(&jIA(e)) } r.push(']'); r }
fn jDAA(v: &Vec<Vec<f64>>) -> String { let mut r = String::from("["); for (k, e) in v.iter().enumerate() { if k > 0 { r.push(',') } r.push_str(&jDA(e)) } r.push(']'); r }

fn main() {
    let stdin = io::stdin();
    for line in stdin.lock().lines() {
        let line = line.unwrap_or_default();
        let line = line.trim();
        if line.is_empty() { continue; }
        let mut p = P { s: line.as_bytes().to_vec(), i: 0 };
        let root = p.parse();
        if let Jv::Arr(a) = &root {
            let r = solve(${rustArgs});
            println!("{}", ${serialize});
        }
    }
}
`;
    }
    case "csharp": {
      return `using System;
using System.Collections.Generic;

${userCode}

class P {
    static object Parse(string s, ref int i) {
        char c = s[i];
        if (c == '[') {
            i++;
            var list = new List<object>();
            if (i < s.Length && s[i] == ']') { i++; return list; }
            while (true) {
                list.Add(Parse(s, ref i));
                if (i >= s.Length) return list;
                char d = s[i];
                if (d == ',') { i++; continue; }
                if (d == ']') { i++; return list; }
            }
        }
        if (c == '"') {
            i++;
            var sb = new System.Text.StringBuilder();
            while (i < s.Length) {
                char d = s[i];
                if (d == '\\\\' && i + 1 < s.Length) {
                    char e = s[i + 1];
                    sb.Append(e == 'n' ? '\\n' : e);
                    i += 2;
                    continue;
                }
                if (d == '"') { i++; return sb.ToString(); }
                sb.Append(d);
                i++;
            }
            return sb.ToString();
        }
        if (c == 't') { i += 4; return true; }
        if (c == 'f') { i += 5; return false; }
        if (c == 'n') { i += 4; return null; }
        int j = i;
        while (j < s.Length && (char.IsDigit(s[j]) || s[j] == '-' || s[j] == '.' || s[j] == 'e' || s[j] == 'E' || s[j] == '+')) j++;
        string num = s.Substring(i, j - i);
        i = j;
        return num.IndexOf('.') >= 0 || num.IndexOf('e') >= 0 || num.IndexOf('E') >= 0 ? double.Parse(num) : long.Parse(num);
    }
    static int I(object o) { return Convert.ToInt32(o); }
    static long L(object o) { return Convert.ToInt64(o); }
    static double D(object o) { return Convert.ToDouble(o); }
    static bool B(object o) { return (bool)o; }
    static string S(object o) { return (string)o; }
    static long[] LA(object o) { var l = (List<object>)o; var r = new long[l.Count]; for (int k = 0; k < l.Count; k++) r[k] = L(l[k]); return r; }
    static int[] IA(object o) { var l = (List<object>)o; var r = new int[l.Count]; for (int k = 0; k < l.Count; k++) r[k] = I(l[k]); return r; }
    static double[] DA(object o) { var l = (List<object>)o; var r = new double[l.Count]; for (int k = 0; k < l.Count; k++) r[k] = D(l[k]); return r; }
    static bool[] BA(object o) { var l = (List<object>)o; var r = new bool[l.Count]; for (int k = 0; k < l.Count; k++) r[k] = B(l[k]); return r; }
    static string[] SA(object o) { return ((List<object>)o).ConvertAll(x => (string)x).ToArray(); }
    static long[][] LAA(object o) { var l = (List<object>)o; var r = new long[l.Count][]; for (int k = 0; k < l.Count; k++) r[k] = LA(l[k]); return r; }
    static int[][] IAA(object o) { var l = (List<object>)o; var r = new int[l.Count][]; for (int k = 0; k < l.Count; k++) r[k] = IA(l[k]); return r; }
    static double[][] DAA(object o) { var l = (List<object>)o; var r = new double[l.Count][]; for (int k = 0; k < l.Count; k++) r[k] = DA(l[k]); return r; }

    static string Esc(string s) {
        var sb = new System.Text.StringBuilder();
        sb.Append('"');
        foreach (char c in s) {
            if (c == '"') { sb.Append('\\\\'); sb.Append('"'); }
            else if (c == '\\\\') { sb.Append('\\\\'); sb.Append('\\\\'); }
            else if (c == '\\n') { sb.Append('\\\\'); sb.Append('n'); }
            else if (c == '\\r') { sb.Append('\\\\'); sb.Append('r'); }
            else if (c == '\\t') { sb.Append('\\\\'); sb.Append('t'); }
            else sb.Append(c);
        }
        sb.Append('"');
        return sb.ToString();
    }
    static string Num(double d) { return d == Math.Floor(d) ? ((long)d).ToString() : d.ToString(); }
    static string E(long v) { return v.ToString(); }
    static string E(double v) { return Num(v); }
    static string E(bool v) { return v ? "true" : "false"; }
    static string E(string v) { return Esc(v); }
    static string E(long[] v) { var sb = new System.Text.StringBuilder("["); for (int k = 0; k < v.Length; k++) { if (k > 0) sb.Append(','); sb.Append(v[k]); } return sb.Append(']').ToString(); }
    static string E(int[] v) { var sb = new System.Text.StringBuilder("["); for (int k = 0; k < v.Length; k++) { if (k > 0) sb.Append(','); sb.Append(v[k]); } return sb.Append(']').ToString(); }
    static string E(double[] v) { var sb = new System.Text.StringBuilder("["); for (int k = 0; k < v.Length; k++) { if (k > 0) sb.Append(','); sb.Append(Num(v[k])); } return sb.Append(']').ToString(); }
    static string E(bool[] v) { var sb = new System.Text.StringBuilder("["); for (int k = 0; k < v.Length; k++) { if (k > 0) sb.Append(','); sb.Append(v[k]); } return sb.Append(']').ToString(); }
    static string E(string[] v) { var sb = new System.Text.StringBuilder("["); for (int k = 0; k < v.Length; k++) { if (k > 0) sb.Append(','); sb.Append(Esc(v[k])); } return sb.Append(']').ToString(); }
    static string E(long[][] v) { var sb = new System.Text.StringBuilder("["); for (int k = 0; k < v.Length; k++) { if (k > 0) sb.Append(','); sb.Append(E(v[k])); } return sb.Append(']').ToString(); }
    static string E(int[][] v) { var sb = new System.Text.StringBuilder("["); for (int k = 0; k < v.Length; k++) { if (k > 0) sb.Append(','); sb.Append(E(v[k])); } return sb.Append(']').ToString(); }
    static string E(double[][] v) { var sb = new System.Text.StringBuilder("["); for (int k = 0; k < v.Length; k++) { if (k > 0) sb.Append(','); sb.Append(E(v[k])); } return sb.Append(']').ToString(); }

    public static void Main() {
        string line;
        while ((line = Console.ReadLine()) != null) {
            line = line.Trim();
            if (line.Length == 0) continue;
            int idx = 0;
            var root = (List<object>)Parse(line, ref idx);
            object[] a = root.ToArray();
            Console.WriteLine(E(Solution.solve(${callArgs("a")})));
        }
    }
}
`;
    }
    case "typescript": {
      const tuple = `[${params.map((x) => TYPE_NAMES.typescript[x.type]).join(", ")}]`;
      const inputFeed =
        inputs !== undefined
          ? `const __inputs = ${JSON.stringify(inputs)} as ${tuple}[];
for (const t of __inputs) {
    const args = t;`
          : `const __lines = fs.readFileSync(0, "utf8").split("\\n");
for (const __line of __lines) {
    const t = __line.trim();
    if (!t) continue;
    const args = JSON.parse(t) as ${tuple};`;
      return `declare const process: any;
declare const require: any;

const fs = require("fs");

${userCode}

${inputFeed}
    const r: ${TYPE_NAMES.typescript[signature.returns]} = solve(...args);
    console.log(JSON.stringify(r));
}
`;
    }
    default:
      throw new Error(`buildHarness: unsupported language "${language}"`);
  }
}

const EPS = 1e-9;

export function compareJson(actual: string, expected: string): boolean {
  let a: unknown, b: unknown;
  try {
    a = JSON.parse(actual);
    b = JSON.parse(expected);
  } catch {
    return actual.trim() === expected.trim();
  }
  return deepEqual(a, b);
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (typeof a === "number" && typeof b === "number") {
    return Math.abs(a - b) <= EPS * Math.max(1, Math.abs(a), Math.abs(b));
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  return JSON.stringify(a) === JSON.stringify(b);
}
