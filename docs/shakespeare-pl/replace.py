import os.path
import re
import random
import sys

PATH = '/Users/srajagopalan/personal/code/tmp/official/spl-1.2.1/include'

def terms(filename):
    lines = open(os.path.join(PATH, filename), 'r').readlines()
    return [line.strip() for line in lines if line]

ANEG = terms('negative_adjective.wordlist')
APOS = terms('positive_adjective.wordlist')
A0 = terms('neutral_adjective.wordlist')
AP0 = APOS + A0
AN0 = ANEG + A0

NNEG = terms('negative_noun.wordlist')
NPOS = terms('positive_noun.wordlist')
N0 = terms('neutral_noun.wordlist')
NP0 = NPOS + N0

CMPPOS = terms('positive_comparative.wordlist')

def replace(pattern, choices, line):
    return re.sub(pattern, lambda x: random.choice(choices), line)

for line in sys.stdin.readlines():
    assert line[-1] == '\n'
    line = line[:-1]
    line = replace('ANEG', ANEG, line)
    line = replace('APOS', APOS, line)
    line = replace('ANEU', A0, line)
    line = replace('AP0', AP0, line)
    line = replace('AN0', AN0, line)

    line = replace('NPOS', NPOS, line)
    line = replace('NNEG', NNEG, line)
    line = replace('NNEU', N0, line)
    line = replace('NP0', NP0, line)

    line = replace('CMP\+', CMPPOS, line)
    print line
