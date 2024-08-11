var Account = (function() {

/**
 * Reset token cookie.
 *
 * @returns{void}
 */
function rst() {
	document.cookie = "connected=0";
}

/**
 * Check if we're connected using the "connected" cookie.
 *
 * @returns{boolean}
 */
function isconnected() {
	let cs = document.cookie.split("; ");

	let r = false;

	for (let i = 0; i < cs.length; i++)
		if (cs[i].startsWith("connected="))
			return cs[i].slice("connected=".length) != "0"

	return r;
}

return {
	"rst"            : rst,
	"isconnected"    : isconnected,
};
})();
