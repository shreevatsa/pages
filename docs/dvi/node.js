const dviParsing = require('./dvi.js');

const fs = require('fs');

const filename = process.argv[2];
console.log(`Opening filename ${filename}`);
const buffer = fs.readFileSync(filename); // type Buffer
const uint8array = new Uint8Array(buffer);  // type Uint8Array

const dviBuffer = new dviParsing.DVIBuffer(uint8array);

while (dviBuffer.more()) {
  const command = dviBuffer.readCommand();
  console.dir(command, { depth: null });
}
