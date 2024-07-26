let Assert = (function() {
/**
 * Convenient wrapper to unify assertions,
 * easing their localisation.
 *
 * Assertions are currently provided as a temporary
 * measure against incorrect or impossible typing,
 * or unimplemented features.
 *
 *	@param{string}  s   - assertion message
 *	@param{boolean} [b] - assertion fails if false/undefined
 *
 *	@returns{void}
 */
function assert(s, b) {
	console.assert(b, "assert(): "+s);
	if (!b) {
		try { alert("assert(): "+s); } catch(e) {};
		throw "assert(): "+s;
	}
}

return {
	"assert" : assert,
};

})();
