#!/bin/sh

# Recreate modules/config.js

set -e

ROOT="$1"
VERSION="$2"

if [ -z "$2" ]; then
	echo "$(basename $0) <ROOT> <VERSION>" 1>&2
	exit 1
fi

f="$(dirname $0)/../modules/config.js"

cat << EOF > "$f"
/** @type{string} */
var root    = "$ROOT";

/** @type{number} */
var version = $VERSION;

export { root, version };
EOF

