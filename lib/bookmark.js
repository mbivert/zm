/*
 * Code to load/dump an object to a string (bookmark),
 *
 * In practice, the object is a Moveable+display, and we're
 * dumping enough state data to be able to reconstruct the
 * page from the bookmark.
 *
 * This allows to share an exact page through URL sharing, as
 * the bookmark is stored in the URL's hash. Practically speaking,
 * there's a lot of space there to store data:
 *	https://stackoverflow.com/a/417184
 *
 * []SVarDescr encodes the typed state variables and how
 * to load/dump them from/to the bookmark.
 *
 * Available variables types are all defined here in svars.
 */

let Bookmark = (function() {
/**
 * State variables type: how to load/dump then from/to
 * a string, as retrieved from a URL hash.
 *
 * @type{Object.<SVarType, SVarLD>}
 */
let svars = {
	[SVarType.Number] : {
		/** @type{(s : string) => number|undefined } */
		"load" : function(s)  {
			var n = parseInt(s); return isNaN(n) || n < 0 ? undefined : n
		},
		/** @type{(x : number) => string } */
		"dump" : function(x)  { return x.toString(); },
	},
	[SVarType.String] : {
		/** @type{(s : string) => string } */
		"load" : function(s) { return s; },

		/** @type{(s : string) => string } */
		"dump" : function(s) { return s; },
	}
};

/**
 * Pre-parse a hash/dump string.
 *
 * Input:
 *	@param{string} s - hash/dump string
 * Output:
 *	@returns{Object.<string, string>} - hash mapping name to unparsed values
 */
function preload(s) {
	return s === "" ? {} : s.split(/;/).reduce(
		/**
		 * @param{Object.<string, string>} xs
		 * @param{string}                  x
		 * @returns{Object.<string, string>}
		 */
		function(xs, x) {
			let [n, v] = x.split(/=/);
			xs[n] = decodeURIComponent(v);
			return xs;
	}, {});
}

/**
 * Load a given hash/dump string.
 *
 * Input:
 *	@param{Object.<any, any>} o   - state object
 *	@param{Array.<SVarDescr>} ss  - state variable descriptions
 *	@param{string}            [b] - hash/dump string
 * Output:
 *	@returns{Object} - o altered (in-place)
 */
function load(o, ss, b) {
	if (b === undefined) b = (document.location.hash || "#").slice(1);

	let xs = preload(b);
	return ss.reduce(function(o, s) {
		if (!(s.bn in xs)) return o;
		let v = svars[s.type].load(xs[s.bn]);
		Assert.assert("Bookmark.load(): "+s.bn+" cannot be parsed ("+xs[s.bn]+")", v !== undefined);
		return Utils.deepset(o, s.sn, v);
	}, o);
}

/**
 * Dump a given state object.
 *
 * Input:
 *	@param{Object.<any, any>} o  - state object
 *	@param{Array.<SVarDescr>} ss - state variable descriptions
 * Output:
 *	@returns{string} - o dumped as a string
 */
function dump(o, ss) {
	return ss.reduce(function (acc, s) {
		let v = Utils.deepget(o, s.sn);
		if (v === null) return acc;
		let w = svars[s.type].dump(v);

		// NOTE: mistakes happened.
		if (typeof w != "string") {
			Assert.assert("Bookmark.dump(): "+s.sn+" is not a string/number");
			return acc;
		}

		Assert.assert("Bookmark.dump(): "+s.sn+" contains a '='", !w.includes("="));
		Assert.assert("Bookmark.dump(): "+s.sn+" contains a ';'", !w.includes(";"));
		return (acc ? acc + ";" : "") + s.bn + "=" + w;
	}, "");
}

return {
	"preload" : preload,
	"load"    : load,
	"dump"    : dump,
};
})();
