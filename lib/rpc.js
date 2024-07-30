/**
 * RPC related code.
 *
 * NOTE: dom.js contains tools to manipulate the DOM; utils.js is
 * more for not-web-related standalone tools. Hence we have a separate
 * module, probably for just one function.
 */
var RPC = (function() {

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

	xhr.onload = function() {
		if (xhr.response === null) ko({
			"err"  : "JSON expected; we probably got something else",
			"text" : xhr.responseText,
		});
	    else if (xhr.status != 200)
			ko(xhr.response);
		else
			ok(xhr.response);
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
 * @param{any} args  - function call arguments
 */
function pcall(fn, args) {
	return new Promise(function(resolve, reject) {
		call(fn, args, resolve, reject);
	});
}

return {
	"call"  : call,
	"pcall" : pcall,
};
})();
