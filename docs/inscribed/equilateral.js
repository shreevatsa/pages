const board = JXG.JSXGraph.initBoard('jxgbox', {boundingbox: [-5, 2, 5, -2], showCopyright: false});

function segment(p1, p2) {
    return board.create('line', [p1, p2], {straightFirst: false, straightLast: false});
}

// Triangle ABC. All points arbitrary.
const A = board.create('point', [-3,1],  {name: 'A'});
const B = board.create('point', [-4,-1], {name: 'B'});
const C = board.create('point', [-1,-1], {name: 'C'});
const a = segment(B, C);
const b = segment(C, A);
const c = segment(A, B);
const ABC = board.create('polygon', [A, B, C], {hasInnerPoints: true});
ABC.hideElement();
for (const elem of [A, B, C, a, b, c]) {
    const grey = '#444444';
    elem.setAttribute({strokeColor: grey});
    elem.setAttribute({fillColor: grey});
}

// Triangle XYZ. Points X and Y are arbitrary, but Z is Y rotated pi/3 around X.
const X = board.create('point', [-3.1, 0.2], {name: 'X'});
const Y = board.create('point', [-3.2, -0.6], {name: 'Y'});
const rotateaboutX = board.create('transform', [Math.PI/3, X], {type: 'rotate'});
const Z = board.create('point', [Y, rotateaboutX], {name: 'Z'});
// board.create('group', [X, Y, Z]);
const x = segment(Y, Z);
const y = segment(Z, X);
const z = segment(X, Y);

function insideABC(points) {
    return points.every(p => ABC.hasPoint(p.coords.scrCoords[1], p.coords.scrCoords[2]));
}

// The coordinates of the centroid of triangle [p, q, r]
function centroidCoords(p, q, r) {
    const cx = (p.coords.usrCoords[1] + q.coords.usrCoords[1] + r.coords.usrCoords[1]) / 3;
    const cy = (p.coords.usrCoords[2] + q.coords.usrCoords[2] + r.coords.usrCoords[2]) / 3;
    return [cx, cy];
}
XYZcentroid = centroidCoords(X, Y, Z);

function canScaleXYZby(t) {
    // Using scrCoords in order to use hasPoint
    const cx = (X.coords.scrCoords[1] + Y.coords.scrCoords[1] + Z.coords.scrCoords[1]) / 3;
    const cy = (X.coords.scrCoords[2] + Y.coords.scrCoords[2] + Z.coords.scrCoords[2]) / 3;
    return [X, Y, Z].every(p => ABC.hasPoint(
        cx + (p.coords.scrCoords[1] - cx) * t,
        cy + (p.coords.scrCoords[2] - cy) * t));
}

// By how much can I scale triangle XYZ and remain inside ABC?
function howMuchScaleXYZ() {
    let lo = 1;
    while (lo > 0 && !canScaleXYZby(lo)) lo /= 2;
    if (lo == 0) return -1;
    let hi = lo;
    while (canScaleXYZby(hi)) hi *= 2;
    // Invariant: Can scale by lo, cannot scale by hi
    let mid;
    console.assert(hi > lo, 'not greater: ' + hi + ' versus ' + lo);
    while (hi - lo > 1e-6) {
        mid = lo + (hi - lo) / 2;
        if (canScaleXYZby(mid)) lo = mid;
        else hi = mid;
    }
    return mid;
}

function ScaleXYZ(k, duration) {
    const [cx, cy] = centroidCoords(X, Y, Z);
    [X, Y, Z].forEach(p => p.moveTo(
        [cx + (p.coords.usrCoords[1] - cx) * k,
         cy + (p.coords.usrCoords[2] - cy) * k],
        duration));
}

// ScaleXYZ(howMuchScaleXYZ(), 1000);
