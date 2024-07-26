# HTTP root path (MUST be / terminated (at least if not /?))
ROOT :=

# Path to a local zm-data/
ZM_DATA := ../zm-data

# Timestamp to force browser cache update on .js/.css files.
VERSION := $(shell /bin/date '+%s')

# dev site HTTP port
port = 8001

# tsc(1) options for JS.
#
# 	* --downlevelIteration is for spread operator on string to get
# 	individual unicode characters.
#	* es2019 for []string.flat()
TSC_OPTS = -downlevelIteration -lib es6,dom,es2019 -allowJs
TSC_CHECK_OPTS = ${TSC_OPTS} -strict -alwaysStrict -checkJs -noEmit # -noUnusedLocals -noUnusedParameters
TSC_GEN_OPTS = ${TSC_OPTS} --removeComments --module amd

# (re)start a webserver on site-ready directory.
#
# Because we're using ESM modules, we can't use file:/// to
# test the website: https://stackoverflow.com/a/46992592, so
# we need a small ad-hock server.
.PHONY: dev
dev:
	@echo "Re(starting) local dev server on http://localhost:${port}..."
	@lsof -i -P -n|awk '/TCP.*'${port}'.*LISTEN/ { print "kill " $$2 }' | sh
	@#nohup python3 -m http.server ${port} -d ./site-ready/ &
	@nohup go run server.go &
	@$(eval ROOT := )

.PHONY: help
help:
	@echo "checkdeps      : check dependencies (curl, node, etc.)"
	@echo "site           : re(create) site-ready/ website"
	@echo "dev-site       : re(create) site-ready/ website for local tests"
	@echo "quick-dev-site : re(create) site-ready/ website for local tests (quick mode)"
	@echo "config         : re(create) modules/config.js"
	@echo "tests          : run tests"
	@echo "typecheck      : run static typechecking via tsc(1)"
	@echo "data           : update data/* files"

.PHONY: checkdeps
checkdeps: ./bin/checkdeps.sh
	@echo "Looking for dependencies..."
	@sh ./bin/checkdeps.sh
	@echo All dependencies found

