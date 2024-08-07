var Fields = (function() {

/**
 * Field management.
 *
 * NOTE: This is essentially a standalone module; it would
 * make sense to publish it on its own.
 *
 * NOTE: we could have merged all those in a single function,
 * would have been more concise, but less clear.
 */

/**
 * Sensible default.
 *
 * @param{FieldDescr} f
 * @returns{FieldHTMLElement}
 */
function mkfield(f) {
	let p = /** @type{FieldHTMLElement} */ (document.createElement(f.tag || "input"));

	if (f.type) p.type = f.type;

	p.set   = function(v) { p.value = v.toString();   }
	p.get   = function()  { return p.value;           }
	p.check = function()  { return p.checkValidity(); }
	p.rst   = function()  { return p.set("");         }

	return p;
}

/**
 * Field holding a boolean (checkbox).
 *
 * @param{FieldDescr} f
 * @returns{FieldHTMLElement}
 */
function mkbool(f) {
	let p = mkfield(Object.assign({type:"checkbox"}, f));

	p.set   = function(v) { p.checked = v;    }
	p.get   = function()  { return p.checked; }

	return p
}

/**
 * Field holding an email.
 *
 * @param{FieldDescr} f
 * @returns{FieldHTMLElement}
 */
function mkemail(f) { return mkfield(Object.assign({type:"email"}, f)); }

/**
 * Field holding a number.
 *
 * @param{FieldDescr} f
 * @returns{FieldHTMLElement}
 */
function mknumber(f) {
	// Note that we're purposefully allow f to override tag/type
	let p = mkfield(Object.assign({type:"number"}, f))

	p.get   = function()  { return parseInt(p.value); }

	return p;
}

/**
 * Field holding an enumeration, of which we can
 * pick only one.
 *
 * @param{FieldDescr} f
 * @returns{FieldHTMLElement}
 */
function mkenum(f) {
	let p = mkfield(Object.assign({tag:"select"}, f));

	// assumes f.ftype == "enum"
	if (f.options !== undefined) for (let i = 0; i < f.options.length; i++) {
		let q         = document.createElement("option")
		q.value       = f.options[i].value;
		q.textContent = f.options[i].name;
		p.appendChild(q);
	}

	return p;
}

/**
 * Field holding a password.
 *
 * @param{FieldDescr} f
 * @returns{FieldHTMLElement}
 */
function mkpassword(f) { return mkfield(Object.assign({type:"password"}, f)); }

/**
 * Field holding a string (~single line).
 *
 * @param{FieldDescr} f
 * @returns{FieldHTMLElement}
 */
function mkstring(f) { return mkfield(f); }

/**
 * Field holding a piece of text (multiple lines).
 *
 * @param{FieldDescr} f
 * @returns{FieldHTMLElement}
 */
function mktext(f) { return mkfield(Object.assign({tag:"textarea"}, f)); }

/**
 * Field holding an URL.
 *
 * @param{FieldDescr} f
 * @returns{FieldHTMLElement}
 */
function mkurl(f) { return mkfield(Object.assign({type:"url"}, f)); }

/**
 * @type{Object.<string, (arg0 : FieldDescr) => FieldHTMLElement>}
 */
let ftypes = {
	"bool"     : mkbool,
	"email"    : mkemail,
	"number"   : mknumber,
	"enum"     : mkenum,
	"password" : mkpassword,
	"string"   : mkstring,
	"text"     : mktext,
	"url"      : mkurl,
};

/**
 * Register a new type in ftypes.
 *
 * NOTE: this only makes sense if fields.js is used as
 * a standalone module.
 *
 * @param{string} ftype
 * @param{(arg0 : FieldDescr) => FieldHTMLElement} mk
 * @returns{void}
 */
function addtype(ftype, mk) { ftypes[ftype] = mk; }

/**
 * Create a field.
 *
 * @param{FieldDescr} f
 * @returns{[FieldHTMLElement] | [FieldHTMLElement, HTMLElement]}
 */
function mk(f) {
	if (!(f.ftype in ftypes)) {
		Assert.assert("Unknown field type "+f.ftype);
		// @ts-ignore (assert throws)
		return;
	}

	let p = ftypes[f.ftype](f);

	if (f.value) p.set(f.value);
	if (f.name)  p.setAttribute("name", f.name);
	if (f.style) p.setAttribute("style", f.style);

	let l; if (f.label && f.name) {
		l = document.createElement("label");
		l.textContent = f.label+" ";
		l.setAttribute("for", f.name);
	}

	return l === undefined ? [p] : [p, l];
}

/**
 * Calls mk(f), and append both the label (if any) and the
 * field, in that order, under p.
 *
 * @param{HTMLElement} p
 * @param{FieldDescr}  f
 */
function mkaddto(p, f) {
	let [q, l] = mk(f);
	if (l !== undefined) p.appendChild(l)
	p.appendChild(q);
	return q;
}

/**
 * Look for all fields located under p, and construct a hash
 * associating field names to field values.
 *
 * @param{Array<FieldHTMLElement> } xs
 * @returns{Object.<string, any>}
 */
function getall(xs) {
	let r = /** Object.<string, any> */ ({});

	for (let i = 0; i < xs.length; i++)
		// @ts-ignore
		r[xs[i].getAttribute("name")] = xs[i].get();

	return r;
}

/**
 * Set the values of the given fields from a the hash v,
 * which associates field's names to their value.
 *
 * @param{Array<FieldHTMLElement> } xs
 * @param{Object.<string, any>} v
 * @returns{void}
 */
function setall(xs, v) {
	for (let i = 0; i < xs.length; i++)
		// @ts-ignore
		xs[i].set()(v[xs[i].getAttribute("name")])
}


/**
 * Reset all fields.
 *
 * @param{Array<FieldHTMLElement> } xs
 * @returns{void}
 */
function rstall(xs) {
	for (let i = 0; i < xs.length; i++)
		// @ts-ignore
		xs[i].rst()
}

return {
	"mk"      : mk,
	"mkaddto" : mkaddto,
	"addtype" : addtype,

	"getall" : getall,
	"setall" : setall,
	"rstall" : rstall,
};

})();
