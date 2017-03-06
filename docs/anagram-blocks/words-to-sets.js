const fs = require('fs');
const assert = require('assert');

const has = Object.prototype.hasOwnProperty;

const lines = fs.readFileSync('all-words.txt', 'utf8').split('\n');
const allWordsSorted = lines.filter(line => line.length > 0);

// Break list of words into anagram sets
const anagramSets = {};
allWordsSorted.forEach((word) => {
  const canonical = Array.from(word.toLowerCase()).sort().join('');
  if (!has.call(anagramSets, canonical)) {
    anagramSets[canonical] = new Set();
  }
  anagramSets[canonical].add(word);
});
// Object.values(anagramSets).forEach(anagramSet => console.log(anagramSet));

// Count anagram sets of different sizes
const numSetsBySize = {};
Object.keys(anagramSets).forEach((canonical) => {
  const thisSize = anagramSets[canonical].size;
  if (!has.call(numSetsBySize, thisSize)) {
    numSetsBySize[thisSize] = 0;
  }
  numSetsBySize[thisSize] += 1;
});
const numSets = Object.entries(numSetsBySize).reduce(
  (total, [, numSetsForSize]) => total + numSetsForSize, 0);
const numWords = Object.entries(numSetsBySize).reduce(
  (total, [size, numSetsForSize]) => total + (numSetsForSize * size), 0);
const numPairs = Object.entries(numSetsBySize).reduce(
  (total, [size, numSetsForSize]) => total + ((numSetsForSize * size * (size - 1)) / 2), 0);

assert(numWords === allWordsSorted.length);
// assert(numPairs === countLines);
console.log('The', numWords, 'words fall into', numSets, 'sets and give', numPairs, 'pairs.');
console.log('These are the sizes:\n', numSetsBySize);

const doNTimes = function doNTimes(n, func) {
  [...Array(n)].forEach(func);
};

const symmetricDifference = function symmetricDifference(list1, list2) {
  const counts = {};
  list1.forEach((value) => { counts[value] = (value in counts) ? counts[value] + 1 : 1; });
  list2.forEach((value) => { counts[value] = (value in counts) ? counts[value] - 1 : -1; });
  const left = [];
  const right = [];
  Object.entries(counts).forEach(([key, value]) => {
    if (value === 0) return;
    if (value > 0) {
      doNTimes(value, () => left.push(key));
      // [...Array(value)].forEach(() => left.push(key));
    } else {
      doNTimes(-value, () => right.push(key));
      // [...Array(-value)].forEach(() => right.push(key));
    }
  });
  return [left, right];
};

const allPairs = function allPairs(list) {
  const n = list.length;
  const ret = [];
  for (let i = 0; i < n; i += 1) {
    for (let j = i + 1; j < n; j += 1) {
      ret.push([list[i], list[j]]);
    }
  }
  return ret;
};

const getBigrams = function getBigrams(word) {
  // return new Set([...Array(word.length - 1).keys()].map(i => word.substring(i, i + 2)))
  const ret = new Set();
  for (let a = 0; a < word.length - 1; a += 1) {
    ret.add(word.substring(a, a + 2));
  }
  return ret;
};

const forcedBlocks = function forcedBlocks(word, otherWord) {
  const allowedBigrams = getBigrams(otherWord);
  let withBreaks = word[0];
  // console.log(`Finding all forced blocks for ${word} and ${otherWord}`);
  for (let a = 1; a < word.length; a += 1) {
    const bigram = word.substring(a - 1, a + 1);
    if (!allowedBigrams.has(bigram)) {
      withBreaks += '|';
    }
    withBreaks += word[a];
  }
  // console.log(withBreaks);
  return withBreaks.split('|').sort();
};

const fullyForced = function fullyForced(word1, word2) {
  // console.log(`Finding whether ${word1} and ${word2} are fully forced.`);
  const forced1 = forcedBlocks(word1.toLowerCase(), word2.toLowerCase());
  const forced2 = forcedBlocks(word2.toLowerCase(), word1.toLowerCase());
  // Fails on example: 'abba' 'baba'. Here 'abba' splits as 'ab|ba' but 'baba' remains 'baba'
  // assert(forced1.length === forced2.length, `${word1} <-> ${word2}: ${forced1} <-> ${forced2}`);
  return [forced1, forced2];
};

let numFullyForced = 0;
let numNotFullyForced = 0;
Object.values(anagramSets).forEach((anagramSet) => {
  const anagramSetList = Array.from(anagramSet);
  const pairs = allPairs(anagramSetList);
  // console.log(`Finding all pairs from ${anagramSetList} gave ${pairs}`);
  pairs.forEach(([word1, word2]) => {
    const [forced1, forced2] = fullyForced(word1, word2);
    const ff = forced1.length === forced2.length
          && forced1.every((block, i) => forced2[i] === block);
    // console.log(word1, word2, ff);
    if (ff) {
      numFullyForced += 1;
    } else {
      console.log(`${word1}<->${word2}`);
      console.log(`${forced1}<->${forced2}`);
      console.log(symmetricDifference(forced1, forced2));
      console.log('\n');
      numNotFullyForced += 1;
    }
  });
});
console.log(numFullyForced);
console.log(numNotFullyForced);
