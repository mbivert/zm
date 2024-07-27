#!/bin/sh

set -e

# NOTE/XXX: we should probably add new test modules manually now,
# as this is a bit clumsy/fragile.

cat << 'EOF'
var Node = require('../modules/node.js');

eval(Node.readf("./site/base/full.js").toString());

eval(Node.readf("./site/base/full-tests.js").toString());

Tests.run([].concat(
EOF

for x in `du -a ./tests | awk '/.js$/ { print $2 }'| sort`; do
	n=$(grep '^var Tests.* = (function() {$' $x | awk '{ print $2 }')
	echo "	$n.tests,"
done

echo '))';
