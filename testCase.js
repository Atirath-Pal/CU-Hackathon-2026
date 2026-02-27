// testCase.js
const testCases = {
    "two-sum": [
        { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
        { input: [[3, 2, 4], 6], expected: [1, 2] },
        { input: [[3, 3], 6], expected: [0, 1] }
    ],
    "add-two-numbers": [
        { input: [[2, 4, 3], [5, 6, 4]], expected: [7, 0, 8] },
        { input: [[0], [0]], expected: [0] },
        { input: [[9, 9, 9, 9, 9, 9, 9], [9, 9, 9, 9]], expected: [8, 9, 9, 9, 0, 0, 0, 1] }
    ],
    "longest-substring-without-repeating-characters": [
        { input: ["abcabcbb"], expected: 3 },
        { input: ["bbbbb"], expected: 1 },
        { input: ["pwwkew"], expected: 3 }
    ],
    "median-of-two-sorted-arrays": [
        { input: [[1, 3], [2]], expected: 2.0 },
        { input: [[1, 2], [3, 4]], expected: 2.5 }
    ],
    "longest-palindromic-substring": [
        { input: ["babad"], expected: "bab" },
        { input: ["cbbd"], expected: "bb" }
    ],
    "zigzag-conversion": [
        { input: ["PAYPALISHIRING", 3], expected: "PAHNAPLSIIGYIR" },
        { input: ["A", 1], expected: "A" }
    ]
};

module.exports = testCases;