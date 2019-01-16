// This somehow miraculously works:
// https://stackoverflow.com/questions/17191945/conversion-between-utf-8-arraybuffer-and-string/17192845#17192845
// Hmm it doesn't work with byte 128 (0x80, '%80') in array... so requires valid UTF-8... of course.
function Uint8ArrayToText(array) {
  // Example: array = Uint8Array [ 45, 49, 48, 48, 48, 46, 48, 112, 116 ]
  const dumbChars = [];
  for (let c of array) dumbChars.push(String.fromCharCode(c));
  const dumbStr = dumbChars.join(); // This will contain one character for each UTF-8 code unit.
  const encoded = escape(dumbStr);
  try {
    // This will decode if valid UTF-8
    const decoded = decodeURIComponent(encoded);
    return decoded;
  } catch {
    return dumbStr;
  }
}

class DVIBuffer {
  constructor(buffer) {
    this.f = buffer;
    this.pos = 0;
    this.len = buffer.byteLength;
  }

  more() {
    return this.pos < this.len;
  }

  readByte() {
    const byte = this.f[this.pos];
    this.pos += 1;
    return byte;
  }

  readIntTwo() {
    return (this.readByte() << 8) + this.readByte();
  }

  readIntThree() {
    return (this.readByte() << 16) + this.readIntTwo();
  }

  readIntFour() {
    return (this.readByte() << 24) + this.readIntThree();
  }

  readIntFourSigned() {
    let ret = this.readIntFour();
    if (ret >= (1 << 31)) {
      ret -= (1 << 32);
    }
    return ret;
  }

  readIntThreeSigned() {
    let ret = this.readIntThree();
    if (ret >= (1 << 23)) {
      ret -= (1 << 24);
    }
    return ret;
  }

  readIntTwoSigned() {
    let ret = this.readIntTwo();
    if (ret >= (1 << 15)) {
      ret -= (1 << 16);
    }
    return ret;
  }

  readIntSigned() {
    let ret = this.readByte();
    if (ret >= (1 << 7)) {
      ret -= (1 << 8);
    }
    return ret;
  }

  readString(n) {
    // This would work with NodeJS Buffer but does not convert to text with Uint8Array
    // const ret = this.f.toString('utf8', this.pos, this.pos + n);
    const arr = this.f.slice(this.pos, this.pos + n);
    // const ret = new TextDecoder('utf-8').decode(arr);
    const ret = Uint8ArrayToText(arr);
    this.pos += n;
    return ret;
  }

  readBytes(n) {
    const ret = Array.from(this.f.slice(this.pos, this.pos + n));
    this.pos += n;
    return ret;
  }

