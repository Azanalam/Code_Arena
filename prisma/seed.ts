import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { generateStarterCode, PROBLEM_LANGUAGES, type PType, type Signature } from "../src/lib/languages";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

type Difficulty = "easy" | "medium" | "hard";

interface CodeProblem {
  title: string;
  slug: string;
  difficulty: Difficulty;
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  signature: Signature;
  testCases: { input: string; expected: string }[];
}

interface MarkupProblem {
  title: string;
  slug: string;
  difficulty: Difficulty;
  category: "html" | "css";
  description: string;
  examples: { input: string; output: string }[];
  testCases: { input: string; expected: string }[];
  starterCode: string;
}

const sig = (params: { name: string; type: PType }[], returns: PType): Signature => ({ params, returns });

function p(
  title: string,
  slug: string,
  difficulty: Difficulty,
  description: string,
  signature: Signature,
  testCases: { input: string; expected: string }[],
  examples?: { input: string; output: string; explanation?: string }[]
): CodeProblem {
  const ex = examples ?? testCases.slice(0, 3).map((tc) => {
    let input = tc.input;
    try {
      const args = JSON.parse(tc.input);
      input = signature.params.map((pa, i) => `${pa.name} = ${JSON.stringify(args[i])}`).join(", ");
    } catch { /* keep raw */ }
    return { input, output: tc.expected };
  });
  return { title, slug, difficulty, description, examples: ex, signature, testCases };
}

const i = (name: string, type: PType) => ({ name, type });

// ---------------------------------------------------------------------------
// Hand-authored classic problems (all available in all 8 languages)
// ---------------------------------------------------------------------------

