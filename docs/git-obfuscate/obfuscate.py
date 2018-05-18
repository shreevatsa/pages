#!/usr/bin/python
# -*- coding: utf-8; -*-

# See https://gist.github.com/shadowhand/873637 and https://git-scm.com/docs/gitattributes
# The problem is that the latter recommends:
# > For best results, clean should not alter its output further if it is run twice ("clean→clean" should be equivalent to "clean"), and multiple smudge commands should not alter clean's output ("smudge→smudge→clean" should be equivalent to "clean").

# This means that "clean" needs to peek at stdin and leave files starting with "U2FsdGVkX1" alone (not further "enc" them).
# Similarly, "smudge" should only work on files starting with "U2FsdGVkX1" (other ones should be passed through).
# Unfortunately, "clean" and "smudge" take input from stdin.

import os
import subprocess
import sys

# TODO: Get this from .gitconfig or something like that
OPENSSL_SALT = os.environ.get('OPENSSL_SALT')
OPENSSL_PASSPHRASE = os.environ.get('OPENSSL_PASSPHRASE')
assert OPENSSL_SALT, type(OPENSSL_SALT)
assert OPENSSL_PASSPHRASE, type(OPENSSL_PASSPHRASE)

if __name__ == '__main__':
    command, filename = sys.argv[1], sys.argv[2]
    assert command in ['clean', 'smudge', 'textconv-for-diff'], command
    # assert 'toobfus' in filename or 'private' in filename, filename # This is via .gitattributes
    signature = 'U2FsdGVkX1'               # base64 encoding of "salted__"
    if command == 'clean':
        s = sys.stdin.read(len(signature))
        rest = sys.stdin.read()
        if s == signature:
            sys.stderr.write('Already starts with signature, so not encrypting.\n')
            sys.stdout.write(s)
            sys.stdout.write(rest)
        else:
            openssl_enc_command = subprocess.Popen(
                ['openssl', 'enc', '-md', 'md5', '-base64', '-aes-256-ctr', '-S', OPENSSL_SALT, '-k', OPENSSL_PASSPHRASE],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE
                )
            out, err = openssl_enc_command.communicate(input=s+rest)
            sys.stdout.write(out)
    elif command == 'smudge':
        s = sys.stdin.read(len(signature))
        rest = sys.stdin.read()
        if s != signature:
            sys.stderr.write('Does not start with signature, so not decrypting.\n')
            sys.stdout.write(s)
            sys.stdout.write(rest)
        else:
            sys.stderr.write('Running smudge with OPENSSL_PASSPHRASE = %s and OPENSSL_SALT = %s\n' % (OPENSSL_PASSPHRASE, OPENSSL_SALT))
            openssl_dec_command = subprocess.Popen(
                ['openssl', 'enc', '-md', 'md5', '-d', '-base64', '-aes-256-ctr', '-k', OPENSSL_PASSPHRASE],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE
                )
            out, err = openssl_dec_command.communicate(input=s+rest)
            sys.stdout.write(out)
    elif command == 'textconv-for-diff':
        sys.stderr.write('Running textconv\n')
        # pwd = subprocess.check_output('pwd')
        # sys.stderr.write('pwd is %s\n' % pwd)
        file_contents = open(filename).read()
        sys.stderr.write('File starts as: %s\n' % file_contents[:10])
        command = ['openssl', 'enc', '-md', 'md5', '-d', '-base64', '-aes-256-ctr', '-k', OPENSSL_PASSPHRASE, '-in', filename]
        try:
            out = subprocess.check_output(command)
            sys.stdout.write(out)
        except subprocess.CalledProcessError:
            sys.stderr.write('The command %s failed\n' % command)
            sys.stdout.write(open(filename).read())
    else:
        raise ValueError('Unknown command %s: should be clean/smudge/textconv-for-diff' % command)
