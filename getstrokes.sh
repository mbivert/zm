#!/bin/sh

# NOTE: this would be more appropriately written in JS/Go, but this would
# have been slower to develop.

set -e

# Ensure non-Plan9 sed/awk.
PATH=/bin:/usr/bin:$PATH

# Apparently, we can use <img> with src=
#	https://commons.wikimedia.org/wiki/Special:Redirect/file/戈-order.gif

if ! which jq   >/dev/null; then exit 1; fi
if ! which curl >/dev/null; then exit 1; fi

if [ -z "$1" ]; then set /dev/stdout; fi

t=/tmp/strokes.json.$$

out=$1

base="https://commons.wikimedia.org/w/api.php"
base="$base?action=query&list=categorymembers&cmlimit=max"
base="$base&cmtype=file&utf8=true&format=json&cmtitle=Category:"

for n in Order.gif Bw.png Red.png; do
	# cmcontinue argument when more than one batch is required.
	c=

	while true; do
		url="$base${n}_stroke_order_images$c"
		curl -s "$url" > $t
		x=`jq '.batchcomplete' < $t`
		if [ "$x" != '""' ]; then
			break
		fi
		jq -r '.query.categorymembers[].title' < $t #>> $out
		c='&cmcontinue='`jq -r '.continue.cmcontinue' < $t`
		sleep 1
	done
done | sed -n '/-order.gif$\|-red.png$\|-bw.png$/s/^File://p' \
	| sort \
	| awk -F'[-.]' 'BEGIN{print "["} c != $1 {
		if (c) print "\n    }\n},"
		print "{"
		print "    \"" $1 "\": {"
	}
	{
		if (c == $1) print ","
		else c = $1
		printf "        \"" $2 "\": \"" $0 "\""
	}
	END { print "    }\n}]" }
' | jq -r -c . > $out # final jq to ensure JSON correctness+minify

rm $t
