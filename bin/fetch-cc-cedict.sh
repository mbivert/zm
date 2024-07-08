#!/bin/sh

set -e

mdbg=https://www.mdbg.net/chinese/export/cedict
cedict=cedict_1_0_ts_utf-8_mdbg.txt.gz

curl -s $mdbg/$cedict | gunzip -c
