#!/bin/sh

set -e

# For the record, there are two han-de-dict related site.
# The first one, http://www.handedict.de/, seems to only
# contain an old version of the dict at:
#	http://www.handedict.de/handedict/handedict-20110528.tar.bz2
#
# The second one that we use seem to use an up-to-date version.

url=https://handedict.zydeo.net/api/export/download

curl -s $url | gunzip -c | sed '1s/^﻿//'
