#!/bin/sh

set -e

tmpd=/tmp/

d=$tmpd/chise-ids/

# The following is extremely slow
#	http://git.chise.org/git/chise/ids.git'
#
# This one is much faster
repo='https://gitlab.chise.org/CHISE/ids.git'

if ! which git >/dev/null; then
	echo git not installed 1>&2;
	exit 1
fi

# Just grab last's version
if [ ! -d "$d" ]; then
	git clone --depth 1 $repo $d 1>&2
else
	(
		cd $d
		if ! git pull; then
			cd /tmp/
			rm -rf "$d"
			git clone --depth 1 $repo $d 1>&2
		fi
	) 1>&2
fi

cat $d/IDS-UCS*

