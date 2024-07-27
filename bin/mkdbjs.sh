#!/bin/sh

set -e

# Temporary script to export pieces of schema.sql to JavaScript.

echo '/* Automatically generated; see ../Makefile & ../bin/mkdbjs.sh */'
echo 'var DB = (function() {'
echo ''
echo '// Improperly typed because of enums'
echo '// @ts-ignore'
echo -n 'var datas = '
(echo .mode json; echo .read "$1") | sqlite3 |  jq -r .
echo 'return { "datas" : datas, };'
echo '})();'

