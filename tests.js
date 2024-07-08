import * as bookmark from './tests/bookmark.js'
import * as cut from './tests/cut.js'
import * as big5 from './tests/data/big5/big5.js'
import * as markdown from './tests/data/book/markdown.js'
import * as wikisource from './tests/data/book/wikisource.js'
import * as chise from './tests/data/decomp/chise.js'
import * as wmdecomp from './tests/data/decomp/wmdecomp.js'
import * as cedict from './tests/data/dict/cedict.js'
import * as dict from './tests/data/dict.js'
import * as swmarkdown from './tests/data/dict/swmarkdown.js'
import * as data from './tests/data.js'
import * as links from './tests/links.js'
import * as move from './tests/move.js'
import * as tests from './tests/tests.js'
import * as user from './tests/user.js'
import * as utils from './tests/utils.js'
import * as Tests from './modules/tests.js'

Tests.run([].concat(
	bookmark.tests,
	cut.tests,
	big5.tests,
	markdown.tests,
	wikisource.tests,
	chise.tests,
	wmdecomp.tests,
	cedict.tests,
	dict.tests,
	swmarkdown.tests,
	data.tests,
	links.tests,
	move.tests,
	tests.tests,
	user.tests,
	utils.tests,
))
