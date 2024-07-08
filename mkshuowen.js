/**
 * Parse raw wikisource export of the Shuowen Jiezi, and
 * create a clean markdown file from it. Store the file
 * both in as a dict/ and as a book/.
 */
import * as WikiSource from "./modules/data/book/wikisource.js";
import * as Node       from "./modules/node.js";
import * as Markdown   from "./modules/data/book/markdown.js";

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
