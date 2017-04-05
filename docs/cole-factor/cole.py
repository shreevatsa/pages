"""How Frank Nelson Cole factored 2^67 - 1 in 1903."""

import math
import collections

known_roots = collections.defaultdict(lambda: collections.defaultdict(lambda: collections.defaultdict(list)))


DEBUG = False


def safe_index(l, a, b, c):
    if a in l and b in l[a] and c in l[a][b]:
        return l[a][b][c]
    return None


def mod(a, m):
    """a % m but always nonnegative."""
    if m < 0: m = -m
    return ((a % m) + m) % m


def square_roots_brute_force(a, p, k=1):
    m = p ** k
    ret = []
    for x in range(m):
        if (x * x - a) % m == 0:
            ret.append(x)
    return ret


def square_roots(a, p, k=1):
    m = p ** k
    a = mod(a, m)
    if safe_index(known_roots, p, k, a) is None:
        known_roots[p][k][a] = sorted(set(square_roots_generator(a, p, k)))
    if DEBUG:
        assert known_roots[p][k][a] == square_roots_brute_force(a, p, k)
    return known_roots[p][k][a]


def square_roots_generator(a, p, k=1):
    """Square roots of a mod p^k."""
    assert k >= 0
    if k == 0:
        yield 0  # We want x*x = a = 0 mod 1, so any number will do.
        return
    # Clear out common factors
    multiplier = 1
    while a % p == 0:
        if k <= 1:  # x * x = 0 mod p has only one solution.
            yield 0
            return
        # x^2 = a mod p^k and k>=2 <=> (x/p)^2 = a/p^2 mod p^(k-2).
        assert a % (p * p) == 0
        a /= p * p
        k -= 2
        multiplier *= p
    # Now gcd(a, p) = 1
    if k == 1:
        # Special-casing 2 as it has only one root.
        if p == 2:
            yield 1 if a % 2 else 0
            return
        # Brute-force will do for now. No Tonelli-Shanks; our primes are tiny.
        for x in range(p/2 + 1):
            if (x * x - a) % p == 0:
                yield multiplier * x
                yield multiplier * (p - x)
        return
    # Now k > 1.
    m = p ** k
    old_m = p ** (k - 1)
    # Root mod p^k is also a root mod p^(k-1). Call it "Hensel lifting" if feeling fancy.
    prev = square_roots(a, p, k - 1)
    for r in prev:
        if p == 2:
            # if p = 2, either both roots work or neither
            if (r * r - a) % m == 0:
                yield r
                yield r + old_m
            continue
        # Now we can assume p > 2

        # # The correct Hensel-lifting way
        # assert (r * r - a) % old_m == 0
        # leftover = (r * r - a) / old_m
        # yield moddiv(leftover, -2 * r, p) * old_m + r

        # Alternative: brute force
        for i in range(p):
            candidate = old_m * i + r
            if (candidate * candidate - a) % m == 0:
                yield multiplier * (candidate % m)
                break
    return


def find_alphas_for(N, m, p, k=1):
    """Finds alpha for which (m - alpha)^2 = N mod p^k."""
    print 'Finding alphas for N=%s m=%s p=%s k=%s' % (N, m, p, k)
    roots = square_roots(N, p, k)
    print 'Square roots of N mod p^k are:', roots
    # Now we want m - alpha = r mod p^k, which means alpha = (m - r) mod p^k.
    for r in roots:
        yield mod(m - r, p**k)
    return


def gcd(a, b):
    return abs(a) if b == 0 else gcd(b, a % b)


def egcd(a, b):
    """Returns (g, x, y) such that g == a*x + b*y."""
    if b == 0:
        if a < 0:
            return (-a, -1, 0)
        return (a, 1, 0)
    g, y, x = egcd(b, a % b)
    assert g == gcd(a, b)
    assert g == b * y + (a % b) * x
    # g = b*y + (a%b)*x = by + (a - kb)x (for some k) = b(y-kx) + ax.
    y = (g - a * x) / b
    assert g == a * x + b * y
    return (g, x, y)



def modinv(a, m):
    g, x, y = egcd(a, m)
    assert g == gcd(a, m)
    assert g == a * x + m * y
    if g != 1:
        raise ValueError('{} has gcd {} with {}, so has no inverse.'.format(a, g, m))
    # Now 1 = a * x + m * y, so 1 = a * x (mod m).
    return mod(x, m)


def chinese_remainder_theorem(a1, m1, a2, m2):
    """Finds common solutions to x = a1 mod m1 and x = a2 mod m2."""
    g = gcd(m1, m2); assert m1 % g == m2 % g == 0
    m11 = m1 / g
    m22 = m2 / g
    M = m11 * m22 * g # = m1 * m2 / g = lcm(m1, m2)
    if (a2 - a1) % g:
        raise ValueError('No solutions, as {} and {} have different remainders mod gcd({}, {}) = {}.'.format(a1, a2, m1, m2, g))
    d = (a2 - a1) / g
    j = d * modinv(m11, m22)
    assert (m11 * modinv(m11, m22) - 1) % m22 == 0
    x = mod(a1 + j * m1, M)
    assert (x - a1) % m1 == 0
    assert (x - a2) % m2 == 0
    assert x >= 0
    assert M >= 0
    best = min(x - 2 * M, x - M, x, key=abs)
    return best
