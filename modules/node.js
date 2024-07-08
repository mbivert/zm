/*
 * Wrappers around Node.js specific functions;
 * Goal being to easily identify/isolate them.
 */

// @ts-ignore
import * as Fs    from 'fs';
// @ts-ignore
import * as Child from 'child_process';
// @ts-ignore
import * as Zlib  from 'zlib';

/**
 * Read an UTF8 file.
 *
 * Input:
 *	@param{string} fn - file to read
 * Output:
 *	@returns{string} - fn's content as a string
 *	Throws on error
 */
function readf(fn) {
	return Fs.readFileSync(fn, 'utf8')
}

/**
 * Write an UTF8 file.
 *
 * @param{string} fn   - file to write to
 * @param{string} data - data to write to fn
 *
 * Throws on error
 */
function writef(fn, data) {
	Fs.writeFileSync(fn, data, 'utf8')
}

/**
 * mkdir -p
 *
 * Input:
 *	@param{string} d - path to create
 * Output:
 *	@returns{string} - a copy of d;
 *	Throws on error.
 */
function mkdir(d) {
	if (!Fs.existsSync(d))
		Fs.mkdirSync(d, { 'recursive' : true });
	return d;
}

/**
 * Read and parse a JSON file.
 *
 * Input:
 *	@param{string} fn - file to read
 * Output:
 *	@returns{object} - fn parsed as JSON
 *	Throws on error
 */
function readjson(fn) {
	return JSON.parse(readf(fn));
}

/**
 * Write JSON to a file.
 *
 * Input:
 *	@param{string} fn   - file to write to
 *	@param{string} data - data to write to fn
 * Output:
 *	Throws on error.
 */
function writejson(fn, data) {
	return writef(fn, JSON.stringify(data));
}

/**
 * List directory.
 *
 * Input:
 *	@param{string} d - directory to list
 * Output:
 *	@returns{Array.<string>} - d's content, sorted, d relative filenames.
 *	Throws on error
 */
function lsdir(d) {
	return Fs.readdirSync(d).sort();
}

/**
 * system(3) like
 *
 *	cmd :
 *	@param{string} cmd - command to run
 * Output:
 *	@returns{string} - cmd's stdout.
 */
function system(cmd) {
	return Child.execSync(cmd);
}

/**
 * Gzip given data.
 *
 * Input:
 *	@param{string} s - data to gzip
 * Output:
 *	@returns{string} - gzip'd data
 */
function gzip(s) {
	return Zlib.gzipSync(s);
}

export {
	readf, writef,
//	mkdir,
//	readjson, writejson,
//	lsdir,
	system,
//	gzip
};
