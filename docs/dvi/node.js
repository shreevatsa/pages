const dviParsing = require('./dvi.js');

const fs = require('fs');

const buffer = fs.readFileSync('hello.dvi'); // type Buffer

const dviBuffer = new dviParsing.DVIBuffer(buffer);

while (dviBuffer.more()) {
  const op = dviBuffer.readOp();
  console.dir(op, { depth: null });
}
