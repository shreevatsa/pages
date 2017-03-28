/* global window, document, FileReader, DVIBuffer */

function encodeForHtml(s) {
  let text = `${s}`;  // In case it's not a string
  text = text.replace(new RegExp('&', 'g'), '&amp;');
  text = text.replace(new RegExp('<', 'g'), '&lt;');
  text = text.replace(new RegExp('>', 'g'), '&gt;');
  text = text.replace(new RegExp('"', 'g'), '&quot;');
  text = text.replace(new RegExp("'", 'g'), '&#x27;');
  text = text.replace(new RegExp('/', 'g'), '&#x2F;');
  return text;
}

/* eslint-disable no-multi-spaces */
const helloWorldBytes = new Uint8Array([
  247, 2, 1, 131,  146, 192, 28, 59,        0, 0, 0, 0,  3, 232, 27, 32,
  84, 101, 88, 32,  111, 117, 116, 112,        117, 116, 32, 50,  48, 49, 55, 46,
  48, 51, 46, 50,  56, 58, 48, 49,        52, 51, 139, 0,  0, 0, 1, 0,
  0, 0, 0, 0,  0, 0, 0, 0,        0, 0, 0, 0,  0, 0, 0, 0,
  0, 0, 0, 0,  0, 0, 0, 0,        0, 0, 0, 0,  0, 0, 0, 0,
  0, 0, 0, 255,  255, 255, 255, 141,        159, 242, 0, 0,  142, 160, 2, 131,
  51, 218, 141, 160,  253, 134, 204, 38,        141, 145, 20, 0,  0, 243, 0, 75,
  241, 96, 121, 0,  10, 0, 0, 0,        10, 0, 0, 0,  5, 99, 109, 114,
  49, 48, 171, 72,  101, 108, 108, 111,        44, 145, 3, 85,  85, 119, 144, 184,
  227, 111, 114, 108,  100, 33, 142, 142,        159, 24, 0, 0,  141, 146, 0, 232,
  96, 163, 49, 142,  140, 248, 0, 0,        0, 42, 1, 131,  146, 192, 28, 59,
  0, 0, 0, 0,  3, 232, 2, 155,        51, 218, 1, 213,  193, 71, 0, 2,
  0, 1, 243, 0,  75, 241, 96, 121,        0, 10, 0, 0,  0, 10, 0, 0,
  0, 5, 99, 109,  114, 49, 48, 249,        0, 0, 0, 165,  2, 223, 223, 223,
  223, 223, 223, 223,
]);
/* eslint-enable no-multi-spaces */

// The "model"
let bufferBeingUsed = helloWorldBytes;
let bufferBeingUsedName = 'hello-world.dvi';
let bufferBeingUsedSize = bufferBeingUsed.length;

// Updating the "view"
function introText(name, size) {
  return `Showing the DVI file <tt>${encodeForHtml(name)}</tt>, of size ${encodeForHtml(size)} bytes. To change this, upload a different file above.`;
}

function populateIntro() {
  document.getElementById('intro').innerHTML = introText(bufferBeingUsedName, bufferBeingUsedSize);
}

window.addEventListener('load', populateIntro);

function populateTmpHexdump(message) {
  console.log(message);
  const hexdump = document.getElementById('hexdump');
  hexdump.removeChild(hexdump.lastChild);
  hexdump.appendChild(document.createTextNode(message));
}

// TODO: Use Web Workers for this, as it can take quite a while.
function annotatedDviBytes(/* Uint8Array */ byteArray) {
  const t = document.createElement('pre');
  let i = 0;
  while (i < byteArray.length) {
    const n = byteArray[i];
    const tmp = (`00${n.toString(16)}`).substr(-2);
    let s = ` <span data-byte="${i}">${tmp}`;
    i += 1;
    if (i % 16 === 8) {
      s += ' ';
    } else if (i % 16 === 0) {
      s += '\n';
    }
    t.innerHTML += s;
  }
  t.innerHTML += '\n    (End of hexdump)';
  return t;
}


function populateHexdump() {
  console.log('Getting annotation');
  const byteTable = annotatedDviBytes(bufferBeingUsed); // a DOM element
  console.log('Got annotation');
  const hexdump = document.getElementById('hexdump');
  hexdump.removeChild(hexdump.lastChild);
  console.log('Appending child');
  hexdump.appendChild(byteTable);
  console.log('Done populating hexdump, do you see it yet?');

  const dviBuffer = new DVIBuffer(bufferBeingUsed);
  while (dviBuffer.more()) {
    const op = dviBuffer.readOp();
    console.dir(op, { depth: null });
  }
}
window.addEventListener('load', populateHexdump);

function updateBuffer(byteArray) {
  populateTmpHexdump('Updating buffer');
  bufferBeingUsed = byteArray;
  populateTmpHexdump('Updating final hexdump');
  populateHexdump();
}

function handleFiles() {
  // const f = event.target.files[0]; // FileList object
  const f = this.files[0];
  bufferBeingUsedName = f.name;
  bufferBeingUsedSize = f.size;
  populateIntro();
  populateTmpHexdump('Reading file...');
  const reader = new FileReader();
  reader.onload = function setBuffer() {
    populateTmpHexdump('Turning result into array...');
    updateBuffer(new Uint8Array(reader.result)); // reader.result is an ArrayBuffer
  };
  reader.readAsArrayBuffer(f);
}
document.getElementById('inputDviFile').addEventListener('change', handleFiles, false);