const codeProblems: CodeProblem[] = [
  p("Two Sum", "two-sum", "easy",
    `<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.</p><p>You may assume that each input would have exactly one solution, and you may not use the same element twice.</p>`,
    sig([i("nums", "int[]"), i("target", "int")], "int[]"),
    [
      { input: "[[2,7,11,15],9]", expected: "[0,1]" },
      { input: "[[3,2,4],6]", expected: "[1,2]" },
      { input: "[[3,3],6]", expected: "[0,1]" },
      { input: "[[1,2,3,4,5],10]", expected: "[3,4]" },
    ]),
  p("Reverse String", "reverse-string", "easy",
    `<p>Write a function that reverses a string given as an array of characters <code>s</code>.</p><p>Return a new array with the characters in reverse order.</p>`,
    sig([i("s", "string[]")], "string[]"),
    [
      { input: `[["h","e","l","l","o"]]`, expected: `["o","l","l","e","h"]` },
      { input: `[["H","a","n","n","a","h"]]`, expected: `["h","a","n","n","a","H"]` },
      { input: `[["a"]]`, expected: `["a"]` },
    ]),
  p("Valid Parentheses", "valid-parentheses", "easy",
    `<p>Given a string <code>s</code> containing just the characters <code>'('</code>, <code>')'</code>, <code>'{'</code>, <code>'}'</code>, <code>'['</code> and <code>']'</code>, determine if the input string is valid.</p><p>An input string is valid if open brackets are closed by the same type in the correct order.</p>`,
    sig([i("s", "string")], "bool"),
    [
      { input: `["()"]`, expected: "true" },
      { input: `["()[]{}"]`, expected: "true" },
      { input: `["(]"]`, expected: "false" },
      { input: `["([)]"]`, expected: "false" },
      { input: `["{[]}"]`, expected: "true" },
    ]),
  p("Fizz Buzz", "fizz-buzz", "easy",
    `<p>Given an integer <code>n</code>, return a string array <code>answer</code> (1-indexed) where:</p><ul><li><code>answer[i] == "FizzBuzz"</code> if i is divisible by 3 and 5.</li><li><code>answer[i] == "Fizz"</code> if i is divisible by 3.</li><li><code>answer[i] == "Buzz"</code> if i is divisible by 5.</li><li><code>answer[i] == i</code> (as a string) otherwise.</li></ul>`,
    sig([i("n", "int")], "string[]"),
    [
      { input: "[3]", expected: `["1","2","Fizz"]` },
      { input: "[5]", expected: `["1","2","Fizz","4","Buzz"]` },
      { input: "[15]", expected: `["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]` },
    ]),
  p("Palindrome Number", "palindrome-number", "easy",
    `<p>Given an integer <code>x</code>, return <code>true</code> if <code>x</code> is a palindrome, and <code>false</code> otherwise.</p>`,
    sig([i("x", "int")], "bool"),
    [
      { input: "[121]", expected: "true" },
      { input: "[-121]", expected: "false" },
      { input: "[10]", expected: "false" },
      { input: "[0]", expected: "true" },
    ]),
  p("Longest Common Prefix", "longest-common-prefix", "medium",
    `<p>Write a function to find the longest common prefix string amongst an array of strings.</p><p>If there is no common prefix, return an empty string <code>""</code>.</p>`,
    sig([i("strs", "string[]")], "string"),
    [
      { input: `[["flower","flow","flight"]]`, expected: `"fl"` },
      { input: `[["dog","racecar","car"]]`, expected: `""` },
      { input: `[["a"]]`, expected: `"a"` },
      { input: `[["","b"]]`, expected: `""` },
    ]),
  p("Contains Duplicate", "contains-duplicate", "easy",
    `<p>Given an integer array <code>nums</code>, return <code>true</code> if any value appears at least twice in the array, and <code>false</code> if every element is distinct.</p>`,
    sig([i("nums", "int[]")], "bool"),
    [
      { input: "[[1,2,3,1]]", expected: "true" },
      { input: "[[1,2,3,4]]", expected: "false" },
      { input: "[[1,1,1,3,3,4,3,2,4,2]]", expected: "true" },
    ]),
  p("Roman to Integer", "roman-to-integer", "easy",
    `<p>Roman numerals are represented by seven different symbols: <code>I, V, X, L, C, D, M</code>.</p><p>Given a roman numeral, convert it to an integer.</p>`,
    sig([i("s", "string")], "int"),
    [
      { input: `["III"]`, expected: "3" },
      { input: `["LVIII"]`, expected: "58" },
      { input: `["MCMXCIV"]`, expected: "1994" },
      { input: `["IV"]`, expected: "4" },
    ]),
  p("Merge Two Sorted Lists", "merge-two-sorted-lists", "medium",
    `<p>You are given two sorted integer arrays <code>list1</code> and <code>list2</code> (linked-list simulation).</p><p>Merge the two lists into one sorted list and return it.</p>`,
    sig([i("list1", "int[]"), i("list2", "int[]")], "int[]"),
    [
      { input: "[[1,2,4],[1,3,4]]", expected: "[1,1,2,3,4,4]" },
      { input: "[[],[]]", expected: "[]" },
      { input: "[[],[0]]", expected: "[0]" },
    ]),
  p("Maximum Subarray", "maximum-subarray", "medium",
    `<p>Given an integer array <code>nums</code>, find the subarray with the largest sum, and return its sum.</p>`,
    sig([i("nums", "int[]")], "int"),
    [
      { input: "[[-2,1,-3,4,-1,2,1,-5,4]]", expected: "6" },
      { input: "[[1]]", expected: "1" },
      { input: "[[5,4,-1,7,8]]", expected: "23" },
      { input: "[[-1]]", expected: "-1" },
    ]),
  p("Product of Array Except Self", "product-except-self", "medium",
    `<p>Given an integer array <code>nums</code>, return an array <code>answer</code> such that <code>answer[i]</code> is equal to the product of all the elements of <code>nums</code> except <code>nums[i]</code>.</p>`,
    sig([i("nums", "int[]")], "int[]"),
    [
      { input: "[[1,2,3,4]]", expected: "[24,12,8,6]" },
      { input: "[[-1,1,0,-3,3]]", expected: "[0,0,9,0,0]" },
    ]),
  p("Trapping Rain Water", "trapping-rain-water", "hard",
    `<p>Given <code>n</code> non-negative integers representing an elevation map where the width of each bar is <code>1</code>, compute how much water it can trap after raining.</p>`,
    sig([i("height", "int[]")], "int"),
    [
      { input: "[[0,1,0,2,1,0,1,3,2,1,2,1]]", expected: "6" },
      { input: "[[4,2,0,3,2,5]]", expected: "9" },
      { input: "[[1,1,1]]", expected: "0" },
    ]),
  p("Longest Increasing Subsequence", "longest-increasing-subsequence", "hard",
    `<p>Given an integer array <code>nums</code>, return the length of the longest strictly increasing subsequence.</p>`,
    sig([i("nums", "int[]")], "int"),
    [
      { input: "[[10,9,2,5,3,7,101,18]]", expected: "4" },
      { input: "[[0,1,0,3,2,3]]", expected: "4" },
      { input: "[[7,7,7,7,7]]", expected: "1" },
    ]),
  p("Sliding Window Maximum", "sliding-window-maximum", "hard",
    `<p>You are given an array of integers <code>nums</code> and a sliding window of size <code>k</code> moving from left to right. Return an array containing the maximum of each window.</p>`,
    sig([i("nums", "int[]"), i("k", "int")], "int[]"),
    [
      { input: "[[1,3,-1,-3,5,3,6,7],3]", expected: "[3,3,5,5,6,7]" },
      { input: "[[1],1]", expected: "[1]" },
      { input: "[[9,11],2]", expected: "[11]" },
    ]),
  p("Climbing Stairs", "climbing-stairs", "easy",
    `<p>You are climbing a staircase. It takes <code>n</code> steps to reach the top.</p><p>Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?</p>`,
    sig([i("n", "int")], "int"),
    [
      { input: "[2]", expected: "2" },
      { input: "[3]", expected: "3" },
      { input: "[5]", expected: "8" },
      { input: "[10]", expected: "89" },
      { input: "[45]", expected: "1836311903" },
    ]),
  p("Single Number", "single-number", "easy",
    `<p>Given a non-empty array of integers <code>nums</code>, every element appears twice except for one. Find that single one.</p>`,
    sig([i("nums", "int[]")], "int"),
    [
      { input: "[[2,2,1]]", expected: "1" },
      { input: "[[4,1,2,1,2]]", expected: "4" },
      { input: "[[1]]", expected: "1" },
      { input: "[[5,7,5,9,7]]", expected: "9" },
    ]),
  p("Best Time to Buy and Sell Stock", "best-time-to-buy-sell-stock", "medium",
    `<p>You are given an array <code>prices</code> where <code>prices[i]</code> is the price of a given stock on the <code>i</code>th day.</p><p>Return the maximum profit you can achieve by buying one day and selling on a later day, or <code>0</code> if no profit is possible.</p>`,
    sig([i("prices", "int[]")], "int"),
    [
      { input: "[[7,1,5,3,6,4]]", expected: "5" },
      { input: "[[7,6,4,3,1]]", expected: "0" },
      { input: "[[1,2]]", expected: "1" },
      { input: "[[3,2,6,5,0,3]]", expected: "4" },
    ]),
  p("Longest Substring Without Repeating Characters", "longest-substring-without-repeating", "medium",
    `<p>Given a string <code>s</code>, find the length of the longest substring without repeating characters.</p>`,
    sig([i("s", "string")], "int"),
    [
      { input: `["abcabcbb"]`, expected: "3" },
      { input: `["bbbbb"]`, expected: "1" },
      { input: `["pwwkew"]`, expected: "3" },
      { input: `[""]`, expected: "0" },
      { input: `["dvdf"]`, expected: "3" },
    ]),
  p("Word Break", "word-break", "hard",
    `<p>Given a string <code>s</code> and a dictionary of strings <code>wordDict</code>, return <code>true</code> if <code>s</code> can be segmented into a space-separated sequence of one or more dictionary words.</p><p>The same dictionary word may be reused multiple times.</p>`,
    sig([i("s", "string"), i("wordDict", "string[]")], "bool"),
    [
      { input: `["leetcode",["leet","code"]]`, expected: "true" },
      { input: `["applepenapple",["apple","pen"]]`, expected: "true" },
      { input: `["catsandog",["cats","dog","sand","and","cat"]]`, expected: "false" },
      { input: `["aaaaaaa",["aaaa","aaa"]]`, expected: "true" },
    ]),
  p("Missing Number", "missing-number", "easy",
    `<p>Given an array <code>nums</code> containing <code>n</code> distinct numbers in the range <code>[0, n]</code>, return the only number in the range that is missing from the array.</p>`,
    sig([i("nums", "int[]")], "int"),
    [
      { input: "[[3,0,1]]", expected: "2" },
      { input: "[[0,1]]", expected: "2" },
      { input: "[[9,6,4,2,3,5,7,0,1]]", expected: "8" },
    ]),
  p("Move Zeroes", "move-zeroes", "easy",
    `<p>Given an integer array <code>nums</code>, return a new array where all <code>0</code>s are moved to the end while maintaining the relative order of the non-zero elements.</p>`,
    sig([i("nums", "int[]")], "int[]"),
    [
      { input: "[[0,1,0,3,12]]", expected: "[1,3,12,0,0]" },
      { input: "[[0]]", expected: "[0]" },
      { input: "[[1,0,0,2]]", expected: "[1,2,0,0]" },
    ]),
  p("Valid Palindrome", "valid-palindrome", "easy",
    `<p>A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.</p><p>Given a string <code>s</code>, return <code>true</code> if it is a palindrome, and <code>false</code> otherwise.</p>`,
    sig([i("s", "string")], "bool"),
    [
      { input: `["A man, a plan, a canal: Panama"]`, expected: "true" },
      { input: `["race a car"]`, expected: "false" },
      { input: `[" "]`, expected: "true" },
      { input: `["ab_a"]`, expected: "true" },
    ]),
  p("First Unique Character", "first-unique-character", "easy",
    `<p>Given a string <code>s</code>, find the first non-repeating character and return its index. If it does not exist, return <code>-1</code>.</p>`,
    sig([i("s", "string")], "int"),
    [
      { input: `["leetcode"]`, expected: "0" },
      { input: `["loveleetcode"]`, expected: "2" },
      { input: `["aabb"]`, expected: "-1" },
    ]),
  p("Majority Element", "majority-element", "easy",
    `<p>Given an array <code>nums</code> of size <code>n</code>, return the majority element that appears more than <code>n / 2</code> times.</p><p>You may assume the majority element always exists.</p>`,
    sig([i("nums", "int[]")], "int"),
    [
      { input: "[[3,2,3]]", expected: "3" },
      { input: "[[2,2,1,1,1,2,2]]", expected: "2" },
      { input: "[[1]]", expected: "1" },
    ]),
  p("Plus One", "plus-one", "easy",
    `<p>You are given a large integer represented as an integer array <code>digits</code>, where each digit is an element. Increment the large integer by one and return the resulting array of digits.</p>`,
    sig([i("digits", "int[]")], "int[]"),
    [
      { input: "[[1,2,3]]", expected: "[1,2,4]" },
      { input: "[[4,3,2,1]]", expected: "[4,3,2,2]" },
      { input: "[[9]]", expected: "[1,0]" },
      { input: "[[9,9,9]]", expected: "[1,0,0,0]" },
    ]),
  p("Reverse Words in a String", "reverse-words-in-a-string", "medium",
    `<p>Given an input string <code>s</code>, reverse the order of the words.</p><p>A word is defined as a sequence of non-space characters. The returned string should only have a single space separating the words.</p>`,
    sig([i("s", "string")], "string"),
    [
      { input: `["the sky is blue"]`, expected: `"blue is sky the"` },
      { input: `["  hello world  "]`, expected: `"world hello"` },
      { input: `["a good   example"]`, expected: `"example good a"` },
    ]),
  p("Add Binary", "add-binary", "easy",
    `<p>Given two binary strings <code>a</code> and <code>b</code>, return their sum as a binary string.</p>`,
    sig([i("a", "string"), i("b", "string")], "string"),
    [
      { input: `["11","1"]`, expected: `"100"` },
      { input: `["1010","1011"]`, expected: `"10101"` },
      { input: `["0","0"]`, expected: `"0"` },
    ]),
  p("Power of Two", "power-of-two", "easy",
    `<p>Given an integer <code>n</code>, return <code>true</code> if it is a power of two. Otherwise, return <code>false</code>.</p>`,
    sig([i("n", "int")], "bool"),
    [
      { input: "[1]", expected: "true" },
      { input: "[16]", expected: "true" },
      { input: "[3]", expected: "false" },
      { input: "[0]", expected: "false" },
      { input: "[-16]", expected: "false" },
    ]),
  p("Count Primes", "count-primes", "medium",
    `<p>Given an integer <code>n</code>, return the number of prime numbers that are strictly less than <code>n</code>.</p>`,
    sig([i("n", "int")], "int"),
    [
      { input: "[10]", expected: "4" },
      { input: "[0]", expected: "0" },
      { input: "[1]", expected: "0" },
      { input: "[100]", expected: "25" },
    ]),
  p("3Sum", "three-sum", "medium",
    `<p>Given an integer array <code>nums</code>, return all the triplets <code>[nums[i], nums[j], nums[k]]</code> such that <code>i != j</code>, <code>i != k</code>, <code>j != k</code>, and <code>nums[i] + nums[j] + nums[k] == 0</code>.</p><p>The solution set must not contain duplicate triplets. Triple elements in each triplet must be in ascending order.</p>`,
    sig([i("nums", "int[]")], "int[][]"),
    [
      { input: "[[-1,0,1,2,-1,-4]]", expected: "[[-1,-1,2],[-1,0,1]]" },
      { input: "[[0,1,1]]", expected: "[]" },
      { input: "[[0,0,0]]", expected: "[[0,0,0]]" },
    ]),
  p("Container With Most Water", "container-with-most-water", "medium",
    `<p>You are given an integer array <code>height</code> of length <code>n</code>.</p><p>Find two lines that together with the x-axis form a container that holds the most water. Return the maximum amount of water it can store.</p>`,
    sig([i("height", "int[]")], "int"),
    [
      { input: "[[1,8,6,2,5,4,8,3,7]]", expected: "49" },
      { input: "[[1,1]]", expected: "1" },
      { input: "[[4,3,2,1,4]]", expected: "16" },
    ]),
  p("Longest Palindromic Substring", "longest-palindromic-substring", "medium",
    `<p>Given a string <code>s</code>, return the longest palindromic substring in <code>s</code>. If multiple exist, return any one of them.</p>`,
    sig([i("s", "string")], "string"),
    [
      { input: `["babad"]`, expected: `"bab"` },
      { input: `["cbbd"]`, expected: `"bb"` },
      { input: `["a"]`, expected: `"a"` },
      { input: `["ac"]`, expected: `"a"` },
    ]),
  p("Rotate Image", "rotate-image", "medium",
    `<p>You are given an <code>n x n</code> 2D matrix representing an image.</p><p>Return the matrix rotated 90 degrees clockwise.</p>`,
    sig([i("matrix", "int[][]")], "int[][]"),
    [
      { input: "[[[1,2,3],[4,5,6],[7,8,9]]]", expected: "[[7,4,1],[8,5,2],[9,6,3]]" },
      { input: "[[[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]]", expected: "[[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]" },
    ]),
  p("Spiral Matrix", "spiral-matrix", "medium",
    `<p>Given an <code>m x n</code> matrix, return all elements of the matrix in spiral order.</p>`,
    sig([i("matrix", "int[][]")], "int[]"),
    [
      { input: "[[[1,2,3],[4,5,6],[7,8,9]]]", expected: "[1,2,3,6,9,8,7,4,5]" },
      { input: "[[[1,2,3,4],[5,6,7,8],[9,10,11,12]]]", expected: "[1,2,3,4,8,12,11,10,9,5,6,7]" },
    ]),
  p("Set Matrix Zeroes", "set-matrix-zeroes", "medium",
    `<p>Given an <code>m x n</code> integer matrix, return a new matrix where every row and column that contained a <code>0</code> is set to all <code>0</code>s.</p>`,
    sig([i("matrix", "int[][]")], "int[][]"),
    [
      { input: "[[[1,1,1],[1,0,1],[1,1,1]]]", expected: "[[1,0,1],[0,0,0],[1,0,1]]" },
      { input: "[[[0,1,2,0],[3,4,5,2],[1,3,1,5]]]", expected: "[[0,0,0,0],[0,4,5,0],[0,3,1,0]]" },
    ]),
  p("Jump Game", "jump-game", "medium",
    `<p>You are given an integer array <code>nums</code>. You are initially positioned at the first index, and each element represents your maximum jump length at that position.</p><p>Return <code>true</code> if you can reach the last index, and <code>false</code> otherwise.</p>`,
    sig([i("nums", "int[]")], "bool"),
    [
      { input: "[[2,3,1,1,4]]", expected: "true" },
      { input: "[[3,2,1,0,4]]", expected: "false" },
      { input: "[[0]]", expected: "true" },
    ]),
  p("Merge Intervals", "merge-intervals", "medium",
    `<p>Given an array of intervals where <code>intervals[i] = [start, end]</code>, return an array of the merged intervals, sorted by start.</p>`,
    sig([i("intervals", "int[][]")], "int[][]"),
    [
      { input: "[[[1,3],[2,6],[8,10],[15,18]]]", expected: "[[1,6],[8,10],[15,18]]" },
      { input: "[[[1,4],[4,5]]]", expected: "[[1,5]]" },
      { input: "[[[1,4]]]", expected: "[[1,4]]" },
    ]),
  p("Sort Colors", "sort-colors", "medium",
    `<p>Given an array <code>nums</code> with <code>n</code> objects colored red (0), white (1), or blue (2), return a sorted array of the objects so that the same colors are adjacent.</p>`,
    sig([i("nums", "int[]")], "int[]"),
    [
      { input: "[[2,0,2,1,1,0]]", expected: "[0,0,1,1,2,2]" },
      { input: "[[2,0,1]]", expected: "[0,1,2]" },
      { input: "[[0]]", expected: "[0]" },
    ]),
  p("Subarray Sum Equals K", "subarray-sum-equals-k", "medium",
    `<p>Given an array of integers <code>nums</code> and an integer <code>k</code>, return the total number of subarrays whose sum equals <code>k</code>.</p>`,
    sig([i("nums", "int[]"), i("k", "int")], "int"),
    [
      { input: "[[1,1,1],2]", expected: "2" },
      { input: "[[1,2,3],3]", expected: "2" },
      { input: "[[1,-1,0],0]", expected: "3" },
    ]),
  p("Top K Frequent Elements", "top-k-frequent-elements", "medium",
    `<p>Given an integer array <code>nums</code> and an integer <code>k</code>, return the <code>k</code> most frequent elements. You may return the answer in any order, sorted ascending.</p>`,
    sig([i("nums", "int[]"), i("k", "int")], "int[]"),
    [
      { input: "[[1,1,1,2,2,3],2]", expected: "[1,2]" },
      { input: "[[1],1]", expected: "[1]" },
      { input: "[[4,4,4,2,2,2,3],1]", expected: "[2]" },
    ]),
  p("Two Sum II", "two-sum-ii", "medium",
    `<p>Given a 1-indexed sorted array <code>numbers</code> that is already sorted in non-decreasing order, find two numbers that add up to a specific target number.</p><p>Return the 1-indexed indices of the two numbers as an array <code>[index1, index2]</code>.</p>`,
    sig([i("numbers", "int[]"), i("target", "int")], "int[]"),
    [
      { input: "[[2,7,11,15],9]", expected: "[1,2]" },
      { input: "[[2,3,4],6]", expected: "[1,3]" },
      { input: "[[-1,0],-1]", expected: "[1,2]" },
    ]),
  p("Edit Distance", "edit-distance", "hard",
    `<p>Given two strings <code>word1</code> and <code>word2</code>, return the minimum number of operations required to convert <code>word1</code> to <code>word2</code>.</p><p>You may insert, delete, or replace a character (one operation each).</p>`,
    sig([i("word1", "string"), i("word2", "string")], "int"),
    [
      { input: `["horse","ros"]`, expected: "3" },
      { input: `["intention","execution"]`, expected: "5" },
      { input: `["","a"]`, expected: "1" },
    ]),
  p("Candy", "candy", "hard",
    `<p>There are <code>n</code> children standing in a line, with ratings <code>ratings[i]</code>. You must give each child at least 1 candy.</p><p>Children with a higher rating than a neighbor get more candies than that neighbor.</p><p>Return the minimum number of candies you need to give.</p>`,
    sig([i("ratings", "int[]")], "int"),
    [
      { input: "[[1,0,2]]", expected: "5" },
      { input: "[[1,2,2]]", expected: "4" },
      { input: "[[1]]", expected: "1" },
    ]),
  p("First Missing Positive", "first-missing-positive", "hard",
    `<p>Given an unsorted integer array <code>nums</code>, return the smallest missing positive integer.</p>`,
    sig([i("nums", "int[]")], "int"),
    [
      { input: "[[1,2,0]]", expected: "3" },
      { input: "[[3,4,-1,1]]", expected: "2" },
      { input: "[[7,8,9,11,12]]", expected: "1" },
    ]),
  p("Largest Rectangle in Histogram", "largest-rectangle-in-histogram", "hard",
    `<p>Given an array of integers <code>heights</code> representing the histogram's bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram.</p>`,
    sig([i("heights", "int[]")], "int"),
    [
      { input: "[[2,1,5,6,2,3]]", expected: "10" },
      { input: "[[2,4]]", expected: "4" },
      { input: "[[1,2,3,4,5]]", expected: "9" },
    ]),
  p("Merge k Sorted Arrays", "merge-k-sorted-arrays", "hard",
    `<p>You are given an array of <code>k</code> sorted integer arrays <code>lists</code>.</p><p>Merge all the arrays into one sorted array and return it.</p>`,
    sig([i("lists", "int[][]")], "int[]"),
    [
      { input: "[[[1,4,5],[1,3,4],[2,6]]]", expected: "[1,1,2,3,4,4,5,6]" },
      { input: "[[[],[],[1]]]", expected: "[1]" },
      { input: "[[[1],[2],[3,4]]]", expected: "[1,2,3,4]" },
    ]),
  p("Median of Two Sorted Arrays", "median-of-two-sorted-arrays", "hard",
    `<p>Given two sorted arrays <code>nums1</code> and <code>nums2</code> of size <code>m</code> and <code>n</code> respectively, return the median of the two sorted arrays.</p>`,
    sig([i("nums1", "int[]"), i("nums2", "int[]")], "double"),
    [
      { input: "[[1,3],[2]]", expected: "2.0" },
      { input: "[[1,2],[3,4]]", expected: "2.5" },
      { input: "[[],[1]]", expected: "1.0" },
    ]),
  p("Find the Duplicate Number", "find-the-duplicate-number", "hard",
    `<p>Given an array of integers <code>nums</code> containing <code>n + 1</code> integers where each integer is in the range <code>[1, n]</code> inclusive, there is only one repeated number. Return the repeated number.</p>`,
    sig([i("nums", "int[]")], "int"),
    [
      { input: "[[1,3,4,2,2]]", expected: "2" },
      { input: "[[3,1,3,4,2]]", expected: "3" },
      { input: "[[1,1]]", expected: "1" },
    ]),
  p("Count and Say", "count-and-say", "medium",
    `<p>The count-and-say sequence is a sequence of digit strings defined by: to generate the next term, read off the digits of the previous term, counting the number of digits in groups of the same digit.</p><p>Given a positive integer <code>n</code>, return the <code>n</code>th term of the count-and-say sequence. The sequence starts with <code>"1"</code>.</p>`,
    sig([i("n", "int")], "string"),
    [
      { input: "[1]", expected: `"1"` },
      { input: "[4]", expected: `"1211"` },
      { input: "[6]", expected: `"312211"` },
    ]),
];

