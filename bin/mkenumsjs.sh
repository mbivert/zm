#!/bin/sh

# Create modules/enums.js from lib.d.ts.

PATH=/bin:/usr/bin:/usr/local/bin:$PATH


# We could do it in one sed(1)/awk(1) call; this is left as an
# exercice to the reader :-).

# awk(1) is used to extract all declare enum blocks; sed(1) to
# reformat them.
awk '/^declare enum/{p=1}p{print}/^}/{p=0}' $1 | \
	sed '/^declare enum/{
		s/declare enum/var/
		s/{$/= {/
	}
	/^[ 	]/s/=/:/
	/^}$/s/$/;\n/'

# Create export block
#awk '
#	BEGIN{ print "return {" }
#	/^declare enum/{ printf("\t\"%s\" : %s,\n", $3, $3) }
#	END{ print "};" }' $1
