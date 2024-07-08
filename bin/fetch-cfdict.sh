#!/bin/sh

set -e

tmpd=/tmp
f=$tmpd/cfdict.zip
unzip=/bin/unzip

url=https://chine.in/mandarin/dictionnaire/CFDICT/cfdict.zip

curl -s -A absolutely-not-kurl $url > $f
# Unzip can't read from stdin (nor from /dev/stdin).
$unzip -q -c -x $f cfdict.u8
rm -f $f