// ---------------------------------------------------------------------------
// Generated template problems (variants scale difficulty)
// ---------------------------------------------------------------------------

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rInt = (rnd: () => number, min: number, max: number) => Math.floor(rnd() * (max - min + 1)) + min;
const intArr = (rnd: () => number, len: number, min: number, max: number) =>
  Array.from({ length: len }, () => rInt(rnd, min, max));
const strOf = (rnd: () => number, len: number, chars: string) =>
  Array.from({ length: len }, () => chars[Math.floor(rnd() * chars.length)]).join("");
const strArr = (rnd: () => number, len: number, chars: string, maxLen: number) =>
  Array.from({ length: len }, () => strOf(rnd, rInt(rnd, 1, maxLen), chars));

function roman(n: number): string {
  const vals: [number, string][] = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let out = "";
  for (const [v, sym] of vals) {
    while (n >= v) { out += sym; n -= v; }
  }
  return out;
}

function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { const t = a % b; a = b; b = t; }
  return a;
}

function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}

const diffPatterns = {
  array: ["easy", "easy", "easy", "medium", "medium", "hard"],
  number: ["easy", "easy", "medium", "medium", "medium", "hard"],
  target: ["easy", "medium", "medium", "medium", "hard", "hard"],
  string: ["easy", "easy", "medium", "medium", "medium", "hard"],
  matrix: ["medium", "medium", "medium", "hard", "hard", "hard"],
  double: ["easy", "easy", "medium", "medium", "medium", "hard"],
} as const;

