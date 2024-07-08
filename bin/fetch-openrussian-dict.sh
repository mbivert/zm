#!/bin/sh

# NOTE: last version of the dict seems to be on some kind of SQL database
# available through web interface:
#	https://app.togetherdb.com/db/o9puugtgtauo1ih5/russian3/adjectives
# There doesn't seem to be a way to automatize export to what we have
# in git(1).
#
# We'll keep the git(1) database for now, test data quality/data loading;
# we may upgrade to better data later.

set -e

tmpd=/tmp
d=$tmpd/openrussian/

awk=/bin/awk

repo=https://github.com/Badestrand/russian-dictionary.git

if ! which git >/dev/null; then
	echo git not installed 1>&2;
	exit 1
fi

# Just grab last's version
if [ ! -d "$d" ]; then
	git clone --depth 1 $repo $d 1>&2
else
	(cd $d; git pull) 1>&2
fi

# NOTE: just testing out the data; current dictionaries
# are single files, we don't want to perform too great of
# a change, so just pack everything into an approximatively
# working blob.
#sed -n 1152p $d/nouns.csv
$awk -F"\t" '$3 {
	gsub("'\''", "")
	if ($1) v[$1] = $3
	if ($2) v[$2] = $3
	for (i = 5; i < NF; i++) {
		if ($i && !match($i, /[_a-zA-Z0-9]/)) {
			split($i, a, /[,;] */)
			for (j in a)
				if (a[j]) v[a[j]] = $3
		}
	}
}
END{
	for (x in v)
		printf("%s\t%s\n", x, v[x])
}' $d/*.csv
