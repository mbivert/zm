var Node = require('../modules/node.js');

eval(Node.readf("./site/base/full.js").toString());

eval(Node.readf("./site/base/full-tests.js").toString());

Tests.run([].concat(
	TestsBookmark.tests,
	TestsCut.tests,
	TestsBig5.tests,
	TestsMarkdown.tests,
	TestsWikiSource.tests,
	TestsChise.tests,
	TestsWMDecomp.tests,
	TestsCEDict.tests,
	TestsDict.tests,
	TestsSWMarkdown.tests,
	TestsData.tests,
	TestsLinks.tests,
	TestsMove.tests,
	TestsTests.tests,
	TestsUser.tests,
	TestsUtils.tests,
))
