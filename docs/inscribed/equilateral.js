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

function ABChasPoint(px, py) {
    const coords = new JXG.Coords(JXG.COORDS_BY_USER, [px, py], board);
    const nx = coords.scrCoords[1];
    const ny = coords.scrCoords[2];
    return ABC.hasPoint(nx, ny);
}

/*********************************** Scaling ***********************************/
// Can we scale XYZ by a factor of t about its centroid, and still remain inside ABC?
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
    console.assert(lo > 0, 'cannot scale at all: is the centroid outside?');
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

// Scale the triangle by a factor of k, taking time "duration" to do it.
function scaleXYZ(k, duration) {
    const cx = (X.coords.usrCoords[1] + Y.coords.usrCoords[1] + Z.coords.usrCoords[1]) / 3;
    const cy = (X.coords.usrCoords[2] + Y.coords.usrCoords[2] + Z.coords.usrCoords[2]) / 3;
    [X, Y, Z].forEach(p => p.moveTo(
        [cx + (p.coords.usrCoords[1] - cx) * k,
         cy + (p.coords.usrCoords[2] - cy) * k],
        duration));
}

/*********************************** Translating away from a line ***********************************/
// A (dx, dy) perpendicular to the ray (p -> q), and of unit distance.
function normalDirection(line) {
    const [p, q] = line;
    const [dx, dy] = [q.coords.usrCoords[1] - p.coords.usrCoords[1],
                      q.coords.usrCoords[2] - p.coords.usrCoords[2]];
    const distance = Math.hypot(dx, dy);
    return [-dy/distance, dx/distance];
}

// Can I translate the triangle XYZ by distance d, away from edge l?
function canTranslateXYZby(d, l) {
    const [dx, dy] = normalDirection(l);
    const ret = [X, Y, Z].every(v => ABChasPoint(v.coords.usrCoords[1] + dx * d, v.coords.usrCoords[2] + dy * d));
    return ret;
}

function howMuchTranslateXYZ(l) {
    let lo = 1;
    while (lo > 0 && !canTranslateXYZby(lo, l)) lo /= 2;
    if (lo == 0) return -1;
    let hi = lo;
    while (canTranslateXYZby(hi, l)) hi *= 2;
    // Invariant: Can translate by lo, cannot translateby hi
    console.assert(hi > lo, 'not greater: ' + hi + ' versus ' + lo);
    while (hi - lo > 1e-6) {
        const mid = lo + (hi - lo) / 2;
        if (canTranslateXYZby(mid, l)) lo = mid;
        else hi = mid;
    }
    return lo;
}

// Translate the triangle away from l by distance d, taking time 2.5*duration
function translateXYZ(l, d, duration) {
    const [dx, dy] = normalDirection(l);
    [X, Y].forEach(p => {
        const px = p.X();
        const py = p.Y();
        const nxFull = px + 2 * d * dx;
        const nyFull = py + 2 * d * dy;
        const nxHalf = px + d * dx;
        const nyHalf = py + d * dy;
        p.moveTo([nxFull, nyFull], duration);
        window.setTimeout(() => p.moveTo([nxHalf, nyHalf], duration), duration * 1.5);
    });
}

function translateXYZbest(duration) {
    // Find the (line, vertex) pair that are closest
    let whichLine, bestDistance;
    [[a, B, C], [b, C, A], [c, A, B]].forEach(([line, from, to]) => {
        // Find the vertex closest from line
        let distanceToClosestVertex;
        [X, Y, Z].forEach(v => {
            const base = board.create('orthogonalprojection', [line, v]);
            const path = board.create('perpendicularsegment', [line, v]);
            let dx = v.coords.scrCoords[1] - base.coords.scrCoords[1];
            let dy = v.coords.scrCoords[2] - base.coords.scrCoords[2];
            board.removeObject(base);
            board.removeObject(path);
            const distance = Math.hypot(dx, dy);
            if (distanceToClosestVertex == undefined || distance < distanceToClosestVertex) {
                distanceToClosestVertex = distance;
            }
        });
        console.log('For line ' + line.name + ' distance to closest vertex is ' + distanceToClosestVertex);
        if (bestDistance == undefined || distanceToClosestVertex < bestDistance) {
            whichLine = [from, to];
            bestDistance = distanceToClosestVertex;
        }
    });
    const howMuch = howMuchTranslateXYZ(whichLine) / 2;
    const [from, to] = whichLine;
    console.log('Best to translate away from line ' + from.name + '->' + to.name + ' by ' + howMuch);
    translateXYZ(whichLine, howMuch, duration);
}

/*********************************** Translating along a line ***********************************/




// scaleXYZ(howMuchScaleXYZ(), 1000);
// console.log(howMuchTranslateXYZ(a));
// console.log(howMuchTranslateXYZ(b));
// console.log(howMuchTranslateXYZ(c));
