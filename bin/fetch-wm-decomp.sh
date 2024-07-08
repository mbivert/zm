#!/bin/sh

# Download and format Wikimedia decomposition table.
#
# NOTE: the page User:Artsakenos/CCD-TSV isn't regularly
# maintain, while the main page (that we use) is.
#
# We could/may split this in two scripts: fech & format.
#
# Requires curl(1), jq(1) and awk(1).

set -e

page='Commons:Chinese_characters_decomposition'
args='action=parse&prop=wikitext&explaintext&formatversion=2&format=json&utf8=1'
url="https://commons.wikimedia.org/w/api.php?${args}&page=${page}"

# NOTE: substr($0,2) breaks on Plan9's awk(1) because of utf8;
# sub() works for at least 9's and GNU's.
curl -s $url | jq -r .parse.wikitext | awk '
	/^<pre>/  {s=1;next}
	/^<\/pre>/{s=0;next}
	s && /^	/ { sub(/^\t/, "", $0); print }
'
