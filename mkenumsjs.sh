#!/bin/sh

# Create modules/enums.js from lib.d.ts.

PATH=/bin:/usr/bin:/usr/local/bin:$PATH

# Input/output
i=./lib.d.ts
o=./modules/enums.js

# We could do it in one sed(1)/awk(1) call; this is left as an
# exercice to the reader :-).

# awk(1) is used to extract all declare enum blocks; sed(1) to
# reformat them.
awk '/^declare enum/{p=1}p{print}/^}/{p=0}' $i | \
	sed '/^declare enum/{
		s/declare enum/var/
		s/{$/= {/
	}
	/^[ 	]/s/=/:/
	/^}$/s/$/;\n/' > $o

# Create export block
awk '
	BEGIN{ print "export {" }
	/^declare enum/{ print "\t" $3 "," }
	END{ print "};" }' $i >> $o