.PHONY: typecheck
typecheck: lib.d.ts ./bin/mkshuowen.js ./tests/*.js \
		./tests/*/*/*.js ./modules/*.js ./modules/*/*.js  \
		./modules/*/*/*.js ./lib/*.js
	@# fd dance and sed(1) to get "clickable" error messages/proper exit status
	@t=/tmp/zmt.tmp; x=1; tsc ${TSC_CHECK_OPTS} $? 2>&1 > $$t && x=0; sed 's/(/:/;s/,/:/' $$t;  rm $$t; exit $$x

# Mind the quotes: ${ROOT} may be empty, which would shift the
# CLI arguments.
.PHONY: config
config: ./bin/mkconfigjs.sh
	@echo "Re(creating) modules/config.js..."
	@sh ./bin/mkconfigjs.sh "${ROOT}" "${VERSION}"

.PHONY: tests
tests: typecheck ./bin/tests.js ./modules/enums.js
	@echo Running tests...
	@node ./bin/tests.js

# Like site, but without typechecking, site-data/data;
# Used for pure js dev sessions.
.PHONY: quick-site
quick-site: config site/base/pako.min.js ./modules/enums.js \
		site/content/about.html site/base/require.min.js \
		site/base/full.js
	@echo "Re(creating) website..."
	@rm -rf ./site-ready/
	@mkdir ./site-ready/
	@cp -rf ./site/base/* ./site-ready/

.PHONY: site
site: typecheck check-data config site/base/pako.min.js  \
		./modules/enums.js site-data \
		site/content/about.html site/base/require.min.js \
		site/base/full.js \
		quick-site

.PHONY: zm-data
zm-data: ./bin/setupzmdata.sh
	@echo Setup data/...
	@sh ./bin/setupzmdata.sh ./data "${ZM_DATA}"

.PHONY: site-data
site-data: data bin/mksitedata.sh
	@echo Creating gziped files for site...
	@bin/mksitedata.sh

.PHONY: data
data: zm-data data/dict/cc-cedict.csv data/dict/cc-cedict-singles.csv \
	data/dict/cfdict-singles.csv data/dict/handedict-singles.csv \
	data/big5/big5.csv data/decomp/wm-decomp.csv data/decomp/chise.csv \
	data/dict/cfdict.csv data/dict/handedict.csv data/dict/openrussian.csv

check-data: ./modules/db.js ./modules/enums.js data ./bin/check-data.js data
	@echo Ensure data files are loadable...
	@node ./bin/check-data.js

dev-site: dev site
quick-dev-site: dev quick-site

${ZM_DATA}/LICENSE.md:
	@echo "Re(creating) ${ZM_DATA}/LICENSE.md..."
	@echo TODO

./site/base/full.js: modules/*.js modules/*/*.js modules/*/*/*.js
	@tsc ${TSC_GEN_OPTS} --outFile $@ modules/*.js modules/*/*.js modules/*/*/*.js
	@cat lib/*.js >> $@

./modules/enums.js: ./bin/mkenumsjs.sh ./lib.d.ts
	@echo Creating $@...
	@sh ./bin/mkenumsjs.sh ./lib.d.ts > $@

./modules/db.js: ./schema.sql ./bin/mkdbjs.sh
	@echo Creating $@...
	@sh ./bin/mkdbjs.sh ./schema.sql > $@

./bin/tests.js: ./bin/mktestsjs.sh ./tests/*.js ./tests/*/*/*.js
	@echo Creating $@...
	@sh ./bin/mktestsjs.sh > $@

site/base/pako.min.js:
	@echo Getting pako...
	@curl -s https://rawgit.com/nodeca/pako/master/dist/pako.min.js > $@

site/base/require.min.js:
	@echo Getting require...
	@curl -s https://requirejs.org/docs/release/2.3.6/minified/require.js > $@

data/dict/cc-cedict.csv: ./bin/fetch-cc-cedict.sh
	@echo Fetching cc-cedict dictionary...
	@sh ./bin/fetch-cc-cedict.sh > $@

data/dict/cfdict.csv: ./bin/fetch-cfdict.sh
	@echo Fetching CFDICT...
	@sh ./bin/fetch-cfdict.sh > $@

data/dict/handedict.csv: ./bin/fetch-handedict.sh
	@echo Fetching HanDeDict...
	@sh ./bin/fetch-handedict.sh > $@

data/dict/openrussian.csv: ./bin/fetch-openrussian-dict.sh
	@echo Fetching and formatting OpenRussian...
	@sh ./bin/fetch-openrussian-dict.sh > $@

data/big5/big5.csv: ./bin/fetch-unicode-big5.sh
	@echo Fetching big5/utf8 mapping table...
	@sh ./bin/fetch-unicode-big5.sh > $@

data/decomp/wm-decomp.csv: ./bin/fetch-wm-decomp.sh
	@echo Fetching and formatting WikiMedia decomposition table...
	@sh ./bin/fetch-wm-decomp.sh > $@

data/decomp/chise.csv: ./bin/fetch-chise-decomp.sh
	@echo Fetching CHISE project decomposition tables...
	@sh ./bin/fetch-chise-decomp.sh > $@

data/dict/cc-cedict-singles.csv: ./bin/fetch-cc-cedict-singles.sh data/dict/cc-cedict.csv
	@echo Computing cc-cedict single entries patch...
	@sh ./bin/fetch-cc-cedict-singles.sh data/dict/cc-cedict.csv > $@

data/dict/cfdict-singles.csv: ./bin/fetch-cc-cedict-singles.sh data/dict/cfdict.csv
	@echo Computing CFDICT single entries patch...
	@sh ./bin/fetch-cc-cedict-singles.sh data/dict/cfdict.csv > $@

data/dict/handedict-singles.csv: ./bin/fetch-cc-cedict-singles.sh data/dict/handedict.csv
	@echo Computing HanDeDict single entries patch...
	@sh ./bin/fetch-cc-cedict-singles.sh data/dict/handedict.csv > $@
