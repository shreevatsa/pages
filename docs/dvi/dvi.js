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
    if (ret > (1 << 31)) {
      ret -= (1 << 32);
    }
    return ret;
  }

  readIntThreeSigned() {
    let ret = this.readIntThree();
    if (ret > (1 << 23)) {
      ret -= (1 << 24);
    }
    return ret;
  }

  readString(n) {
    const ret = this.f.toString('utf8', this.pos, this.pos + n);
    this.pos += n;
    return ret;
  }

  readBytes(n) {
    const ret = Array.from(this.f.slice(this.pos, this.pos + n));
    this.pos += n;
    return ret;
  }

  readOp() {
    const opCode = this.readByte();
    // pre
    if (opCode === 247) {
      const parI = this.readByte(); // dvi version
      const parNum = this.readIntFour();
      const parDen = this.readIntFour();
      const parMag = this.readIntFour();
      const parK = this.readByte();
      const parX = this.readString(parK);
      return {
        op: ['pre', 'Preamble'],
        params: [
          { i: [parI, 'The DVI version (always 2)'] },
          { num: [parNum, 'The numerator of the fraction to multiply measurements by, to get distances in units of 100 nm (usually: 2.54 x 10^7)'] },
          { den: [parDen, 'The denominator of the fraction to multiply measurements by, to get distances in units of 100 nm (usually: 2^16)'] },
          { mag: [parMag, 'A thousand times the desired magnification (usually: 1000)'] },
          { k: [parK, 'The length of the comment'] },
          { x: [parX, 'The comment'] },
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
    throw Error(`Unknown op ${opCode}`);
  }
}

exports.DVIBuffer = DVIBuffer;
