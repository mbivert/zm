/**
 * Parse raw wikisource export of the Shuowen Jiezi, and
 * create a clean markdown file from it. Store the file
 * both in as a dict/ and as a book/.
 */

var Node = require('../modules/node.js');
// @ts-ignore
var path = require('path');
// @ts-ignore
var process = require('process');

// Expected
process.chdir(path.join(path.dirname(process.argv[1]), ".."));

eval(Node.readf("./site/base/full.js").toString());

var rf = "./data/raw/shuo-wen-jie-zi.txt";

var cs = WikiSource.parse(Node.readf(rf));
if (cs[1] !== undefined) {
	console.log("[error] "+rf+":"+cs[1][0]+" "+cs[1][1]);
	// @ts-ignore
	process.exit(1);
}

var s = Markdown.dump(WikiSource.tweakshuowen(cs[0]));
Node.writef("./data/dict/shuo-wen-jie-zi.md",  s);
Node.writef("./data/books/shuo-wen-jie-zi.src", s);
