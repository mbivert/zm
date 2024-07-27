var Node = require('../modules/node.js');

eval(Node.readf("./site/base/full.js").toString());

/*
 * Quick script to check that we can read data/
 * files referenced in database before launching
 * the website.
 *
 * This can be improved, e.g. we assume a correspondance
 * between .gz and non gziped files.
 */

let c = 0;

for (var i = 0; i < DB.datas.length; i++) {
	// Split in multiple files; to be done later.
	if (DB.datas[i].Type == 'book') continue;

	let fn  = DB.datas[i].File.replace(/\.gz$/, "");
	let s   = Node.readf(fn);
	// @ts-ignore
	// XXX/TODO: it's an enum thing: perhaps we can find
	// a way to clean those up?
	let err = Data.parse(DB.datas[i], s);
	if (err) {
		console.log(fn, err);
		c++;
	}
}

// @ts-ignore
process.exit(c);
