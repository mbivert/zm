#!/bin/sh

# Create .pcs for San Zi Jing. Likely could be tweaked for
# other classical later on.
#
# .tr.orig is nicely formatted to extract tr pieces, poorly
# suitable for web display, so we're creating a .tr by joining
# all §'s lines with an interleaving space.

src=site/base/data/books/san-zi-jing.src
tr=site/base/data/books/san-zi-jing.tr.orig
tr2=site/base/data/books/san-zi-jing.tr
pcs=site/base/data/books/san-zi-jing.pcs

awk '
	/^$/ { if (s) print s; print; s = ""; next; } { s = s $0 " " }
	END { print s }' $tr > $tr2

# need unicode aware length() based awk(1)
awk=/bin/awk

(
	echo '[['

	$awk '
		BEGIN{printf("[0, ") }
		/^$/ {printf("],\n[0, "); next;}
		{
			n = 0;
			split($0, ps, /[，。]/)
			if (match($0, /[，。]$/))
				delete ps[length(ps)]
			for (p in ps) {
				n += length(ps[p])+1;
				printf("%d, ", n);
			}
		}
		END{print "]"}
	' $src | sed 's/, ]/]/'| sed 's/^/	/'

	echo '	], ['

	$awk '
		BEGIN{printf("[0, ") }
		/^$/ {printf("],\n[0, "); n=0; next;}
		{ n+=length($0)+1; printf("%d, ", n)}
		END{print "]"}
	' $tr | sed 's/, ]/]/' | sed 's/^/	/'

	echo ']]'
) > $pcs
