/**
 * RPC related code.
 *
 * NOTE: dom.js contains tools to manipulate the DOM; utils.js is
 * more for not-web-related standalone tools. Hence we have a separate
 * module, probably for just one function.
 */
var RPC = (function() {

/**
 * Exception to the rule:
 *	GET requests to retrieve ~static files.
 *	The optional token is eventually provided as a cookie
 *
 * XXX/NOTE: I can't get the browser to work from a cache when using
 * call; the culprit seems to be the use of POST vs. GET. IIUC, for some
 * reasons, the specs mandate that the cache should be invalidated for
 * POST requests:
 *	https://httpwg.org/specs/rfc7234.html#invalidation
 *
 * (alas, yet another implementation of the dreadful and pervasive
 * "let's add code to remove features" syndrome).
 *
 * We should be able to make it work with a POST, and a hand-rolled
 * cached implemented via IndexedDB, but, well.
 *
 * @param{string} path - path/to/file
 * @param{(arg0 : any) => (void)}  ok  - success callback
 * @param{(arg0 : any) => (void)}  ko  - failure callback
 * @param{XMLHttpRequestResponseType} [r] - responseType
 */
function fget(path, ok, ko, r) {
	let xhr = new XMLHttpRequest();
	xhr.open("GET", Config.root + path + "?v="+Config.version);
	if (r !== undefined) xhr.responseType = r;

	xhr.onload = function() {
		console.log(xhr.status);
		if (xhr.response === null) ko({
			"err"  : "Maybe doesn't match responseType '"+r+"'?",
			"text" : xhr.responseText,
		});
	    else if (xhr.status == 200)
			ok(xhr.response);
		else
			ko(xhr.response);
	};

	try { xhr.send(); } catch(e) { ko({
		"err" : "RPC: send() failure: "+e,
	}); }
}

/**
 * Simple RPC: JSON in, JSON out, function name is URL's path.
 *
 * @param{string} fn - function name / URL
 * @param{any} args  - function call arguments
 * @param{(arg0 : any) => (void)}  ok  - success callback
 * @param{(arg0 : any) => (void)}  ko  - failure callback
 */
function call(fn, args, ok, ko) {
	let xhr = new XMLHttpRequest();
	xhr.open("POST", fn);
	xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
	xhr.responseType = "json";
//	xhr.withCredentials = true;

	xhr.onload = function() {
		console.log(xhr.status);
		if (xhr.response === null) ko({
			"err"  : "JSON expected; we probably got something else",
			"text" : xhr.responseText,
		});
	    else if (xhr.status == 200)
			ok(xhr.response);
		else
			ko(xhr.response);
	};

	let jargs;
	try { jargs = JSON.stringify(args); } catch(e) { ko({
		"err" : "JSON args encoding error: "+e,
		"obj" : args,
	}); return; }

	try { xhr.send(jargs); } catch(e) { ko({
		"err" : "RPC: send() failure: "+e,
	}); }
}

/**
 * Same as call(), but returns a Promise, resolved
 * on RPC success, rejected on failure.
 *
 * @param{string} fn - function name / URL
 * @param{any} [args]  - function call arguments
 */
function pcall(fn, args) {
	if (args === undefined) args = {};
	return new Promise(function(resolve, reject) {
		call(fn, args, resolve, reject);
	});
}

return {
	"call"  : call,
	"pcall" : pcall,
	"fget"  : fget,
};

})();
