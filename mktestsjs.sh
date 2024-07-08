#!/bin/sh

# TODO: there's too much potential naming overlap; module
# names needs to be complete.

(
	for x in `du -a ./tests | awk '/.js$/ { print $2 }' | sort`; do
		n=`basename $x .js`
		echo import '*' as $n from "'$x'"
	done

	echo import '*' as Tests from "'./modules/tests.js'"
	echo ''
	echo 'Tests.run([].concat('

	for x in `du -a ./tests | awk '/.js$/ { print $2 }' | sort`; do
		n=`basename $x .js`
		echo "	$n.tests,"
	done
	echo '))';
) > ./tests.js