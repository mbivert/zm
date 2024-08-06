var Account = (function() {

/**
 * Set the value of the "token" cookie.
 *
 * @param{string} tok
 * @returns{void}
 */
function settokencookie(tok) {
	document.cookie = "token="+tok;
}

/**
 * Retrieve the value of the "token" cookie.
 *
 * @returns{string}
 */
function gettokencookie() {
	let cs = document.cookie.split("; ");

	for (let i = 0; i < cs.length; i++)
		if (cs[i].startsWith("token="))
			return cs[i].slice("token=".length)

	return ""
}

/**
 * Reset token cookie.
 *
 * @returns{void}
 */
function rsttokencookie() {
	settokencookie("");
}

return {
	"gettokencookie" : gettokencookie,
	"settokencookie" : settokencookie,
	"rsttokencookie" : rsttokencookie,
};
})();