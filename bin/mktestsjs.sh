#!/bin/sh

set -e

# TODO: there's too much potential naming overlap; module
# names needs to be complete.


#for x in `du -a ./tests | awk '/.js$/ { printf("Tests%s%s\n", substr($2, 1, 1), substr($2, 2)) }' | sort`; do
#	n=`basename $x .js`
#	echo import '*' as $n from "'../$x'"
#done

#echo import '*' as Tests from "'../modules/tests.js'"
#echo ''

cat ./site/base/full.js ./tests/*.js ./tests/*/*.js ./tests/*/*/*.js

echo 'Tests.run([].concat('

#echo "	TestsMove.tests,"


# Won't work: (e.g. WikiSource vs. Wikisource
for x in `du -a ./tests | awk '/.js$/ { print $2 }'| sort`; do
	n=$(grep '^let Tests.* = (function() {$' $x | awk '{ print $2 }')
	echo "	$n.tests,"
done

echo '))';
