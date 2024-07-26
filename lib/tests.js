let Tests = (function() {

// XXX historical artifact
let dbg = true;

/* comparison trace */
let cmpt = ""

/**
 * Append a line of trace to cmpt.
 *
 * NOTE/TODO: we could do better, e.g. have the complete
 * current data path and only log the problematic lines,
 * while keeping the ability to log everything to debug
 * the comparison itself.
 *
 * For now, this is better than nothing and practical enough.
 *
 * @param{Array<any>} xs - objects to be dumped
 */
function trace(...xs) {
	xs.forEach(function(x) {cmpt += Utils.dump1(x)});
	cmpt += "\n";
}

/**
 * Deep comparison.
 *
 * NOTE: Exhaustive enough for our purposes.
 *
 * @param{any} a - first  object to compare.
 * @param{any} b - second object to compare.
 * @returns{boolean} - true if a and b are equals, false otherwise.
 */
function dcmp(a, b) {
	if (dbg) trace("a:", a, "b:", b);

	/* Primitives */
	if (a === b) {
		if (dbg) trace("a and b are equals primitives (===)");
		return true;
	}

	/* Hashes & array */
	if (!(a instanceof Object)) {
		if (dbg) trace("a is not an object");
		return false;
	}

	if (!(b instanceof Object)) {
		if (dbg) trace("b is not an object");
		return false;
	}

	/* Distinguish between hash and array */
	if (Array.isArray(a) && !Array.isArray(b)) {
		if (dbg) trace("a is an array, but b is not");
		return false;
	}
	if (!Array.isArray(a) && Array.isArray(b)) {
		if (dbg) trace("b is an array, but a is not");
		return false;
	}

	/* All properties of a are in b, and equals */
	for (var p in a) {
		if (!(p in b)) {
			if (dbg) trace("property", p, "exists in a but not in b");
			return false;
		}
		if (dbg) trace("comparing property", p);
		if (!dcmp(a[p], b[p])) {
			if (dbg) trace("property", p, "has different values in a and b");
			return false;
		}
	}
	/* All properties of b are in a */
	for (var p in b) if (!(p in a)) {
		if (dbg) trace("property", p, "exists in b but not in a");
		return false;
	}

	if (dbg) trace("a and b equals");
	return true;
}

/**
 * Run a single test.
 *
 * NOTE: we're a bit lazzy when comparing to error. Perhaps
 * we could add an additional entry for that instead of using
 * expected. This is of little practical importance for now.
 *
 * @this{any} -
 * @param{function} f - function to test
 * @param{Array.<any>} args  - array of arguments for f
 * @param{any} expected - expected value for f(args)
 * @param{string} descr            -  test description
 * @param{string|undefined} error - expected error (exception)
 * @returns{boolean} - true if test was a success.
 *
 * In case of failure, got/expected are dumped as JSON on the console.
 */
function run1(f, args, expected, descr, error) {
	var got;

	// XXX/TODO: we should typecheck all the tests so that
	// it can't happen.
	Assert.assert(
		"Test arguments should be an array: "+descr,
		args instanceof Array
	);

	try {
		got      = f.apply(this, args);
	} catch(e) {
		console.log(e);
		// XXX this started to pop after adding Moveable.update
		// @ts-ignore
		got      = e.toString();
		expected = error || "<!no error were expected!>";
	}

	cmpt = "";
	var ok  = dcmp(got, expected);

	console.log("["+(ok ? "OK" : "KO")+"] "+f.name+": "+descr);
	if (!ok) {
		console.log("Got:");
		Utils.dump(got);
		console.log("Expected");
		Utils.dump(expected);
		console.log("Comparison trace: ", cmpt);
	}
	return ok;
}

/**
 * Run multiple tests, stopping on failure.
 *
 * @param{Array.<Test>} tests - tests to run
 * @returns{boolean} - true if all tests were run successfully, false if a test failed.
 */
function run(tests) {
	return tests.reduce(
		/** @type{(ok : boolean, t : Test) => boolean} */
		function(ok, t) {
			// Happens from time to time.
			Assert.assert("Tests array is exported?", t !== undefined);
			return ok && run1(t.f, t.args, t.expected, t.descr, t.error);
		},
		true
	);
}

return {
	"dcmp" : dcmp,
	"run"  : run,
};

})();
