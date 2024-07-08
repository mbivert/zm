import * as DB   from "./modules/db.js";
import * as Data from "./modules/data.js";
import * as Node from "./modules/node.js";

/*
 * Quick script to check that we can read data/
 * files referenced in database before launching
 * the website.
 *
 * This can be improved, e.g. we assume a correspondance
 * between .gz and non gziped files.
 */

var c = 0;

for (var i = 0; i < DB.datas.length; i++) {
	// Split in multiple files; to be done later.
	if (DB.datas[i].Type == 'book') continue;

	var fn  = DB.datas[i].File.replace(/\.gz$/, "");
	var s   = Node.readf(fn);
	var err = Data.parse(DB.datas[i], s);
	if (err) {
		console.log(fn, err);
		c++;
	}
}

process.exit(c);
