#!/bin/sh

# Not really a fetcher:
#
# Grab all single-rune entries from a CC-CEDICT-formatted
# dictionary, that only occurs as modern characters, and creates
# "fake" entries associating those to traditional characters.
#
# E.g. From:
#	么 幺 [yao1] /youngest/most junior/tiny/.../
# Creates:
#:	幺 幺 [yao1] /youngest/most junior/tiny/.../

set -e

if [ -z "$1" ]; then
	echo `basename $0` '<path/to/dict.csv>' 1>&2
	exit 1
fi

awk=/bin/awk

# There are some issues with e.g. Plan9's awk(1).
n=`echo -n 聽 | $awk '{ print length($1) }'`
if [ "$n" != "1" ]; then
	echo error: "$awk" cannot count unicode runes >&2
	exit 1
fi

$awk '
/^#/ { next; }
length($1) == 1{
	defs = ""
	for (i = 3; i < NF; i++)
		defs = defs $i " "
	defs = defs $NF

	trad[$1] = defs
	simp[$2] = defs
}

END {
	for (e in simp)
		if (trad[e] == "")
			print e, e, simp[e]
}' $1
