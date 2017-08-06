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
// const XYZ = board.create('polygon', [X, Y, Z], {hasInnerPoints: true});
// const g = board.create('group', [X, Y, Z]);

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
    console.assert(hi > lo, 'not greater: ' + hi + ' versus ' + lo);
    while (hi - lo > 1e-6) {
        const mid = lo + (hi - lo) / 2;
        if (canScaleXYZby(mid)) lo = mid;
        else hi = mid;
    }
    return lo;
}

function scaleXYZ(k, duration) {
    const [cx, cy] = centroidCoords(X, Y, Z);
    [X, Y, Z].forEach(p => p.moveTo(
        [cx + (p.coords.usrCoords[1] - cx) * k,
         cy + (p.coords.usrCoords[2] - cy) * k],
        duration));
}

// A (dx, dy) perpendicular to the line, and in the direction of XYZ (farthest of the three), and of unit distance.
function normalDirection(line) {
    // First find the vertex farthest from line, in order to get a proper arrow for line's perpendicular bisector
    let bestV, bestDx, bestDy, bestDistance;
    [X, Y, Z].forEach(v => {
        const base = board.create('orthogonalprojection', [line, v]);
        const path = board.create('perpendicularsegment', [line, v]);
        let dx = (v.coords.scrCoords[1] - base.coords.scrCoords[1]);
        let dy = (v.coords.scrCoords[2] - base.coords.scrCoords[2]);
        board.removeObject(base);
        board.removeObject(path);
        const distance = Math.hypot(dx, dy);
        if (bestV == undefined || distance > bestDistance) {
            bestV = v;
            bestDx = dx;
            bestDy = dy;
            bestDistance = distance;
        }
    });
    bestDx /= bestDistance;
    bestDy /= bestDistance;
    return [bestDx, bestDy];
}

// Can I translate the triangle XYZ by distance d, away from edge l?
function canTranslateXYZby(d, l) {
    const [dx, dy] = normalDirection(l);
    console.log('found normalDirection');
    // Now try translating all the points by distance d along (dx, dy)
    const ret = [X, Y, Z].every(v => ABC.hasPoint(v.coords.scrCoords[1] + dx * d, v.coords.scrCoords[2] + dy * d));
    console.log('checked every');
    return ret;
}

function howMuchTranslateXYZ(l) {
    console.log('in howMuchTranslateXYZ');
    let lo = 1;
    while (lo > 0 && !canTranslateXYZby(lo, l)) lo /= 2;
    console.log('found lo');
    if (lo == 0) return -1;
    let hi = lo;
    while (canTranslateXYZby(hi, l)) hi *= 2;
    console.log('found hi');
    // Invariant: Can translate by lo, cannot translateby hi
    console.assert(hi > lo, 'not greater: ' + hi + ' versus ' + lo);
    while (hi - lo > 1e-6) {
        console.log('bs iteration');
        const mid = lo + (hi - lo) / 2;
        if (canTranslateXYZby(mid, l)) lo = mid;
        else hi = mid;
    }
    console.log('done binary search');
    return lo;
}

// Translate the triangle away from l by distance d
function translateXYZ(l, d, duration) {
    const [dx, dy] = normalDirection(l);
    [X, Y, Z].forEach(p => {
        const sx = p.coords.scrCoords[1];
        const sy = p.coords.scrCoords[2];
        const coordsFull = new JXG.Coords(JXG.COORDS_BY_SCREEN, [sx + 2*d*dx, sy + 2*d*dy], board);
        const nxFull = coordsFull.usrCoords[1];
        const nyFull = coordsFull.usrCoords[2];
        const coordsHalf = new JXG.Coords(JXG.COORDS_BY_SCREEN, [sx + d*dx, sy + d*dy], board);
        const nxHalf = coordsHalf.usrCoords[1];
        const nyHalf = coordsHalf.usrCoords[2];
        p.moveTo([nxFull, nyFull], duration);
        window.setTimeout(() => p.moveTo([nxHalf, nyHalf], duration), duration * 1.5);
    });
}

function translateXYZbest(duration) {
    // Find the (line, vertex) pair that are closest
    let whichLine, bestDistance;
    [a, b, c].forEach(line => {
        // Find the vertex closest from line
        let minDistance;
        [X, Y, Z].forEach(v => {
            const base = board.create('orthogonalprojection', [line, v]);
            const path = board.create('perpendicularsegment', [line, v]);
            let dx = (v.coords.scrCoords[1] - base.coords.scrCoords[1]);
            let dy = (v.coords.scrCoords[2] - base.coords.scrCoords[2]);
            board.removeObject(base);
            board.removeObject(path);
            const distance = Math.hypot(dx, dy);
            if (minDistance == undefined || distance < minDistance) {
                minDistance = distance;
            }
        });
        if (bestDistance == undefined || minDistance < bestDistance) {
            whichLine = line;
            bestDistance = minDistance;
        }
    });
    translateXYZ(whichLine, howMuchTranslateXYZ(whichLine) / 2, duration);
}

// scaleXYZ(howMuchScaleXYZ(), 1000);
// console.log(howMuchTranslateXYZ(a));
// console.log(howMuchTranslateXYZ(b));
// console.log(howMuchTranslateXYZ(c));
