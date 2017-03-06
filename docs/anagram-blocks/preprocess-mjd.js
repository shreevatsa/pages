// -*- js2-basic-offset: 2; -*-
const fs = require('fs');
const assert = require('assert');

const lines = fs.readFileSync('anagrams-scored.txt', 'utf8').split('\n');
const allWords = new Set();
let countLines = 0;
lines.forEach((line) => {
  if (line) {
    countLines += 1;
    const [...parts] = line.split(' ');
    assert(parts.length === 3);
    const [, word1, word2] = parts;
    allWords.add(word1);
    allWords.add(word2);
  }
});
console.log('Went over', countLines, 'lines and found', allWords.size, 'distinct words.');

const allWordsSorted = Array.from(allWords).sort();
fs.writeFileSync('all-words.txt', `${allWordsSorted.join('\n')}\n`, 'utf8');
console.log('Wrote these words to all-words.txt');
