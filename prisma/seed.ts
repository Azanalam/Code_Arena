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
    title: "HTML Paragraph",
    slug: "html-paragraph-builder",
    difficulty: "easy",
    category: "html",
    description: `<p>Write raw HTML markup that creates a paragraph element containing the text <code>Hello World</code>. Type the markup directly — no JavaScript function needed.</p>`,
    examples: JSON.stringify([
      { input: "no input", output: "<p>Hello World</p>" },
    ]),
    testCases: JSON.stringify([
      { input: "[]", expected: "<p>" },
      { input: "[]", expected: "Hello World" },
      { input: "[]", expected: "</p>" },
    ]),
    starterCode: `<p></p>`,
  },
  {
    title: "HTML Unordered List",
    slug: "html-unordered-list",
    difficulty: "easy",
    category: "html",
    description: `<p>Write raw HTML markup that creates an unordered list with the items <code>Apples</code>, <code>Bananas</code>, and <code>Cherries</code>. Type the markup directly.</p>`,
    examples: JSON.stringify([
      { input: "no input", output: "<ul><li>Apples</li><li>Bananas</li><li>Cherries</li></ul>" },
    ]),
    testCases: JSON.stringify([
      { input: "[]", expected: "<ul>" },
      { input: "[]", expected: "<li>Apples</li>" },
      { input: "[]", expected: "<li>Bananas</li>" },
      { input: "[]", expected: "<li>Cherries</li>" },
      { input: "[]", expected: "</ul>" },
    ]),
    starterCode: `<ul></ul>`,
  },
  {
    title: "HTML Heading",
    slug: "html-heading",
    difficulty: "easy",
    category: "html",
    description: `<p>Write raw HTML markup for a level-1 heading with the text <code>CodeArena</code>.</p>`,
    examples: JSON.stringify([
      { input: "no input", output: "<h1>CodeArena</h1>" },
    ]),
    testCases: JSON.stringify([
      { input: "[]", expected: "<h1>" },
      { input: "[]", expected: "CodeArena" },
      { input: "[]", expected: "</h1>" },
    ]),
    starterCode: `<h1></h1>`,
  },
  {
    title: "HTML Anchor Link",
    slug: "html-anchor-link",
    difficulty: "easy",
    category: "html",
    description: `<p>Write raw HTML markup for an anchor tag linking to <code>https://example.com</code> with the display text <code>Visit Example</code>.</p>`,
    examples: JSON.stringify([
      { input: "no input", output: `<a href="https://example.com">Visit Example</a>` },
    ]),
    testCases: JSON.stringify([
      { input: "[]", expected: "<a" },
      { input: "[]", expected: 'href="https://example.com"' },
      { input: "[]", expected: "Visit Example" },
      { input: "[]", expected: "</a>" },
    ]),
    starterCode: `<a></a>`,
  },
  {
    title: "HTML Image Tag",
    slug: "html-image-tag",
    difficulty: "easy",
    category: "html",
    description: `<p>Write raw HTML markup for an image tag with source <code>logo.png</code> and alt text <code>Logo</code>.</p>`,
    examples: JSON.stringify([
      { input: "no input", output: `<img src="logo.png" alt="Logo">` },
    ]),
    testCases: JSON.stringify([
      { input: "[]", expected: "<img" },
      { input: "[]", expected: 'src="logo.png"' },
      { input: "[]", expected: 'alt="Logo"' },
    ]),
    starterCode: `<img>`,
  },
  {
    title: "HTML Ordered List",
    slug: "html-ordered-list",
    difficulty: "easy",
    category: "html",
    description: `<p>Write raw HTML markup for an ordered list with the items <code>First</code> and <code>Second</code>.</p>`,
    examples: JSON.stringify([
      { input: "no input", output: "<ol><li>First</li><li>Second</li></ol>" },
    ]),
    testCases: JSON.stringify([
      { input: "[]", expected: "<ol>" },
      { input: "[]", expected: "<li>First</li>" },
      { input: "[]", expected: "<li>Second</li>" },
      { input: "[]", expected: "</ol>" },
    ]),
    starterCode: `<ol></ol>`,
  },
  {
    title: "HTML Navigation Bar",
    slug: "html-nav-bar",
    difficulty: "medium",
    category: "html",
    description: `<p>Write raw HTML markup for a navigation bar containing a list with two links: <code>Home</code> (to <code>#home</code>) and <code>About</code> (to <code>#about</code>).</p>`,
    examples: JSON.stringify([
      { input: "no input", output: `<nav><ul><li><a href="#home">Home</a></li><li><a href="#about">About</a></li></ul></nav>` },
    ]),
    testCases: JSON.stringify([
      { input: "[]", expected: "<nav>" },
      { input: "[]", expected: 'href="#home"' },
      { input: "[]", expected: "Home" },
      { input: "[]", expected: 'href="#about"' },
      { input: "[]", expected: "About" },
      { input: "[]", expected: "</nav>" },
    ]),
    starterCode: `<nav></nav>`,
  },
  {
    title: "HTML Form Input",
    slug: "html-form-input",
    difficulty: "medium",
    category: "html",
    description: `<p>Write raw HTML markup for a text input field inside a form. The input must have <code>type="text"</code>, a <code>name</code> of <code>username</code>, and a placeholder of <code>Enter name</code>.</p>`,
    examples: JSON.stringify([
      { input: "no input", output: `<form><input type="text" name="username" placeholder="Enter name"></form>` },
    ]),
    testCases: JSON.stringify([
      { input: "[]", expected: "<form>" },
      { input: "[]", expected: "type=\"text\"" },
      { input: "[]", expected: "name=\"username\"" },
      { input: "[]", expected: "Enter name" },
      { input: "[]", expected: "</form>" },
    ]),
    starterCode: `<form></form>`,
  },
  {
    title: "CSS Button Style",
    slug: "css-button-style",
    difficulty: "easy",
    category: "css",
    description: `<p>Write a raw CSS rule for a button with class <code>.btn</code>.</p><p>The CSS must include:</p><ul><li>Blue background: <code>#007bff</code></li><li>White text: <code>white</code></li><li>No border: <code>none</code></li><li>Rounded corners: <code>4px</code></li><li>Padding: <code>10px 20px</code></li></ul>`,
    examples: JSON.stringify([
      { input: "no input", output: '.btn { background-color: #007bff; color: white; border: none; border-radius: 4px; padding: 10px 20px; }' },
    ]),
    testCases: JSON.stringify([
      { input: "[]", expected: ".btn" },
      { input: "[]", expected: "background-color: #007bff" },
      { input: "[]", expected: "color: white" },
      { input: "[]", expected: "border: none" },
      { input: "[]", expected: "border-radius: 4px" },
      { input: "[]", expected: "padding: 10px 20px" },
    ]),
    starterCode: `.btn {\n\n}`,
  },
  {
    title: "CSS Card Component",
    slug: "css-card-component",
    difficulty: "medium",
    category: "css",
    description: `<p>Write a raw CSS rule for a card component with class <code>.card</code>.</p><p>The CSS must include:</p><ul><li>Light gray border: <code>1px solid #e0e0e0</code></li><li>Rounded corners: <code>8px</code></li><li>Padding: <code>20px</code></li><li>Box shadow: <code>0 2px 8px rgba(0,0,0,0.1)</code></li></ul>`,
    examples: JSON.stringify([
      { input: "no input", output: '.card { border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }' },
    ]),
    testCases: JSON.stringify([
      { input: "[]", expected: ".card" },
      { input: "[]", expected: "border: 1px solid #e0e0e0" },
      { input: "[]", expected: "border-radius: 8px" },
      { input: "[]", expected: "padding: 20px" },
      { input: "[]", expected: "box-shadow: 0 2px 8px rgba(0,0,0,0.1)" },
    ]),
    starterCode: `.card {\n\n}`,
  },
  {
    title: "CSS Text Center",
    slug: "css-text-center",
    difficulty: "easy",
    category: "css",
    description: `<p>Write a raw CSS rule for class <code>.title</code> that:</p><ul><li>Centers the text horizontally: <code>text-align: center</code></li><li>Makes it bold: <code>font-weight: bold</code></li></ul>`,
    examples: JSON.stringify([
      { input: "no input", output: ".title { text-align: center; font-weight: bold; }" },
    ]),
    testCases: JSON.stringify([
      { input: "[]", expected: ".title" },
      { input: "[]", expected: "text-align: center" },
      { input: "[]", expected: "font-weight: bold" },
    ]),
    starterCode: `.title {\n\n}`,
  },
  {
    title: "CSS Flex Row",
    slug: "css-flex-row",
    difficulty: "easy",
    category: "css",
    description: `<p>Write a raw CSS rule for class <code>.row</code> that lays children out in a horizontal row.</p><p>The CSS must include:</p><ul><li>Display: <code>flex</code></li><li>Direction: <code>row</code></li><li>Gap: <code>10px</code></li></ul>`,
    examples: JSON.stringify([
      { input: "no input", output: ".row { display: flex; flex-direction: row; gap: 10px; }" },
    ]),
    testCases: JSON.stringify([
      { input: "[]", expected: ".row" },
      { input: "[]", expected: "display: flex" },
      { input: "[]", expected: "flex-direction: row" },
      { input: "[]", expected: "gap: 10px" },
    ]),
    starterCode: `.row {\n\n}`,
  },
  {
    title: "CSS Hover Effect",
    slug: "css-hover-effect",
    difficulty: "medium",
    category: "css",
    description: `<p>Write a raw CSS rule for <code>.link:hover</code> that changes the text color to red.</p><p>The CSS must include:</p><ul><li>Color: <code>red</code></li><li>Underline: <code>text-decoration: underline</code></li></ul>`,
    examples: JSON.stringify([
      { input: "no input", output: ".link:hover { color: red; text-decoration: underline; }" },
    ]),
    testCases: JSON.stringify([
      { input: "[]", expected: ".link:hover" },
      { input: "[]", expected: "color: red" },
      { input: "[]", expected: "text-decoration: underline" },
    ]),
    starterCode: `.link:hover {\n\n}`,
  },
  {
    title: "CSS Grid Layout",
    slug: "css-grid-layout",
    difficulty: "medium",
    category: "css",
    description: `<p>Write a raw CSS rule for class <code>.grid</code> with three equal columns.</p><p>The CSS must include:</p><ul><li>Display: <code>grid</code></li><li>Three equal columns: <code>grid-template-columns: 1fr 1fr 1fr</code></li><li>Gap: <code>20px</code></li></ul>`,
    examples: JSON.stringify([
      { input: "no input", output: ".grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }" },
    ]),
    testCases: JSON.stringify([
      { input: "[]", expected: ".grid" },
      { input: "[]", expected: "display: grid" },
      { input: "[]", expected: "grid-template-columns: 1fr 1fr 1fr" },
      { input: "[]", expected: "gap: 20px" },
    ]),
    starterCode: `.grid {\n\n}`,
  },
  {
    title: "CSS Border Rounded",
    slug: "css-border-rounded",
    difficulty: "easy",
    category: "css",
    description: `<p>Write a raw CSS rule for class <code>.avatar</code> that turns a square image into a circle.</p><p>The CSS must include:</p><ul><li>Rounded corners: <code>border-radius: 50%</code></li><li>Object fit: <code>cover</code></li><li>Width and height: <code>40px</code></li></ul>`,
    examples: JSON.stringify([
      { input: "no input", output: ".avatar { border-radius: 50%; object-fit: cover; width: 40px; height: 40px; }" },
    ]),
    testCases: JSON.stringify([
      { input: "[]", expected: ".avatar" },
      { input: "[]", expected: "border-radius: 50%" },
      { input: "[]", expected: "object-fit: cover" },
      { input: "[]", expected: "width: 40px" },
      { input: "[]", expected: "height: 40px" },
    ]),
    starterCode: `.avatar {\n\n}`,
  },
  {
    title: "CSS Positioning",
    slug: "css-positioning",
    difficulty: "medium",
    category: "css",
    description: `<p>Write a raw CSS rule for class <code>.badge</code> that pins it to the top-right corner of its parent.</p><p>The CSS must include:</p><ul><li>Position: <code>absolute</code></li><li>Top: <code>0</code></li><li>Right: <code>0</code></li></ul>`,
    examples: JSON.stringify([
      { input: "no input", output: ".badge { position: absolute; top: 0; right: 0; }" },
    ]),
    testCases: JSON.stringify([
      { input: "[]", expected: ".badge" },
      { input: "[]", expected: "position: absolute" },
      { input: "[]", expected: "top: 0" },
      { input: "[]", expected: "right: 0" },
    ]),
    starterCode: `.badge {\n\n}`,
  },
  {
    title: "Product of Array Except Self",
    slug: "product-except-self",
    difficulty: "medium",
    category: "javascript",
    description: `<p>Given an integer array <code>nums</code>, return an array <code>answer</code> such that <code>answer[i]</code> is equal to the product of all the elements of <code>nums</code> except <code>nums[i]</code>.</p><p>Solve it in O(n) time without using the division operation.</p>`,
    examples: JSON.stringify([
      { input: "nums = [1,2,3,4]", output: "[24,12,8,6]" },
      { input: "nums = [-1,1,0,-3,3]", output: "[0,0,9,0,0]" },
    ]),
    testCases: JSON.stringify([
      { input: "[[1,2,3,4]]", expected: "[24,12,8,6]" },
      { input: "[[-1,1,0,-3,3]]", expected: "[0,0,9,0,0]" },
    ]),
    starterCode: `function main(nums) {\n  // Your code here\n}`,
  },
  {
    title: "Trapping Rain Water",
    slug: "trapping-rain-water",
    difficulty: "hard",
    category: "javascript",
    description: `<p>Given <code>n</code> non-negative integers representing an elevation map where the width of each bar is <code>1</code>, compute how much water it can trap after raining.</p>`,
    examples: JSON.stringify([
      { input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6", explanation: "The above elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped." },
      { input: "height = [4,2,0,3,2,5]", output: "9" },
    ]),
    testCases: JSON.stringify([
      { input: "[[0,1,0,2,1,0,1,3,2,1,2,1]]", expected: "6" },
      { input: "[[4,2,0,3,2,5]]", expected: "9" },
      { input: "[[1,1,1]]", expected: "0" },
    ]),
    starterCode: `function main(height) {\n  // Your code here\n}`,
  },
  {
    title: "Longest Increasing Subsequence",
    slug: "longest-increasing-subsequence",
    difficulty: "hard",
    category: "javascript",
    description: `<p>Given an integer array <code>nums</code>, return the length of the longest strictly increasing subsequence.</p>`,
    examples: JSON.stringify([
      { input: "nums = [10,9,2,5,3,7,101,18]", output: "4", explanation: "The longest increasing subsequence is [2,3,7,101], therefore the length is 4." },
      { input: "nums = [0,1,0,3,2,3]", output: "4" },
      { input: "nums = [7,7,7,7,7]", output: "1" },
    ]),
    testCases: JSON.stringify([
      { input: "[[10,9,2,5,3,7,101,18]]", expected: "4" },
      { input: "[[0,1,0,3,2,3]]", expected: "4" },
      { input: "[[7,7,7,7,7]]", expected: "1" },
    ]),
    starterCode: `function main(nums) {\n  // Your code here\n}`,
  },
  {
    title: "Sliding Window Maximum",
    slug: "sliding-window-maximum",
    difficulty: "hard",
    category: "javascript",
    description: `<p>You are given an array of integers <code>nums</code>, there is a sliding window of size <code>k</code> which is moving from the very left of the array to the very right. You can only see the <code>k</code> numbers in the window.</p><p>Return the max sliding window, an array containing the maximum of each window.</p>`,
    examples: JSON.stringify([
      { input: "nums = [1,3,-1,-3,5,3,6,7], k = 3", output: "[3,3,5,5,6,7]" },
      { input: "nums = [1], k = 1", output: "[1]" },
    ]),
    testCases: JSON.stringify([
      { input: "[[1,3,-1,-3,5,3,6,7],3]", expected: "[3,3,5,5,6,7]" },
      { input: "[[1],1]", expected: "[1]" },
      { input: "[[9,11],2]", expected: "[11]" },
    ]),
    starterCode: `function main(nums, k) {\n  // Your code here\n}`,
  },
  {
    title: "HTML Table",
    slug: "html-table",
    difficulty: "hard",
    category: "html",
    description: `<p>Write raw HTML markup for a table with a header row containing <code>Name</code> and <code>Age</code>, plus a data row with <code>Alice</code> and <code>25</code>.</p>`,
    examples: JSON.stringify([
      { input: "no input", output: `<table><tr><th>Name</th><th>Age</th></tr><tr><td>Alice</td><td>25</td></tr></table>` },
    ]),
    testCases: JSON.stringify([
      { input: "[]", expected: "<table>" },
      { input: "[]", expected: "<th>Name</th>" },
      { input: "[]", expected: "Alice" },
      { input: "[]", expected: "25" },
      { input: "[]", expected: "</table>" },
    ]),
    starterCode: `<table></table>`,
  },
  {
    title: "CSS Media Query",
    slug: "css-media-query",
    difficulty: "hard",
    category: "css",
    description: `<p>Write a raw CSS media query for screens with a maximum width of <code>600px</code> that makes the <code>.container</code> width <code>100%</code>.</p><p>The CSS must include:</p><ul><li>A media query: <code>@media (max-width: 600px)</code></li><li>A rule for <code>.container</code></li><li>Width: <code>100%</code></li></ul>`,
    examples: JSON.stringify([
      { input: "no input", output: "@media (max-width: 600px) { .container { width: 100%; } }" },
    ]),
    testCases: JSON.stringify([
      { input: "[]", expected: "@media" },
      { input: "[]", expected: "max-width: 600px" },
      { input: "[]", expected: ".container" },
      { input: "[]", expected: "width: 100%" },
    ]),
    starterCode: `@media (max-width: 600px) {\n  .container {\n\n  }\n}`,
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
