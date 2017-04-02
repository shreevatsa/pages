const dviParsing = require('./dvi.js');

const fs = require('fs');

const buffer = fs.readFileSync('hello.dvi'); // type Buffer
const uint8array = new Uint8Array(buffer);  // type Uint8Array

const dviBuffer = new dviParsing.DVIBuffer(uint8array);

while (dviBuffer.more()) {
  const command = dviBuffer.readCommand();
  console.dir(command, { depth: null });
}
