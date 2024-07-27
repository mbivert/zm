var Log = (function() {
/*
 * Basic conditional logging, mainly for debugging
 * purposes.
 */

/** @type{(s : string) => void} */
function debug(s) {
	console.debug(s);
}

/** @type{(s : string) => void} */
function warn(s) {
	console.warn(s);
}

return {
	"debug" : debug,
	"warn"  : warn,
};

})();