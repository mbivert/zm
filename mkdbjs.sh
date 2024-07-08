#!/bin/sh

# Temporary script to export pieces of schema.sql to JavaScript.

(
	echo '/* Automatically generated; see Makefile & mkdbjs.sh */'
	echo ''
	echo '// Improperly typed because of enums'
	echo '// @ts-ignore'
	echo -n 'var datas = '
	(echo .mode json; echo .read schema.sql) | sqlite3 |  jq -r .
	echo 'export { datas };'
) > ./modules/db.js
