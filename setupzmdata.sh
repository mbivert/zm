#!/bin/sh

# This is a rough script to connect the zm-data git repository
# with this one via a symlink.

set -e

data="$1"
zmdata="$2"

if [ -z "$2" ]; then
	echo $(basename "$0") "<path/to/data/>" "<path/to/zm-data>" 1>&2
	exit 1
fi

if [ ! -d "$zmdata/data" ]; then
	echo "$zmdata" is not a local checkout of the zm-data git repository 1>&2
	exit 2
fi

if [ -f "$data" ] && [ ! -L "$data" ]; then
	echo "$data" exists but is not a symbolic link 1>&2
	exit 3
fi

# Setup a symlink
if [ ! -L "$data" ]; then
	ln -sv "$zmdata/data" $(dirname "$data")
fi
