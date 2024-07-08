/*
 * Basic conditional logging, mainly for debugging
 * purposes.
 */

/** @type{(s : string) => void} */
function debug(s) {
	console.debug(s);
}

export {
	debug,
};
