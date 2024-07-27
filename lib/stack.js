var Stack = (function() {
/**
 * Stack constructor.
 *
 * The "stack" here refers to the UI stack of words being currently
 * displayed; we only implement the mechanics here.
 *
 * TODO: tests
 *
 * @returns{Stack}
 */
function mk() {
	let S = /** @type{Stack} */ {
		// Stack of words being inspected
		/** @type{Stack["xs"]} */
		xs : [],

		// Currently selected word from the stack
		/** @type{Stack["n"]} */
		n  : 0,

		// dumb tsc(1) boilerplate...

		/** @type{Stack["reset"]} */
		reset : function(){},

		/** @type{Stack["last"]} */
		last : function(){return "";},

		/** @type{Stack["current"]} */
		current : function(){return "";},

		/** @type{Stack["push"]} */
		push : function(){return false},

		/** @type{Stack["findback"]} */
		findback : function(){},

		/** @type{Stack["del"]} */
		del : function(){},

		/** @type{Stack["backto"]} */
		backto : function(){},

		/** @type{Stack["popto"]} */
		popto : function(){},
	};

	// type annotations below are useless :shrug:

	/** @type{Stack["reset"]} */
	S.reset = function() {
		S.xs = [];
		S.n  = 0;
	}

	/** @type{Stack["last"]} */
	S.last = function() {
		return S.xs.length ? S.xs[S.xs.length-1] : undefined
	}

	/** @type{Stack["current"]} */
	S.current = function() {
		if (S.n < 0)             return undefined;
		if (S.n > S.xs.length-1) return undefined;

		return S.xs[S.n];
	}

	/** @type{Stack["push"]} */
	S.push = function (w) {
		// XXX clumsy
		if (S.last() == w)
			return false;
		S.xs.push(w);
		S.n = S.xs.length-1;
		return true;
	}

	/** @type{Stack["findback"]} */
	S.findback = function(w, f) {
		for (var i = S.xs.length-1; i >= 0; i--)
			if (S.xs[i] == w)
				f(i);
	}

	/** @type{Stack["del"]} */
	S.del = function(w) {
		// Always keep at least one element on the stack
		if (S.xs.length == 1) return;

		S.findback(w, /** @type{(i : number) => void} */ function(i) {
			S.n = i == S.xs.length-1 ? i-1 : i;
			S.xs.splice(i, 1);
		});
	}

	/** @type{Stack["backto"]} */
	S.backto = function(w) {
		S.findback(w, /** @type{(i : number) => void} */ function(i) {
			S.n = i;
		});
	}

	/** @type{Stack["popto"]} */
	S.popto = function(w) {
		S.findback(w, /** @type{(i : number) => void} */ function(i) {
			S.xs = S.xs.slice(0, i+1);
		});
	}

	return S
}

return {
	"mk" : mk,
};

})();