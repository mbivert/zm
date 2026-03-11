#!/bin/sh

# Recreate ./modules/config.js and ./config.json

set -e

ROOT="$1"
VERSION="$2"
EMBEDDED="$3"

if [ -z "$3" ]; then
	echo "$(basename $0) <ROOT> <VERSION> <EMBEDDED>" 1>&2
	exit 1
fi

f="$(dirname $0)/../lib/config.js"

cat << EOF > "$f"
let Config = (function() {

return {
	/** @type{string} */
	"root"     : "$ROOT",

	/** @type{number} */
	"version"  : $VERSION,

	/** @type{boolean} */
	"embedded" : $EMBEDDED,
};

})();
EOF

f="$(dirname $0)/../config.json"
cat << EOF > "$f"
{
	"root"     : "$ROOT",
	"version"  : "$VERSION",
	"embedded" : $EMBEDDED
}
EOF
