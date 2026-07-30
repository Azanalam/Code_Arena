import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const problems = [
  {
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "easy",
    category: "javascript",
    description: `<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.</p><p>You may assume that each input would have exactly one solution, and you may not use the same element twice.</p><p>You can return the answer in any order.</p>`,
    examples: JSON.stringify([
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
      { input: "nums = [3,3], target = 6", output: "[0,1]" },
    ]),
    testCases: JSON.stringify([
      { input: "[[2,7,11,15],9]", expected: "[0,1]" },
      { input: "[[3,2,4],6]", expected: "[1,2]" },
      { input: "[[3,3],6]", expected: "[0,1]" },
      { input: "[[1,2,3,4,5],10]", expected: "[3,4]" },
    ]),
    starterCode: `function main(nums, target) {\n  // Your code here\n}`,
  },
  {
    title: "Reverse String",
    slug: "reverse-string",
    difficulty: "easy",
    category: "javascript",
    description: `<p>Write a function that reverses a string. The input string is given as an array of characters <code>s</code>.</p><p>You must do this by modifying the input array <strong>in-place</strong> with O(1) extra memory.</p>`,
    examples: JSON.stringify([
      { input: `s = ["h","e","l","l","o"]`, output: `["o","l","l","e","h"]` },
      { input: `s = ["H","a","n","n","a","h"]`, output: `["h","a","n","n","a","H"]` },
    ]),
    testCases: JSON.stringify([
      { input: `[["h","e","l","l","o"]]`, expected: `["o","l","l","e","h"]` },
      { input: `[["H","a","n","n","a","h"]]`, expected: `["h","a","n","n","a","H"]` },
    ]),
    starterCode: `function main(s) {\n  // Your code here\n  return s;\n}`,
  },
  {
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    difficulty: "easy",
    category: "javascript",
    description: `<p>Given a string <code>s</code> containing just the characters <code>'('</code>, <code>')'</code>, <code>'{'</code>, <code>'}'</code>, <code>'['</code> and <code>']'</code>, determine if the input string is valid.</p><p>An input string is valid if:</p><ol><li>Open brackets must be closed by the same type of brackets.</li><li>Open brackets must be closed in the correct order.</li><li>Every close bracket has a corresponding open bracket of the same type.</li></ol>`,
    examples: JSON.stringify([
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" },
      { input: 's = "([)]"', output: "false" },
    ]),
    testCases: JSON.stringify([
      { input: `["()"]`, expected: "true" },
      { input: `["()[]{}"]`, expected: "true" },
      { input: `["(]"]`, expected: "false" },
      { input: `["([)]"]`, expected: "false" },
      { input: `["{[]}"]`, expected: "true" },
    ]),
    starterCode: `function main(s) {\n  // Your code here\n}`,
  },
  {
    title: "Fizz Buzz",
    slug: "fizz-buzz",
    difficulty: "easy",
    category: "javascript",
    description: `<p>Given an integer <code>n</code>, return a string array <code>answer</code> (1-indexed) where:</p><ul><li><code>answer[i] == "FizzBuzz"</code> if i is divisible by 3 and 5.</li><li><code>answer[i] == "Fizz"</code> if i is divisible by 3.</li><li><code>answer[i] == "Buzz"</code> if i is divisible by 5.</li><li><code>answer[i] == i</code> (as a string) otherwise.</li></ul>`,
    examples: JSON.stringify([
      { input: "n = 3", output: `["1","2","Fizz"]` },
      { input: "n = 5", output: `["1","2","Fizz","4","Buzz"]` },
      { input: "n = 15", output: `["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]` },
    ]),
    testCases: JSON.stringify([
      { input: "[3]", expected: `["1","2","Fizz"]` },
      { input: "[5]", expected: `["1","2","Fizz","4","Buzz"]` },
      { input: "[15]", expected: `["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]` },
    ]),
    starterCode: `function main(n) {\n  // Your code here\n}`,
  },
  {
    title: "Palindrome Number",
    slug: "palindrome-number",
    difficulty: "easy",
    category: "javascript",
    description: `<p>Given an integer <code>x</code>, return <code>true</code> if <code>x</code> is a palindrome, and <code>false</code> otherwise.</p>`,
    examples: JSON.stringify([
      { input: "x = 121", output: "true", explanation: "121 reads as 121 from left to right and from right to left." },
      { input: "x = -121", output: "false", explanation: "From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome." },
      { input: "x = 10", output: "false" },
    ]),
    testCases: JSON.stringify([
      { input: "[121]", expected: "true" },
      { input: "[-121]", expected: "false" },
      { input: "[10]", expected: "false" },
      { input: "[0]", expected: "true" },
    ]),
    starterCode: `function main(x) {\n  // Your code here\n}`,
  },
  {
    title: "Longest Common Prefix",
    slug: "longest-common-prefix",
    difficulty: "medium",
    category: "javascript",
    description: `<p>Write a function to find the longest common prefix string amongst an array of strings.</p><p>If there is no common prefix, return an empty string <code>""</code>.</p>`,
    examples: JSON.stringify([
      { input: 'strs = ["flower","flow","flight"]', output: '"fl"' },
      { input: 'strs = ["dog","racecar","car"]', output: '""', explanation: "There is no common prefix among the input strings." },
    ]),
    testCases: JSON.stringify([
      { input: `[["flower","flow","flight"]]`, expected: `"fl"` },
      { input: `[["dog","racecar","car"]]`, expected: `""` },
      { input: `[["a"]]`, expected: `"a"` },
      { input: `[["","b"]]`, expected: `""` },
    ]),
    starterCode: `function main(strs) {\n  // Your code here\n}`,
  },
  {
    title: "Contains Duplicate",
    slug: "contains-duplicate",
    difficulty: "easy",
    category: "javascript",
    description: `<p>Given an integer array <code>nums</code>, return <code>true</code> if any value appears at least twice in the array, and return <code>false</code> if every element is distinct.</p>`,
    examples: JSON.stringify([
      { input: "nums = [1,2,3,1]", output: "true" },
      { input: "nums = [1,2,3,4]", output: "false" },
      { input: "nums = [1,1,1,3,3,4,3,2,4,2]", output: "true" },
    ]),
    testCases: JSON.stringify([
      { input: "[[1,2,3,1]]", expected: "true" },
      { input: "[[1,2,3,4]]", expected: "false" },
      { input: "[[1,1,1,3,3,4,3,2,4,2]]", expected: "true" },
    ]),
    starterCode: `function main(nums) {\n  // Your code here\n}`,
  },
  {
    title: "Roman to Integer",
    slug: "roman-to-integer",
    difficulty: "easy",
    category: "javascript",
    description: `<p>Roman numerals are represented by seven different symbols: <code>I, V, X, L, C, D, M</code>.</p><p>Given a roman numeral, convert it to an integer.</p>`,
    examples: JSON.stringify([
      { input: 's = "III"', output: "3" },
      { input: 's = "LVIII"', output: "58", explanation: "L = 50, V = 5, III = 3." },
      { input: 's = "MCMXCIV"', output: "1994", explanation: "M = 1000, CM = 900, XC = 90, IV = 4." },
    ]),
    testCases: JSON.stringify([
      { input: `["III"]`, expected: "3" },
      { input: `["LVIII"]`, expected: "58" },
      { input: `["MCMXCIV"]`, expected: "1994" },
      { input: `["IV"]`, expected: "4" },
    ]),
    starterCode: `function main(s) {\n  // Your code here\n}`,
  },
  {
    title: "Merge Two Sorted Lists",
    slug: "merge-two-sorted-lists",
    difficulty: "medium",
    category: "javascript",
    description: `<p>You are given the heads of two sorted linked lists <code>list1</code> and <code>list2</code>.</p><p>Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.</p><p>Return the head of the merged linked list.</p>`,
    examples: JSON.stringify([
      { input: "list1 = [1,2,4], list2 = [1,3,4]", output: "[1,1,2,3,4,4]" },
      { input: "list1 = [], list2 = []", output: "[]" },
      { input: "list1 = [], list2 = [0]", output: "[0]" },
    ]),
    testCases: JSON.stringify([
      { input: "[[1,2,4],[1,3,4]]", expected: "[1,1,2,3,4,4]" },
      { input: "[[],[]]", expected: "[]" },
      { input: "[[],[0]]", expected: "[0]" },
    ]),
    starterCode: `function main(list1, list2) {\n  // Your code here\n  // Merge two sorted arrays (linked list simulation)\n  const merged = [];\n  let i = 0, j = 0;\n  while (i < list1.length && j < list2.length) {\n    if (list1[i] <= list2[j]) merged.push(list1[i++]);\n    else merged.push(list2[j++]);\n  }\n  return [...merged, ...list1.slice(i), ...list2.slice(j)];\n}`,
  },
  {
    title: "Maximum Subarray",
    slug: "maximum-subarray",
    difficulty: "medium",
    category: "javascript",
    description: `<p>Given an integer array <code>nums</code>, find the subarray with the largest sum, and return its sum.</p>`,
    examples: JSON.stringify([
      { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "The subarray [4,-1,2,1] has the largest sum 6." },
      { input: "nums = [1]", output: "1" },
      { input: "nums = [5,4,-1,7,8]", output: "23" },
    ]),
    testCases: JSON.stringify([
      { input: "[[-2,1,-3,4,-1,2,1,-5,4]]", expected: "6" },
      { input: "[[1]]", expected: "1" },
      { input: "[[5,4,-1,7,8]]", expected: "23" },
      { input: "[[-1]]", expected: "-1" },
    ]),
    starterCode: `function main(nums) {\n  // Your code here\n}`,
  },
  {
    title: "HTML Paragraph Builder",
    slug: "html-paragraph-builder",
    difficulty: "easy",
    category: "html",
    description: `<p>Write a function that takes a string <code>text</code> and returns an HTML paragraph element containing that text wrapped in <code>&lt;p&gt;</code> tags.</p>`,
    examples: JSON.stringify([
      { input: 'text = "Hello World"', output: "<p>Hello World</p>" },
      { input: 'text = "CodeArena"', output: "<p>CodeArena</p>" },
    ]),
    testCases: JSON.stringify([
      { input: `["Hello World"]`, expected: `"<p>Hello World</p>"` },
      { input: `["CodeArena"]`, expected: `"<p>CodeArena</p>"` },
      { input: `[""]`, expected: `"<p></p>"` },
    ]),
    starterCode: `function main(text) {\n  // Return text wrapped in <p> tags\n}`,
  },
  {
    title: "HTML Unordered List",
    slug: "html-unordered-list",
    difficulty: "easy",
    category: "html",
    description: `<p>Write a function that takes an array of strings <code>items</code> and returns an HTML unordered list (<code>&lt;ul&gt;</code>) with each item inside an <code>&lt;li&gt;</code> element.</p>`,
    examples: JSON.stringify([
      { input: 'items = ["Apples", "Bananas"]', output: "<ul><li>Apples</li><li>Bananas</li></ul>" },
      { input: 'items = ["HTML", "CSS", "JS"]', output: "<ul><li>HTML</li><li>CSS</li><li>JS</li></ul>" },
    ]),
    testCases: JSON.stringify([
      { input: `[["Apples","Bananas"]]`, expected: `"<ul><li>Apples</li><li>Bananas</li></ul>"` },
      { input: `[["HTML","CSS"]]`, expected: `"<ul><li>HTML</li><li>CSS</li></ul>"` },
      { input: `[["Only"]]`, expected: `"<ul><li>Only</li></ul>"` },
    ]),
    starterCode: `function main(items) {\n  // Return items as an HTML unordered list\n}`,
  },
  {
    title: "CSS Button Style",
    slug: "css-button-style",
    difficulty: "easy",
    category: "css",
    description: `<p>Write a function that returns a CSS rule string for styling a button with class <code>.btn</code>.</p><p>The CSS must include:</p><ul><li>Blue background: <code>#007bff</code></li><li>White text: <code>white</code></li><li>No border: <code>none</code></li><li>Rounded corners: <code>4px</code></li><li>Padding: <code>10px 20px</code></li></ul>`,
    examples: JSON.stringify([
      { input: "no input", output: '.btn { background-color: #007bff; color: white; border: none; border-radius: 4px; padding: 10px 20px; }' },
    ]),
    testCases: JSON.stringify([
      { input: `[]`, expected: `".btn { background-color: #007bff; color: white; border: none; border-radius: 4px; padding: 10px 20px; }"` },
    ]),
    starterCode: `function main() {\n  // Return a CSS rule string for .btn\n}`,
  },
  {
    title: "CSS Card Component",
    slug: "css-card-component",
    difficulty: "medium",
    category: "css",
    description: `<p>Write a function that returns a CSS rule string for styling a card component with class <code>.card</code>.</p><p>The CSS must include:</p><ul><li>Light gray border: <code>1px solid #e0e0e0</code></li><li>Rounded corners: <code>8px</code></li><li>Padding: <code>20px</code></li><li>Box shadow: <code>0 2px 8px rgba(0,0,0,0.1)</code></li></ul>`,
    examples: JSON.stringify([
      { input: "no input", output: '.card { border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }' },
    ]),
    testCases: JSON.stringify([
      { input: `[]`, expected: `".card { border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }"` },
    ]),
    starterCode: `function main() {\n  // Return a CSS rule string for .card\n}`,
  },
];

async function main() {
  console.log("Seeding problems...");

  for (const problem of problems) {
    await prisma.problem.upsert({
      where: { slug: problem.slug },
      update: problem,
      create: problem,
    });
    console.log(`  ✓ ${problem.title}`);
  }

  console.log(`\nSeeded ${problems.length} problems.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