interface Template {
  base: string;
  slugBase: string;
  diffs: readonly Difficulty[];
  desc: string;
  signature: Signature;
  ref: (args: unknown[]) => unknown;
  gen: (v: number, rnd: () => number) => unknown[][];
}

const templates: Template[] = [
  {
    base: "Array Sum", slugBase: "array-sum", diffs: diffPatterns.array,
    desc: `<p>Given an array of integers <code>nums</code>, return the total sum of all its elements.</p>`,
    signature: sig([i("nums", "int[]")], "int"),
    ref: (a) => (a[0] as number[]).reduce((s, x) => s + x, 0),
    gen: (v, rnd) => Array.from({ length: 4 + v }, (_, k) => [intArr(rnd, 3 + (k % 3), -50 * (v + 1), 50 * (v + 1))]),
  },
  {
    base: "Array Product", slugBase: "array-product", diffs: diffPatterns.array,
    desc: `<p>Given an array of integers <code>nums</code>, return the product of all its elements.</p>`,
    signature: sig([i("nums", "int[]")], "int"),
    ref: (a) => (a[0] as number[]).reduce((s, x) => s * x, 1),
    gen: (v, rnd) => Array.from({ length: 4 + v }, () => [intArr(rnd, 2 + (v % 5), -3, 3)]),
  },
  {
    base: "Maximum Element", slugBase: "maximum-element", diffs: diffPatterns.array,
    desc: `<p>Given an array of integers <code>nums</code>, return the largest element.</p>`,
    signature: sig([i("nums", "int[]")], "int"),
    ref: (a) => Math.max(...(a[0] as number[])),
    gen: (v, rnd) => Array.from({ length: 4 + v }, (_, k) => [intArr(rnd, 3 + (k % 3), -100 * (v + 1), 100 * (v + 1))]),
  },
  {
    base: "Minimum Element", slugBase: "minimum-element", diffs: diffPatterns.array,
    desc: `<p>Given an array of integers <code>nums</code>, return the smallest element.</p>`,
    signature: sig([i("nums", "int[]")], "int"),
    ref: (a) => Math.min(...(a[0] as number[])),
    gen: (v, rnd) => Array.from({ length: 4 + v }, (_, k) => [intArr(rnd, 3 + (k % 3), -100 * (v + 1), 100 * (v + 1))]),
  },
  {
    base: "Count Even Numbers", slugBase: "count-even-numbers", diffs: diffPatterns.array,
    desc: `<p>Given an array of integers <code>nums</code>, return how many of its elements are even.</p>`,
    signature: sig([i("nums", "int[]")], "int"),
    ref: (a) => (a[0] as number[]).filter((x) => x % 2 === 0).length,
    gen: (v, rnd) => Array.from({ length: 4 + v }, (_, k) => [intArr(rnd, 4 + (k % 4), -50 * (v + 1), 50 * (v + 1))]),
  },
  {
    base: "Count Positive Numbers", slugBase: "count-positive-numbers", diffs: diffPatterns.array,
    desc: `<p>Given an array of integers <code>nums</code>, return how many of its elements are strictly greater than zero.</p>`,
    signature: sig([i("nums", "int[]")], "int"),
    ref: (a) => (a[0] as number[]).filter((x) => x > 0).length,
    gen: (v, rnd) => Array.from({ length: 4 + v }, (_, k) => [intArr(rnd, 4 + (k % 4), -50 * (v + 1), 50 * (v + 1))]),
  },
  {
    base: "Sum of Digits", slugBase: "sum-of-digits", diffs: diffPatterns.number,
    desc: `<p>Given a non-negative integer <code>n</code>, return the sum of its digits.</p>`,
    signature: sig([i("n", "int")], "int"),
    ref: (a) => String(Math.abs(a[0] as number)).split("").reduce((s, d) => s + Number(d), 0),
    gen: (v, rnd) => Array.from({ length: 5 + v }, () => [rInt(rnd, 0, Math.pow(10, 2 + v))]),
  },
  {
    base: "Count of Digits", slugBase: "count-of-digits", diffs: diffPatterns.number,
    desc: `<p>Given a non-negative integer <code>n</code>, return how many digits it has.</p>`,
    signature: sig([i("n", "int")], "int"),
    ref: (a) => String(Math.abs(a[0] as number)).length,
    gen: (v, rnd) => Array.from({ length: 5 + v }, () => [rInt(rnd, 0, Math.pow(10, 2 + v))]),
  },
  {
    base: "Reverse Number", slugBase: "reverse-number", diffs: diffPatterns.number,
    desc: `<p>Given an integer <code>n</code>, return the number formed by reversing its digits (sign preserved, leading zeros dropped).</p>`,
    signature: sig([i("n", "int")], "int"),
    ref: (a) => {
      const n = a[0] as number;
      const s = String(Math.abs(n));
      return (n < 0 ? -1 : 1) * Number(s.split("").reverse().join(""));
    },
    gen: (v, rnd) => Array.from({ length: 5 + v }, () => [rInt(rnd, -Math.pow(10, 2 + v), Math.pow(10, 2 + v))]),
  },
  {
    base: "Is Even", slugBase: "is-even", diffs: diffPatterns.number,
    desc: `<p>Given an integer <code>n</code>, return <code>true</code> if it is even and <code>false</code> otherwise.</p>`,
    signature: sig([i("n", "int")], "bool"),
    ref: (a) => (a[0] as number) % 2 === 0,
    gen: (v, rnd) => Array.from({ length: 5 + v }, () => [rInt(rnd, -5000, 5000)]),
  },
  {
    base: "Power of Two", slugBase: "power-of-two-variants", diffs: diffPatterns.number,
    desc: `<p>Given an integer <code>n</code>, return <code>true</code> if <code>n</code> is a power of two, and <code>false</code> otherwise.</p>`,
    signature: sig([i("n", "int")], "bool"),
    ref: (a) => (a[0] as number) > 0 && ((a[0] as number) & ((a[0] as number) - 1)) === 0,
    gen: (v, rnd) => Array.from({ length: 5 + v }, (_, k) =>
      k % 2 === 0 ? [Math.pow(2, rInt(rnd, 0, 20))] : [rInt(rnd, 0, 2_000_000)]),
  },
  {
    base: "Prime Check", slugBase: "prime-check", diffs: diffPatterns.number,
    desc: `<p>Given an integer <code>n</code>, return <code>true</code> if <code>n</code> is a prime number, and <code>false</code> otherwise.</p>`,
    signature: sig([i("n", "int")], "bool"),
    ref: (a) => isPrime(a[0] as number),
    gen: (v, rnd) => Array.from({ length: 5 + v }, () => [rInt(rnd, 0, 300 + v * 100)]),
  },
  {
    base: "Greatest Common Divisor", slugBase: "greatest-common-divisor", diffs: diffPatterns.number,
    desc: `<p>Given two integers <code>a</code> and <code>b</code>, return their greatest common divisor.</p>`,
    signature: sig([i("a", "int"), i("b", "int")], "int"),
    ref: (a) => gcd(a[0] as number, a[1] as number),
    gen: (v, rnd) => Array.from({ length: 5 + v }, () => [rInt(rnd, 1, 100 + v * 50), rInt(rnd, 1, 100 + v * 50)]),
  },
  {
    base: "Least Common Multiple", slugBase: "least-common-multiple", diffs: diffPatterns.number,
    desc: `<p>Given two positive integers <code>a</code> and <code>b</code>, return their least common multiple.</p>`,
    signature: sig([i("a", "int"), i("b", "int")], "int"),
    ref: (a) => {
      const x = a[0] as number, y = a[1] as number;
      return (x / gcd(x, y)) * y;
    },
    gen: (v, rnd) => Array.from({ length: 5 + v }, () => [rInt(rnd, 1, 50 + v * 20), rInt(rnd, 1, 50 + v * 20)]),
  },
  {
    base: "Fibonacci Number", slugBase: "fibonacci-number", diffs: diffPatterns.number,
    desc: `<p>The Fibonacci numbers are defined as <code>F(0) = 0</code>, <code>F(1) = 1</code>, and <code>F(n) = F(n-1) + F(n-2)</code>.</p><p>Given <code>n</code>, return <code>F(n)</code>.</p>`,
    signature: sig([i("n", "int")], "int"),
    ref: (a) => {
      let x = 0, y = 1;
      for (let k = 0; k < (a[0] as number); k++) { const t = x + y; x = y; y = t; }
      return x;
    },
    gen: (v, rnd) => Array.from({ length: 5 + v }, () => [rInt(rnd, 0, 20 + v * 3)]),
  },
  {
    base: "Factorial", slugBase: "factorial", diffs: diffPatterns.number,
    desc: `<p>Given a non-negative integer <code>n</code>, return <code>n!</code> (the factorial of <code>n</code>).</p>`,
    signature: sig([i("n", "int")], "int"),
    ref: (a) => {
      let r = 1;
      for (let k = 2; k <= (a[0] as number); k++) r *= k;
      return r;
    },
    gen: (v, rnd) => Array.from({ length: 5 + v }, () => [rInt(rnd, 0, 8 + v * 2)]),
  },
  {
    base: "Triangular Number", slugBase: "triangular-number", diffs: diffPatterns.number,
    desc: `<p>Given a non-negative integer <code>n</code>, return the triangular number <code>1 + 2 + ... + n</code>.</p>`,
    signature: sig([i("n", "int")], "int"),
    ref: (a) => ((a[0] as number) * ((a[0] as number) + 1)) / 2,
    gen: (v, rnd) => Array.from({ length: 5 + v }, () => [rInt(rnd, 0, 1000 + v * 1000)]),
  },
  {
    base: "Palindrome String", slugBase: "palindrome-string", diffs: diffPatterns.string,
    desc: `<p>Given a string <code>s</code>, return <code>true</code> if it reads the same forwards and backwards, and <code>false</code> otherwise.</p>`,
    signature: sig([i("s", "string")], "bool"),
    ref: (a) => {
      const s = a[0] as string;
      return s === s.split("").reverse().join("");
    },
    gen: (v, rnd) => Array.from({ length: 5 + v }, (_, k) => {
      const base = strOf(rnd, 3 + (k % 4), "abcdefgh");
      return k % 2 === 0 ? [base + base.split("").reverse().join("")] : [base + "x" + base.split("").reverse().join("")];
    }),
  },
  {
    base: "Reverse String", slugBase: "reverse-string-variants", diffs: diffPatterns.string,
    desc: `<p>Given a string <code>s</code>, return the string reversed.</p>`,
    signature: sig([i("s", "string")], "string"),
    ref: (a) => (a[0] as string).split("").reverse().join(""),
    gen: (v, rnd) => Array.from({ length: 5 + v }, () => [strOf(rnd, 2 + v * 2, "abcdefghijklmnop")]),
  },
  {
    base: "Word Count", slugBase: "word-count", diffs: diffPatterns.string,
    desc: `<p>Given a string <code>s</code>, return the number of words it contains. Words are separated by single spaces.</p>`,
    signature: sig([i("s", "string")], "int"),
    ref: (a) => (a[0] as string).split(" ").length,
    gen: (v, rnd) => Array.from({ length: 5 + v }, () => [strArr(rnd, 2 + (v % 5), "abcdefgh", 6).join(" ")]),
  },
  {
    base: "Vowel Count", slugBase: "vowel-count", diffs: diffPatterns.string,
    desc: `<p>Given a string <code>s</code> of lowercase letters, return the number of vowels (<code>a, e, i, o, u</code>) it contains.</p>`,
    signature: sig([i("s", "string")], "int"),
    ref: (a) => (a[0] as string).split("").filter((c) => "aeiou".includes(c)).length,
    gen: (v, rnd) => Array.from({ length: 5 + v }, () => [strOf(rnd, 3 + v * 2, "abcdefghijklmnopqrstuvwxyz")]),
  },
  {
    base: "Uppercase Count", slugBase: "uppercase-count", diffs: diffPatterns.string,
    desc: `<p>Given a string <code>s</code>, return how many uppercase letters it contains.</p>`,
    signature: sig([i("s", "string")], "int"),
    ref: (a) => (a[0] as string).split("").filter((c) => c >= "A" && c <= "Z").length,
    gen: (v, rnd) => Array.from({ length: 5 + v }, () => [strOf(rnd, 3 + v * 2, "aAbBcCdDeEfFgGhHiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz")]),
  },
  {
    base: "Longest Word Length", slugBase: "longest-word-length", diffs: diffPatterns.string,
    desc: `<p>Given a string <code>s</code> containing words separated by single spaces, return the length of the longest word.</p>`,
    signature: sig([i("s", "string")], "int"),
    ref: (a) => Math.max(...(a[0] as string).split(" ").map((w) => w.length)),
    gen: (v, rnd) => Array.from({ length: 5 + v }, () => [strArr(rnd, 2 + (v % 5), "abcdefgh", 4 + v).join(" ")]),
  },
  {
    base: "Binary Search", slugBase: "binary-search", diffs: diffPatterns.target,
    desc: `<p>Given a sorted array of integers <code>arr</code> (ascending, no duplicates) and a <code>target</code>, return the index of <code>target</code>, or <code>-1</code> if it is not present.</p>`,
    signature: sig([i("arr", "int[]"), i("target", "int")], "int"),
    ref: (a) => {
      const arr = a[0] as number[];
      const t = a[1] as number;
      let lo = 0, hi = arr.length - 1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (arr[mid] === t) return mid;
        if (arr[mid] < t) lo = mid + 1; else hi = mid - 1;
      }
      return -1;
    },
    gen: (v, rnd) => Array.from({ length: 5 + v }, (_, k) => {
      const sorted = intArr(rnd, 3 + v, 1, 30 + v * 20).sort((x, y) => x - y);
      return k % 3 === 2 ? [sorted, 99999] : [sorted, sorted[rInt(rnd, 0, sorted.length - 1)]];
    }),
  },
  {
    base: "Two Sum Small", slugBase: "two-sum-small", diffs: diffPatterns.target,
    desc: `<p>Given an array of distinct integers <code>nums</code> and a <code>target</code>, return the indices of the two elements that add up to <code>target</code>. Exactly one solution exists.</p>`,
    signature: sig([i("nums", "int[]"), i("target", "int")], "int[]"),
    ref: (a) => {
      const nums = a[0] as number[];
      const t = a[1] as number;
      const seen = new Map<number, number>();
      for (let i = 0; i < nums.length; i++) {
        const need = t - nums[i];
        if (seen.has(need)) return [seen.get(need)!, i];
        seen.set(nums[i], i);
      }
      return [0, 1];
    },
    gen: (v, rnd) => Array.from({ length: 5 + v }, () => {
      const len = 4 + (v % 5);
      const nums = intArr(rnd, len, 1, 20);
      const i1 = rInt(rnd, 0, len - 1);
      let i2 = rInt(rnd, 0, len - 1);
      while (i2 === i1) i2 = rInt(rnd, 0, len - 1);
      return [nums, nums[i1] + nums[i2]];
    }),
  },
  {
    base: "Rotate Array Right", slugBase: "rotate-array-right", diffs: diffPatterns.target,
    desc: `<p>Given an integer array <code>nums</code> and an integer <code>k</code>, return a new array rotated to the right by <code>k</code> steps.</p>`,
    signature: sig([i("nums", "int[]"), i("k", "int")], "int[]"),
    ref: (a) => {
      const nums = a[0] as number[];
      const k = (a[1] as number) % nums.length;
      return [...nums.slice(nums.length - k), ...nums.slice(0, nums.length - k)];
    },
    gen: (v, rnd) => Array.from({ length: 5 + v }, () => [intArr(rnd, 3 + (v % 4), -20, 20), rInt(rnd, 0, 10)]),
  },
  {
    base: "Merge Sorted Arrays", slugBase: "merge-sorted-arrays", diffs: diffPatterns.target,
    desc: `<p>Given two sorted integer arrays <code>a</code> and <code>b</code> (both ascending), return the merged sorted array.</p>`,
    signature: sig([i("a", "int[]"), i("b", "int[]")], "int[]"),
    ref: (a) => [...(a[0] as number[]), ...(a[1] as number[])].sort((x, y) => x - y),
    gen: (v, rnd) => Array.from({ length: 5 + v }, () => [
      intArr(rnd, 2 + (v % 4), 1, 30).sort((x, y) => x - y),
      intArr(rnd, 2 + (v % 4), 1, 30).sort((x, y) => x - y),
    ]),
  },
  {
    base: "Count Occurrences", slugBase: "count-occurrences", diffs: diffPatterns.target,
    desc: `<p>Given an array of integers <code>nums</code> and an integer <code>x</code>, return how many times <code>x</code> appears in <code>nums</code>.</p>`,
    signature: sig([i("nums", "int[]"), i("x", "int")], "int"),
    ref: (a) => (a[0] as number[]).filter((n) => n === (a[1] as number)).length,
    gen: (v, rnd) => {
      const x = rInt(rnd, 1, 10);
      const base = intArr(rnd, 4 + v, 1, 15);
      return Array.from({ length: 5 + v }, () => [[...base, x, x, ...(rnd() > 0.5 ? [x] : [])], x]);
    },
  },
  {
    base: "Sum of Squares", slugBase: "sum-of-squares", diffs: diffPatterns.number,
    desc: `<p>Given a non-negative integer <code>n</code>, return the sum of squares <code>1² + 2² + ... + n²</code>.</p>`,
    signature: sig([i("n", "int")], "int"),
    ref: (a) => {
      let s = 0;
      for (let k = 1; k <= (a[0] as number); k++) s += k * k;
      return s;
    },
    gen: (v, rnd) => Array.from({ length: 5 + v }, () => [rInt(rnd, 0, 50 + v * 20)]),
  },
  {
    base: "Matrix Row Sum", slugBase: "matrix-row-sum", diffs: diffPatterns.matrix,
    desc: `<p>Given a matrix <code>mat</code> of integers, return an array where element <code>i</code> is the sum of row <code>i</code>.</p>`,
    signature: sig([i("mat", "int[][]")], "int[]"),
    ref: (a) => (a[0] as number[][]).map((row) => row.reduce((s, x) => s + x, 0)),
    gen: (v, rnd) => Array.from({ length: 4 + v }, () => [
      Array.from({ length: 2 + (v % 3) }, () => intArr(rnd, 2 + (v % 3), -10, 10)),
    ]),
  },
  {
    base: "Matrix Column Sum", slugBase: "matrix-column-sum", diffs: diffPatterns.matrix,
    desc: `<p>Given a matrix <code>mat</code> of integers, return an array where element <code>j</code> is the sum of column <code>j</code>. All rows have the same length.</p>`,
    signature: sig([i("mat", "int[][]")], "int[]"),
    ref: (a) => {
      const m = a[0] as number[][];
      return m[0].map((_, j) => m.reduce((s, row) => s + row[j], 0));
    },
    gen: (v, rnd) => Array.from({ length: 4 + v }, () => {
      const cols = 2 + (v % 3);
      return [Array.from({ length: 2 + ((v + 1) % 3) }, () => intArr(rnd, cols, -10, 10))];
    }),
  },
  {
    base: "Matrix Diagonal Sum", slugBase: "matrix-diagonal-sum", diffs: diffPatterns.matrix,
    desc: `<p>Given a square matrix <code>mat</code>, return the sum of the elements on its main diagonal (top-left to bottom-right).</p>`,
    signature: sig([i("mat", "int[][]")], "int"),
    ref: (a) => (a[0] as number[][]).reduce((s, row, k) => s + row[k], 0),
    gen: (v, rnd) => Array.from({ length: 4 + v }, () => {
      const n = 2 + (v % 3);
      return [Array.from({ length: n }, () => intArr(rnd, n, -10, 10))];
    }),
  },
  {
    base: "Matrix Maximum", slugBase: "matrix-maximum", diffs: diffPatterns.matrix,
    desc: `<p>Given a matrix <code>mat</code> of integers, return its maximum element.</p>`,
    signature: sig([i("mat", "int[][]")], "int"),
    ref: (a) => Math.max(...(a[0] as number[][]).flat()),
    gen: (v, rnd) => Array.from({ length: 4 + v }, () => [
      Array.from({ length: 2 + (v % 3) }, () => intArr(rnd, 2 + (v % 3), -50 * (v + 1), 50 * (v + 1))),
    ]),
  },
  {
    base: "Matrix Transpose", slugBase: "matrix-transpose", diffs: diffPatterns.matrix,
    desc: `<p>Given a matrix <code>mat</code> of integers, return its transpose (rows become columns).</p>`,
    signature: sig([i("mat", "int[][]")], "int[][]"),
    ref: (a) => {
      const m = a[0] as number[][];
      return m[0].map((_, j) => m.map((row) => row[j]));
    },
    gen: (v, rnd) => Array.from({ length: 4 + v }, () => {
      const cols = 2 + (v % 3);
      return [Array.from({ length: 2 + ((v + 1) % 3) }, () => intArr(rnd, cols, -9, 9))];
    }),
  },
  {
    base: "Circle Area", slugBase: "circle-area", diffs: diffPatterns.double,
    desc: `<p>Given the radius <code>r</code> of a circle, return its area computed as <code>π × r²</code> (use the double type).</p>`,
    signature: sig([i("r", "double")], "double"),
    ref: (a) => Math.PI * (a[0] as number) * (a[0] as number),
    gen: (v, rnd) => Array.from({ length: 5 + v }, () => [rInt(rnd, 1, 20) + rnd()]),
  },
  {
    base: "Celsius to Fahrenheit", slugBase: "celsius-to-fahrenheit", diffs: diffPatterns.double,
    desc: `<p>Given a temperature in Celsius <code>c</code>, return the temperature in Fahrenheit using <code>F = C × 9/5 + 32</code>.</p>`,
    signature: sig([i("c", "double")], "double"),
    ref: (a) => (a[0] as number) * 9 / 5 + 32,
    gen: (v, rnd) => Array.from({ length: 5 + v }, () => [rInt(rnd, -40, 100) + (rnd() > 0.5 ? rnd() : 0)]),
  },
  {
    base: "Array Average", slugBase: "array-average", diffs: diffPatterns.double,
    desc: `<p>Given an array of integers <code>nums</code>, return its average as a double.</p>`,
    signature: sig([i("nums", "int[]")], "double"),
    ref: (a) => (a[0] as number[]).reduce((s, x) => s + x, 0) / (a[0] as number[]).length,
    gen: (v, rnd) => Array.from({ length: 5 + v }, (_, k) => [intArr(rnd, 2 + (k % 4), -100 * (v + 1), 100 * (v + 1))]),
  },
];

