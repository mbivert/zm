#!/bin/sh

# Recreate ./modules/config.js and ./config.json

set -e

ROOT="$1"
VERSION="$2"

if [ -z "$2" ]; then
	echo "$(basename $0) <ROOT> <VERSION>" 1>&2
	exit 1
fi

f="$(dirname $0)/../lib/config.js"

cat << EOF > "$f"
let Config = (function() {

return {
	/** @type{string} */
	"root"    : "$ROOT",

	/** @type{number} */
	"version" : $VERSION,
};

})();
EOF

f="$(dirname $0)/../config.json"
cat << EOF > "$f"
{
	"root"    : "$ROOT",
	"version" : "$VERSION"
}
EOF