  readCommand() {
    const opCode = this.readByte();
    // pre
    if (opCode === 247) {
      const parI = this.readByte(); // dvi version
      if (parI !== 2) {
	console.error(`What does it mean for a DVI file to have version (ID number) ${parI}?`);
      }
      const parNum = this.readIntFour();
      const parDen = this.readIntFour();
      const parMag = this.readIntFour();
      const parK = this.readByte();
      const parX = this.readString(parK);
      return {
        op: ['pre', 'Preamble'],
        params: [
          { i: [parI, 'The DVI version (always 2)'] },
          { num: [parNum, 'The numerator of the fraction to multiply measurements by, to get distances in units of 10⁻⁷ m (usually: 25400000)'] },
          { den: [parDen, 'The denominator of the fraction to multiply measurements by, to get distances in units of 100 nm (usually: 7227×2¹⁶ = 473628672)'] },
          { mag: [parMag, 'A thousand times the desired magnification (usually: 1000)'] },
          { k: [parK, 'The length of the comment'] },
          { x: [parX, 'The comment'] },
        ],
      };
    }
    // post
    if (opCode === 248) {
      const parP = this.readIntFourSigned();
      const parNum = this.readIntFour();
      const parDen = this.readIntFour();
      const parMag = this.readIntFour();
      const parL = this.readIntFour();
      const parU = this.readIntFour();
      const parS = this.readIntTwo();
      const parT = this.readIntTwo();
      return {
        op: ['post', 'Beginning of the postamble'],
        params: [
          { p: [parP, 'Pointer to the final `bop` in the page.'] },
          { num: [parNum, 'The numerator of the fraction to multiply measurements by, to get distances in units of 100 nm (usually: 2.54 x 10^7)'] },
          { den: [parDen, 'The denominator of the fraction to multiply measurements by, to get distances in units of 100 nm (usually: 2^16)'] },
          { mag: [parMag, 'A thousand times the desired magnification (usually: 1000)'] },
          { l: [parL, 'The height plus depth of the tallest page'] },
          { u: [parU, 'The width of the widest page'] },
          { s: [parS, 'The maximum stack depth needed to process this file'] },
          { t: [parT, 'The total number of pages present'] },
        ],
      };
    }
    // post_post
    if (opCode === 249) {
      const parQ = this.readIntFourSigned();
      const parI = this.readByte();
      let tailLen = 0;
      while (this.more()) {
        const tail = this.readByte();
        tailLen += 1;
        if (tail !== 223) {
          // TODO: Do something better here
          console.error('Invalid');
        }
      }
      if (tailLen < 4) {
        // TODO: Do something better here
        console.error('Invalid');
      }
      // console.error('All OK!');
      return {
        op: ['post_post', 'End of the postamble'],
        params: [
          { q: [parQ, 'Pointer to the `post` command that started the postamble'] },
          { i: [parI, 'The identification byte for the DVI version (same as in the preamble)'] },
        ],
      };
    }
    // bop
    if (opCode === 139) {
      const parC0 = this.readIntFour();
      const parC1 = this.readIntFour();
      const parC2 = this.readIntFour();
      const parC3 = this.readIntFour();
      const parC4 = this.readIntFour();
      const parC5 = this.readIntFour();
      const parC6 = this.readIntFour();
      const parC7 = this.readIntFour();
      const parC8 = this.readIntFour();
      const parC9 = this.readIntFour();
      const parP = this.readIntFourSigned();
      return {
        op: ['bop', 'Beginning of page'],
        params: [
          { c0: [parC0, 'The page number (The value of \\count0 in TeX at the time \\shipout was invoked for this page)'] },
          { c1: [parC1, 'The value of \\count1 in TeX at the time \\shipout was invoked for this page'] },
          { c2: [parC2, 'The value of \\count2 in TeX at the time \\shipout was invoked for this page'] },
          { c3: [parC3, 'The value of \\count3 in TeX at the time \\shipout was invoked for this page'] },
          { c4: [parC4, 'The value of \\count4 in TeX at the time \\shipout was invoked for this page'] },
          { c5: [parC5, 'The value of \\count5 in TeX at the time \\shipout was invoked for this page'] },
          { c6: [parC6, 'The value of \\count6 in TeX at the time \\shipout was invoked for this page'] },
          { c7: [parC7, 'The value of \\count7 in TeX at the time \\shipout was invoked for this page'] },
          { c8: [parC8, 'The value of \\count8 in TeX at the time \\shipout was invoked for this page'] },
          { c9: [parC9, 'The value of \\count9 in TeX at the time \\shipout was invoked for this page'] },
          { p: [parP, 'A pointer to the previous bop (beginning of page) command'] },
        ],
      };
    }
    // eop
    if (opCode === 140) {
      return {
        op: ['eop', 'End of page: Print what you have read since the previous bop. At this point the stack should be empty.'],
      };
    }
    // push
    if (opCode === 141) {
      return {
        op: ['push', 'Push the current values of (h, v, w, x, y, z) onto the top of the stack; do not change any of those values.'],
      };
    }
    // pop
    if (opCode === 142) {
      return {
        op: ['pop', 'Pop the top six values off of the stack and assign them to (h,v,w,x,y,z).'],
      };
    }

    // set_char_i
    if (opCode >= 0 && opCode <= 127) {
      const chr = (opCode >= 32 && opCode <= 126) ? String.fromCharCode(opCode) : '?';
      return {
        op: [`set_char_${opCode}`, `Typeset character ${opCode} (${chr}) and move right.`],
      };
    }
    // set1
    if (opCode == 128) {
      const parC = this.readByte();
      const chr = String.fromCharCode(parC);
      return {
        op: [`set1`, `Typeset character ${parC} (${chr}) and move right.`],
	params: [
	  { c: [parC, 'The character to typeset.'] },
	],
      };
    }
    // set2
    if (opCode == 129) {
      const parC = this.readIntTwo();
      const chr = String.fromCharCode(parC);
      return {
        op: [`set1`, `Typeset character ${parC} (${chr}) and move right.`],
	params: [
	  { c: [parC, 'The character to typeset.'] },
	],
      };
    }
    // TODO: 130 = set3, 131 = set4
    // set_rule
    if (opCode == 132) {
      const parA = this.readIntFourSigned();
      const parB = this.readIntFourSigned();
      return {
	op: ['set_rule', 'Typeset a solid black rectangle of height a and width b (if both are positive), with its bottom left corner at (h, v). Then move right by b.'],
	params: [
	  { a: [parA, 'The height of the rectangle to typeset.'] },
	  { b: [parB, 'The width of the rectangle to typeset.' ] },
	],
      };
    }
    // TODO: 133 134 135 136 put1, put2, put3, put4
    // put_rule
    if (opCode == 137) {
      const parA = this.readIntFourSigned();
      const parB = this.readIntFourSigned();
      return {
	op: ['put_rule', 'Typeset a solid black rectangle of height a and width b (if both are positive), with its bottom left corner at (h, v).'],
	params: [
	  { a: [parA, 'The height of the rectangle to typeset.'] },
	  { b: [parB, 'The width of the rectangle to typeset.' ] },
	],
      };
    }
    // TODO: 138 = nop
    // 139 140 141 412 covered above
    // right1
    if (opCode === 143) {
      const parB = this.readIntSigned();
      return {
        op: ['right1', 'Set h <- h + b, i.e., Move right `b` units'],
        params: [
          { b: [parB, 'The number of units to move right'] },
        ],
      };
    }
    // right2
    if (opCode === 144) {
      const parB = this.readIntTwoSigned();
      return {
        op: ['right2', 'Set h <- h + b, i.e., Move right `b` units'],
        params: [
          { b: [parB, 'The number of units to move right'] },
        ],
      };
    }
    // right3
    if (opCode === 145) {
      const parB = this.readIntThreeSigned();
      return {
        op: ['right3', 'Set h <- h + b, i.e., Move right `b` units'],
        params: [
          { b: [parB, 'The number of units to move right'] },
        ],
      };
    }
    // right4
    if (opCode === 146) {
      const parB = this.readIntFourSigned();
      return {
        op: ['right4', 'Set h <- h + b, i.e., Move right `b` units'],
        params: [
          { b: [parB, 'The number of units to move right'] },
        ],
      };
    }
    // w0
    if (opCode == 147) {
      return {
	op: ['w0', 'Set h <- h + w, i.e. move right by the current value of w.'],
      };
    }
    // w1
    if (opCode == 148) {
      const parB = this.readIntSigned();
      return {
	op: ['w1', 'Set w <- w + b and h <- h + b, i.e. change the current w spacing to b, and move right by b.'],
	params: [
	  { b: [parB, 'The number of units to move right'] },
	],
      };
    }
    // w2
    if (opCode == 149) {
      const parB = this.readIntTwoSigned();
      return {
	op: ['w2', 'Set w <- w + b and h <- h + b, i.e. change the current w spacing to b, and move right by b.'],
	params: [
	  { b: [parB, 'The number of units to move right'] },
	],
      };
    }
    // w3
    if (opCode == 150) {
      const parB = this.readIntThreeSigned();
      return {
	op: ['w3', 'Set w <- w + b and h <- h + b, i.e. change the current w spacing to b, and move right by b.'],
	params: [
	  { b: [parB, 'The number of units to move right'] },
	],
      };
    }
    // TODO: 151 = w4
    // x0
    if (opCode == 152) {
      return {
	op: ['x0', 'Set h <- h + x, i.e. move right by x.'],
      };
    }
    // x1
    if (opCode == 153) {
      const parB = this.readIntSigned();
      return {
	op: ['x1', 'Set x <- b and h <- x + b, i.e. change the current x spacing to b, and move right by b.'],
	params: [
	  { b: [parB, 'The number of units to move right'], },
	],
      };
    }
    // x2
    if (opCode == 154) {
      const parB = this.readIntTwoSigned();
      return {
	op: ['x2', 'Set x <- b and h <- x + b, i.e. change the current x spacing to b, and move right by b.'],
	params: [
	  { b: [parB, 'The number of units to move right'], },
	],
      };
    }
    // x3
    if (opCode == 155) {
      const parB = this.readIntThreeSigned();
      return {
	op: ['x3', 'Set x <- b and h <- x + b, i.e. change the current x spacing to b, and move right by b.'],
	params: [
	  { b: [parB, 'The number of units to move right'], },
	],
      };
    }
    // x4
    if (opCode == 156) {
      const parB = this.readIntFourSigned();
      return {
	op: ['x4', 'Set x <- b and h <- x + b, i.e. change the current x spacing to b, and move right by b.'],
	params: [
	  { b: [parB, 'The number of units to move right'], },
	],
      };
    }
    // down1
    if (opCode === 157) {
      const parA = this.readIntSigned();
      return {
        op: ['down1', 'Set v <- v + a, i.e., move down `a` units'],
        params: [
          { a: [parA, 'The number of units to move down.'] },
        ],
      };
    }
    // down2
    if (opCode === 158) {
      const parA = this.readIntTwoSigned();
      return {
        op: ['down2', 'Set v <- v + a, i.e., move down `a` units'],
        params: [
          { a: [parA, 'The number of units to move down.'] },
        ],
      };
    }
    // down3
    if (opCode === 159) {
      const parA = this.readIntThreeSigned();
      return {
        op: ['down3', 'Set v <- v + a, i.e., move down `a` units'],
        params: [
          { a: [parA, 'The number of units to move down.'] },
        ],
      };
    }
    // down4
    if (opCode === 160) {
      const parA = this.readIntFourSigned();
      return {
        op: ['down4', 'Set v <- v + a, i.e., move down `a` units'],
        params: [
          { a: [parA, 'The number of units to move down.'] },
        ],
      };
    }
    // y0
    if (opCode == 161) {
      return {
	op: ['y0', 'Set v <- v + a, i.e. move down by the current value of y.'],
      };
    }
    // TODO: 162 = y1, 163 = y2
    // y3
    if (opCode == 164) {
      const parA = this.readIntThreeSigned();
      return {
	op: ['y3', 'Set y <- a and v <- v + a, i.e. change the current y spacing, and move down by a.'],
	params: [
	  { a: [parA, 'The number of units to move down.'] },
	],
      };
    }
    // y4
    if (opCode == 165) {
      const parA = this.readIntFourSigned();
      return {
	op: ['y4', 'Set y <- a and v <- v + a, i.e. change the current y spacing, and move down by a.'],
	params: [
	  { a: [parA, 'The number of units to move down.'] },
	],
      };
    }
    // z0
    if (opCode == 166) {
      return {
	op: ['z0', 'Set v <- v + z, i.e. move down by the current value of z.'],
      };
    }
    // TODO: 167 = z1, 168 = z2
    // z3
    if (opCode == 169) {
      const parA = this.readIntThreeSigned();
      return {
	op: ['z3', 'Set z <- a and v <- v + a, i.e. change the current z spacing to a, and move down by a.'],
	params: [
	  { a: [parA, 'The number of units to move down.'] },
	],
      };
    }
    // z4
    if (opCode == 170) {
      const parA = this.readIntFourSigned();
      return {
	op: ['z4', 'Set z <- a and v <- v + a, i.e. change the current z spacing to a, and move down by a.'],
	params: [
	  { a: [parA, 'The number of units to move down.'] },
	],
      };
    }
    // fnt_num_0
    if (opCode === 171) {
      return {
        op: ['fnt_num_0', 'Set f to 0. Font 0 must have been previously defined.'],
      };
    }
    // fnt_num_i
    if (opCode >= 172 && opCode <= 234) {
      const num = opCode - 171;
      return {
	op: [`fnt_num_${num}`, `Set f to ${num}. Font ${num} must have been previously defined.`],
      };
    }
    // fnt1
    if (opCode == 235) {
      const parK = this.readByte();
      if (parK < 64 || parK >= 256) console.error(`Unexpected font number ${parK}`);
      return {
	op: ['fnt1', `Set font number f to ${parK}`],
	params: [
	  { k: [parK, 'The font number to set to.'] },
	],
      };
    }
    // TODO: 236 = fnt2, 237 = fnt3, 238 = fnt4
    // xxx1
    if (opCode == 239) {
      const parK = this.readByte();
      const parX = this.readString(parK);
      return {
	op: ['xxx1', 'A DVI special.'],
	params: [
	  { k: [parK, 'The number of bytes in the special'] },
	  { x: [parX, 'The string that is the text of the special'] },
	],
      };
    }
    // xxx2
    if (opCode == 240) {
      const parK = this.readIntTwo();
      const parX = this.readString(parK);
      return {
	op: ['xxx4', 'A DVI special.'],
	params: [
	  { k: [parK, 'The number of bytes in the special'] },
	  { x: [parX, 'The string that is the text of the special'] },
	],
      };
    }
    // TODO: 241 = xxx3
    // xxx4
    if (opCode == 242) {
      const parK = this.readIntFour();
      const parX = this.readString(parK);
      return {
	op: ['xxx4', 'A DVI special.'],
	params: [
	  { k: [parK, 'The number of bytes in the special'] },
	  { x: [parX, 'The string that is the text of the special'] },
	],
      };
    }
    // fnt_def1
    if (opCode === 243) {
      const parK = this.readByte();
      const parC = this.readIntFour();
      const parS = this.readIntFour();
      const parD = this.readIntFour();
      const parA = this.readByte();
      const parL = this.readByte();
      const parN = this.readString(parA + parL);
      return {
        op: ['fnt_def1', 'Define font'],
        params: [
          { k: [parK, 'The font number being defined'] },
          { c: [parC, 'The checksum that TeX found in the tfm file for this font'] },
          { s: [parS, 'The scale ("at" size)'] },
          { d: [parD, 'The design size'] },
          { a: [parA, 'The length of the "area" or directory'] },
          { l: [parL, 'The length of the font name itself'] },
          { n: [parN, 'The path+name of the font'] },
        ],
      };
    }
    // TODO: 244 = fnt_def2, 245 = fnt_def3, 236 = fnt_def4
    throw Error(`Unknown op ${opCode}`);
  }
}

exports.DVIBuffer = DVIBuffer;