for (const tmpl of templates) {
  for (let v = 0; v < tmpl.diffs.length; v++) {
    const seed = (templates.indexOf(tmpl) + 1) * 7919 + v * 104729;
    const rnd = mulberry32(seed);
    const argsList = tmpl.gen(v, rnd);
    const testCases = argsList.map((args) => ({
      input: JSON.stringify(args),
      expected: JSON.stringify(tmpl.ref(args)),
    }));
    codeProblems.push(
      p(
        `${tmpl.base} ${roman(v + 1)}`,
        `${tmpl.slugBase}-${v + 1}`,
        tmpl.diffs[v],
        tmpl.desc,
        tmpl.signature,
        testCases
      )
    );
  }
}

// ---------------------------------------------------------------------------
// Markup problems (HTML / CSS — judged by the local markup runner)
// ---------------------------------------------------------------------------

const markupProblems: MarkupProblem[] = [
  {
    title: "HTML Paragraph", slug: "html-paragraph-builder", difficulty: "easy", category: "html",
    description: `<p>Write raw HTML markup that creates a paragraph element containing the text <code>Hello World</code>.</p>`,
    examples: [{ input: "no input", output: "<p>Hello World</p>" }],
    testCases: [
      { input: "[]", expected: "<p>" },
      { input: "[]", expected: "Hello World" },
      { input: "[]", expected: "</p>" },
    ],
    starterCode: `<p></p>`,
  },
  {
    title: "HTML Unordered List", slug: "html-unordered-list", difficulty: "easy", category: "html",
    description: `<p>Write raw HTML markup for an unordered list with the items <code>Apples</code>, <code>Bananas</code>, and <code>Cherries</code>.</p>`,
    examples: [{ input: "no input", output: "<ul><li>Apples</li><li>Bananas</li><li>Cherries</li></ul>" }],
    testCases: [
      { input: "[]", expected: "<ul>" },
      { input: "[]", expected: "<li>Apples</li>" },
      { input: "[]", expected: "<li>Bananas</li>" },
      { input: "[]", expected: "<li>Cherries</li>" },
      { input: "[]", expected: "</ul>" },
    ],
    starterCode: `<ul></ul>`,
  },
  {
    title: "HTML Heading", slug: "html-heading", difficulty: "easy", category: "html",
    description: `<p>Write raw HTML markup for a level-1 heading with the text <code>CodeArena</code>.</p>`,
    examples: [{ input: "no input", output: "<h1>CodeArena</h1>" }],
    testCases: [
      { input: "[]", expected: "<h1>" },
      { input: "[]", expected: "CodeArena" },
      { input: "[]", expected: "</h1>" },
    ],
    starterCode: `<h1></h1>`,
  },
  {
    title: "HTML Anchor Link", slug: "html-anchor-link", difficulty: "easy", category: "html",
    description: `<p>Write raw HTML markup for an anchor tag linking to <code>https://example.com</code> with the display text <code>Visit Example</code>.</p>`,
    examples: [{ input: "no input", output: `<a href="https://example.com">Visit Example</a>` }],
    testCases: [
      { input: "[]", expected: "<a" },
      { input: "[]", expected: 'href="https://example.com"' },
      { input: "[]", expected: "Visit Example" },
      { input: "[]", expected: "</a>" },
    ],
    starterCode: `<a></a>`,
  },
  {
    title: "HTML Image Tag", slug: "html-image-tag", difficulty: "easy", category: "html",
    description: `<p>Write raw HTML markup for an image tag with source <code>logo.png</code> and alt text <code>Logo</code>.</p>`,
    examples: [{ input: "no input", output: `<img src="logo.png" alt="Logo">` }],
    testCases: [
      { input: "[]", expected: "<img" },
      { input: "[]", expected: 'src="logo.png"' },
      { input: "[]", expected: 'alt="Logo"' },
    ],
    starterCode: `<img>`,
  },
  {
    title: "HTML Ordered List", slug: "html-ordered-list", difficulty: "easy", category: "html",
    description: `<p>Write raw HTML markup for an ordered list with the items <code>First</code> and <code>Second</code>.</p>`,
    examples: [{ input: "no input", output: "<ol><li>First</li><li>Second</li></ol>" }],
    testCases: [
      { input: "[]", expected: "<ol>" },
      { input: "[]", expected: "<li>First</li>" },
      { input: "[]", expected: "<li>Second</li>" },
      { input: "[]", expected: "</ol>" },
    ],
    starterCode: `<ol></ol>`,
  },
  {
    title: "HTML Navigation Bar", slug: "html-nav-bar", difficulty: "medium", category: "html",
    description: `<p>Write raw HTML markup for a navigation bar containing a list with two links: <code>Home</code> (to <code>#home</code>) and <code>About</code> (to <code>#about</code>).</p>`,
    examples: [{ input: "no input", output: `<nav><ul><li><a href="#home">Home</a></li><li><a href="#about">About</a></li></ul></nav>` }],
    testCases: [
      { input: "[]", expected: "<nav>" },
      { input: "[]", expected: 'href="#home"' },
      { input: "[]", expected: "Home" },
      { input: "[]", expected: 'href="#about"' },
      { input: "[]", expected: "About" },
      { input: "[]", expected: "</nav>" },
    ],
    starterCode: `<nav></nav>`,
  },
  {
    title: "HTML Form Input", slug: "html-form-input", difficulty: "medium", category: "html",
    description: `<p>Write raw HTML markup for a text input field inside a form with <code>type="text"</code>, <code>name="username"</code>, and placeholder <code>Enter name</code>.</p>`,
    examples: [{ input: "no input", output: `<form><input type="text" name="username" placeholder="Enter name"></form>` }],
    testCases: [
      { input: "[]", expected: "<form>" },
      { input: "[]", expected: 'type="text"' },
      { input: "[]", expected: 'name="username"' },
      { input: "[]", expected: "Enter name" },
      { input: "[]", expected: "</form>" },
    ],
    starterCode: `<form></form>`,
  },
  {
    title: "HTML Table", slug: "html-table", difficulty: "hard", category: "html",
    description: `<p>Write raw HTML markup for a table with a header row containing <code>Name</code> and <code>Age</code>, plus a data row with <code>Alice</code> and <code>25</code>.</p>`,
    examples: [{ input: "no input", output: `<table><tr><th>Name</th><th>Age</th></tr><tr><td>Alice</td><td>25</td></tr></table>` }],
    testCases: [
      { input: "[]", expected: "<table>" },
      { input: "[]", expected: "<th>Name</th>" },
      { input: "[]", expected: "Alice" },
      { input: "[]", expected: "25" },
      { input: "[]", expected: "</table>" },
    ],
    starterCode: `<table></table>`,
  },
  {
    title: "HTML Select Dropdown", slug: "html-select-dropdown", difficulty: "easy", category: "html",
    description: `<p>Write raw HTML markup for a select dropdown containing two options: <code>Red</code> and <code>Blue</code>.</p>`,
    examples: [{ input: "no input", output: "<select><option>Red</option><option>Blue</option></select>" }],
    testCases: [
      { input: "[]", expected: "<select" },
      { input: "[]", expected: "Red" },
      { input: "[]", expected: "Blue" },
      { input: "[]", expected: "</select>" },
    ],
    starterCode: `<select></select>`,
  },
  {
    title: "HTML Input Types", slug: "html-input-types", difficulty: "medium", category: "html",
    description: `<p>Write raw HTML markup for a checkbox input (<code>type="checkbox"</code>, <code>name="subscribe"</code>) and radio buttons (<code>type="radio"</code>, <code>name="color"</code>).</p>`,
    examples: [{ input: "no input", output: `<input type="checkbox" name="subscribe"><input type="radio" name="color"><input type="radio" name="color">` }],
    testCases: [
      { input: "[]", expected: 'type="checkbox"' },
      { input: "[]", expected: 'name="subscribe"' },
      { input: "[]", expected: 'type="radio"' },
      { input: "[]", expected: 'name="color"' },
    ],
    starterCode: `<input>`,
  },
  {
    title: "CSS Button Style", slug: "css-button-style", difficulty: "easy", category: "css",
    description: `<p>Write a raw CSS rule for a button with class <code>.btn</code> with a blue background (<code>#007bff</code>), white text, no border, <code>4px</code> radius, and padding <code>10px 20px</code>.</p>`,
    examples: [{ input: "no input", output: '.btn { background-color: #007bff; color: white; border: none; border-radius: 4px; padding: 10px 20px; }' }],
    testCases: [
      { input: "[]", expected: ".btn" },
      { input: "[]", expected: "background-color: #007bff" },
      { input: "[]", expected: "color: white" },
      { input: "[]", expected: "border: none" },
      { input: "[]", expected: "border-radius: 4px" },
      { input: "[]", expected: "padding: 10px 20px" },
    ],
    starterCode: `.btn {\n\n}`,
  },
  {
    title: "CSS Card Component", slug: "css-card-component", difficulty: "medium", category: "css",
    description: `<p>Write a raw CSS rule for a card with class <code>.card</code>: light gray border (<code>1px solid #e0e0e0</code>), <code>8px</code> radius, <code>20px</code> padding, and shadow <code>0 2px 8px rgba(0,0,0,0.1)</code>.</p>`,
    examples: [{ input: "no input", output: '.card { border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }' }],
    testCases: [
      { input: "[]", expected: ".card" },
      { input: "[]", expected: "border: 1px solid #e0e0e0" },
      { input: "[]", expected: "border-radius: 8px" },
      { input: "[]", expected: "padding: 20px" },
      { input: "[]", expected: "box-shadow: 0 2px 8px rgba(0,0,0,0.1)" },
    ],
    starterCode: `.card {\n\n}`,
  },
  {
    title: "CSS Text Center", slug: "css-text-center", difficulty: "easy", category: "css",
    description: `<p>Write a raw CSS rule for class <code>.title</code> that centers text (<code>text-align: center</code>) and makes it bold (<code>font-weight: bold</code>).</p>`,
    examples: [{ input: "no input", output: ".title { text-align: center; font-weight: bold; }" }],
    testCases: [
      { input: "[]", expected: ".title" },
      { input: "[]", expected: "text-align: center" },
      { input: "[]", expected: "font-weight: bold" },
    ],
    starterCode: `.title {\n\n}`,
  },
  {
    title: "CSS Flex Row", slug: "css-flex-row", difficulty: "easy", category: "css",
    description: `<p>Write a raw CSS rule for class <code>.row</code> that lays children out in a horizontal row: <code>display: flex</code>, <code>flex-direction: row</code>, <code>gap: 10px</code>.</p>`,
    examples: [{ input: "no input", output: ".row { display: flex; flex-direction: row; gap: 10px; }" }],
    testCases: [
      { input: "[]", expected: ".row" },
      { input: "[]", expected: "display: flex" },
      { input: "[]", expected: "flex-direction: row" },
      { input: "[]", expected: "gap: 10px" },
    ],
    starterCode: `.row {\n\n}`,
  },
  {
    title: "CSS Hover Effect", slug: "css-hover-effect", difficulty: "medium", category: "css",
    description: `<p>Write a raw CSS rule for <code>.link:hover</code> that changes the text color to <code>red</code> with <code>text-decoration: underline</code>.</p>`,
    examples: [{ input: "no input", output: ".link:hover { color: red; text-decoration: underline; }" }],
    testCases: [
      { input: "[]", expected: ".link:hover" },
      { input: "[]", expected: "color: red" },
      { input: "[]", expected: "text-decoration: underline" },
    ],
    starterCode: `.link:hover {\n\n}`,
  },
  {
    title: "CSS Grid Layout", slug: "css-grid-layout", difficulty: "medium", category: "css",
    description: `<p>Write a raw CSS rule for class <code>.grid</code> with three equal columns: <code>display: grid</code>, <code>grid-template-columns: 1fr 1fr 1fr</code>, <code>gap: 20px</code>.</p>`,
    examples: [{ input: "no input", output: ".grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }" }],
    testCases: [
      { input: "[]", expected: ".grid" },
      { input: "[]", expected: "display: grid" },
      { input: "[]", expected: "grid-template-columns: 1fr 1fr 1fr" },
      { input: "[]", expected: "gap: 20px" },
    ],
    starterCode: `.grid {\n\n}`,
  },
  {
    title: "CSS Border Rounded", slug: "css-border-rounded", difficulty: "easy", category: "css",
    description: `<p>Write a raw CSS rule for class <code>.avatar</code>: <code>border-radius: 50%</code>, <code>object-fit: cover</code>, width and height <code>40px</code>.</p>`,
    examples: [{ input: "no input", output: ".avatar { border-radius: 50%; object-fit: cover; width: 40px; height: 40px; }" }],
    testCases: [
      { input: "[]", expected: ".avatar" },
      { input: "[]", expected: "border-radius: 50%" },
      { input: "[]", expected: "object-fit: cover" },
      { input: "[]", expected: "width: 40px" },
      { input: "[]", expected: "height: 40px" },
    ],
    starterCode: `.avatar {\n\n}`,
  },
  {
    title: "CSS Positioning", slug: "css-positioning", difficulty: "medium", category: "css",
    description: `<p>Write a raw CSS rule for class <code>.badge</code> that pins it to the top-right corner: <code>position: absolute</code>, <code>top: 0</code>, <code>right: 0</code>.</p>`,
    examples: [{ input: "no input", output: ".badge { position: absolute; top: 0; right: 0; }" }],
    testCases: [
      { input: "[]", expected: ".badge" },
      { input: "[]", expected: "position: absolute" },
      { input: "[]", expected: "top: 0" },
      { input: "[]", expected: "right: 0" },
    ],
    starterCode: `.badge {\n\n}`,
  },
  {
    title: "CSS Media Query", slug: "css-media-query", difficulty: "hard", category: "css",
    description: `<p>Write a raw CSS media query for screens with a maximum width of <code>600px</code> that makes the <code>.container</code> width <code>100%</code>.</p>`,
    examples: [{ input: "no input", output: "@media (max-width: 600px) { .container { width: 100%; } }" }],
    testCases: [
      { input: "[]", expected: "@media" },
      { input: "[]", expected: "max-width: 600px" },
      { input: "[]", expected: ".container" },
      { input: "[]", expected: "width: 100%" },
    ],
    starterCode: `@media (max-width: 600px) {\n  .container {\n\n  }\n}`,
  },
  {
    title: "CSS Spinner Animation", slug: "css-spinner-animation", difficulty: "medium", category: "css",
    description: `<p>Write a raw CSS rule for class <code>.spinner</code> with <code>animation: spin 1s linear infinite</code>, plus a <code>@keyframes spin</code> block ending at <code>rotate(360deg)</code>.</p>`,
    examples: [{ input: "no input", output: `.spinner { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }` }],
    testCases: [
      { input: "[]", expected: ".spinner" },
      { input: "[]", expected: "animation: spin 1s linear infinite" },
      { input: "[]", expected: "@keyframes spin" },
      { input: "[]", expected: "rotate(360deg)" },
    ],
    starterCode: `.spinner {\n  animation: spin 1s linear infinite;\n}\n\n@keyframes spin {\n  from { transform: rotate(0deg); }\n  to { transform: rotate(360deg); }\n}`,
  },
];

