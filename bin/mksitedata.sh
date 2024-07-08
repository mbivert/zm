#!/bin/sh

set -e

# XXX Should be useless, but I'm not a huge fan. Same issue
# e.g. in mkconfigjs.sh.
cd $(dirname $0)/../

mkdir -p ./site/base/data/
mkdir -p ./site/base/data/dict/
mkdir -p ./site/base/data/decomp/
mkdir -p ./site/base/data/big5/
mkdir -p ./site/base/data/books/
mkdir -p ./site/base/data/fonts/
gzip -c ./data/dict/cc-cedict.csv         > ./site/base/data/dict/cc-cedict.csv.gz
gzip -c ./data/dict/cfdict.csv            > ./site/base/data/dict/cfdict.csv.gz
gzip -c ./data/dict/openrussian.csv       > ./site/base/data/dict/openrussian.csv.gz
gzip -c ./data/dict/handedict.csv         > ./site/base/data/dict/handedict.csv.gz
gzip -c ./data/big5/big5.csv              > ./site/base/data/big5/big5.csv.gz
gzip -c ./data/decomp/wm-decomp.csv       > ./site/base/data/decomp/wm-decomp.csv.gz
gzip -c ./data/decomp/chise.csv           > ./site/base/data/decomp/chise.csv.gz
gzip -c ./data/decomp/zm-decomp.csv       > ./site/base/data/decomp/zm-decomp.csv.gz
gzip -c ./data/dict/zm-add.csv            > ./site/base/data/dict/zm-add.csv.gz
gzip -c ./data/dict/cc-cedict-singles.csv > ./site/base/data/dict/cc-cedict-singles.csv.gz
gzip -c ./data/dict/cfdict-singles.csv    > ./site/base/data/dict/cfdict-singles.csv.gz
gzip -c ./data/dict/handedict-singles.csv > ./site/base/data/dict/handedict-singles.csv.gz
gzip -c ./data/dict/zm-pict.csv           > ./site/base/data/dict/zm-pict.csv.gz
gzip -c ./data/dict/ws-shuowen.csv        > ./site/base/data/dict/ws-shuowen.csv.gz
cp      ./data/books/*                      ./site/base/data/books/
cp      ./data/fonts/*                      ./site/base/data/fonts/