// ---------------------------------------------------------------------------
// Build database rows
// ---------------------------------------------------------------------------

function toCodeRow(problem: CodeProblem) {
  const languages = PROBLEM_LANGUAGES.map((l) => l.id);
  return {
    title: problem.title,
    slug: problem.slug,
    difficulty: problem.difficulty,
    category: "javascript",
    description: problem.description,
    examples: JSON.stringify(problem.examples),
    testCases: JSON.stringify(problem.testCases),
    starterCode: generateStarterCode("javascript", problem.signature),
    languages,
    starterCodes: Object.fromEntries(languages.map((l) => [l, generateStarterCode(l, problem.signature)])),
  };
}

function toMarkupRow(problem: MarkupProblem) {
  return {
    title: problem.title,
    slug: problem.slug,
    difficulty: problem.difficulty,
    category: problem.category,
    description: problem.description,
    examples: JSON.stringify(problem.examples),
    testCases: JSON.stringify(problem.testCases),
    starterCode: problem.starterCode,
    languages: [problem.category],
  };
}

async function main() {
  console.log("Seeding problems...");

  const rows = [
    ...codeProblems.map(toCodeRow),
    ...markupProblems.map(toMarkupRow),
  ];

  for (const row of rows) {
    const { slug, ...data } = row;
    await prisma.problem.upsert({ where: { slug }, update: data, create: row });
  }

  const codeCount = codeProblems.length;
  const markupCount = markupProblems.length;
  console.log(`  ✓ ${codeCount} code problems (8 languages each)`);
  console.log(`  ✓ ${markupCount} markup problems (HTML/CSS)`);
  console.log(`\nSeeded ${rows.length} problems total.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
