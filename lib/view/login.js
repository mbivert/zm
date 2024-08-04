var ViewLogin = (function() {

/**
 * @param{HTMLElement} p
 * @param{any} f // TODO
 */
function addlabelfieldto(p, f) {
	let l = document.createElement("label");
	l.textContent = f.label+" ";
	l.setAttribute("for", f.name);

	if (f.tag === undefined)
		f.tag = "input";

	let q = document.createElement(f.tag)
	if (f.type) q.setAttribute("type", f.type);
	q.setAttribute("name", f.name);

	if (f.style) q.style = f.style;

	if (f.tag == "select") for (let i = 0; i < f.options.length; i++) {
		let r         = document.createElement("option")
		r.value       = f.options[i].value;
		r.textContent = f.options[i].name;
		q.appendChild(r);
	}

	p.appendChild(l);
	p.appendChild(q);

	return q;
}

function mklogin() {
	let p = document.createElement("form");

		let q = document.createElement("h3");
		q.textContent = "Login";
		q.style.textAlign = "center";

		p.appendChild(q);

			let r = document.createElement("div");
			r.classList.add(Classes.twocols);

			let login = addlabelfieldto(r, {
				"name"  : "login",
				"label" : "Name/email",
				"type"  : "text",
			});
			let passwd = addlabelfieldto(r, {
				"name"  : "passwd",
				"label" : "Password",
				"type"  : "password",
			});

			p.appendChild(r);

		let b = document.createElement("button");
		b.textContent = "Submit";
		b.style.float = "right";

		p.appendChild(b);

	b.addEventListener("click", function(e) {
		e.preventDefault()
		console.log(e);

		RPC.call("/auth/login", {
			"login"  : login.value,
			"passwd" : passwd.value,
		}, function(loginout) {
			setcookietoken(loginout.token);
			console.log(loginout);
			// This should chain the cookie, and
			// load the logout/signout form now.
			return SPA.navigate("/login");
		}, function(y) {
			alert(y.err);
			console.error(y);
		});
	});

	return p;
}

function mksignin() {
	let p = document.createElement("form");

		let q = document.createElement("h3");
		q.textContent = "Sign-in";
		q.style.textAlign = "center";

		p.appendChild(q);

			let r = document.createElement("div");
			r.classList.add(Classes.twocols);

			let name = addlabelfieldto(r, {
				"name"  : "name",
				"label" : "Name",
				"type"  : "text",
			});
			let email = addlabelfieldto(r, {
				"name"  : "email",
				"label" : "Email",
				"type"  : "email",
			});
			let passwd = addlabelfieldto(r, {
				"name"  : "passwd",
				"label" : "Password",
				"type"  : "password",
			});

			p.appendChild(r);

		let b = document.createElement("button");
		b.textContent = "Submit";
		b.style.float = "right";

		p.appendChild(b);

	b.addEventListener("click", function(e) {
		e.preventDefault()
		console.log(e);

		RPC.call("/auth/signin", {
			"name"   : name.value,
			"passwd" : passwd.value,
			"email"  : email.value,
		}, function(signinout) {
			setcookietoken(signinout.token);
			console.log(signinout);
			// This should chain the cookie, and
			// load the logout/signout form now.
			return SPA.navigate("/login");
		}, function(y) {
			alert(y.err);
			console.error(y);
		});
	});

	return p;
}

function mklogout() {
	let p = document.createElement("form");

		let q = document.createElement("h3");
		q.textContent = "Logout";
		q.style.textAlign = "center";

		p.appendChild(q);

		let b = document.createElement("button");
		b.textContent = "Submit";
		b.style.float = "right";

		p.appendChild(b);

	b.addEventListener("click", function(e) {
		e.preventDefault()
		console.log(e);

		RPC.call("/auth/logout", {
			"token"  : getcookietoken(),
		}, function(loginout) {
			setcookietoken("");
			console.log(loginout);
			return SPA.navigate("/login");
		}, function(y) {
			alert(y.err);
			console.error(y);
		});
	});

	return p;
}

function mksignout() {
	let p = document.createElement("form");

		let q = document.createElement("h3");
		q.textContent = "Sign-out";
		q.style.textAlign = "center";

		p.appendChild(q);

		let b = document.createElement("button");
		b.textContent = "Submit";
		b.style.float = "right";

		p.appendChild(b);

	b.addEventListener("click", function(e) {
		e.preventDefault()
		console.log(e);

		if (!window.confirm("Are you sure you want to delete your account?"))
			return;

		RPC.call("/auth/signout", {
			"token"  : getcookietoken(),
		}, function(signoutout) {
			setcookietoken("");
			console.log(signoutout);
			return SPA.navigate("/login");
		}, function(y) {
			alert(y.err);
			console.error(y);
		});
	});

	return p;
}

/**
 * Set the value of the "token" cookie.
 *
 * @param{string} tok
 * @returns{void}
 */
function setcookietoken(tok) {
	document.cookie = "token="+tok;
}

/**
 * Retrieve the value of the "token" cookie.
 *
 * @returns{string}
 */
function getcookietoken() {
	let cs = document.cookie.split("; ");

	for (let i = 0; i < cs.length; i++)
		if (cs[i].startsWith("token="))
			return cs[i].slice("token=".length)

	return ""
}

/**
 * @returns{HTMLElement}
 */
function mklogoutsignout() {
	let p = document.createElement("div");
	p.classList.add(Classes.account);

		p.appendChild(mklogout());
		p.appendChild(mksignout());

	return p;
}

/**
 * @returns{HTMLElement}
 */
function mkaddlicense() {
	let p = document.createElement("div");
	p.textContent = "TODO";
	return p;
}

/**
 * @returns{HTMLElement}
 */
function mkadddata() {
	let p = document.createElement("div");

		let q = document.createElement("h3");
		q.textContent = "Add Data";
		q.style.textAlign = "center";

		p.appendChild(q);

		let r = document.createElement("div")
		r.classList.add(Classes.twocols);

		let name = addlabelfieldto(r, {
			"name"  : "name",
			"label" : "Name",
			"type"  : "text",
		});

		let type = addlabelfieldto(r, {
			"name"    : "type",
			"label"   : "Type",
			"tag"     : "select",
			"options" : Object.values(DataType).map(function(x) {
				return {
					"value" : x,
					"name"  : Utils.capitalize(x),
				};
			}),
		});

		let descr = addlabelfieldto(r, {
			"name"  : "descr",
			"label" : "Descr",
			"type"  : "text",
			"tag"   : "textarea",
			"style" : "height: 5em",
		});

		// TODO: rebuild on type's change; we can use
		// Data.parsers to know which formats are associated
		// to which data type.
		let fmt = addlabelfieldto(r, {
			"name"    : "fmt",
			"label"   : "Format",
			"tag"     : "select",
			"options" : Object.values(DataFmt).map(function(x) {
				return {
					"value" : x,
					"name"  : x,
				};
			}),
		});

		// meh.
/*
		let content = addlabelfieldto(r, {
			"name"  : "content",
			"label" : "Content",
			"type"  : "file",
		});
*/
		let content = addlabelfieldto(r, {
			"name"  : "content",
			"label" : "Content",
			"tag"   : "textarea",
			"style" : "height: 10em",
		});

		let publik = addlabelfieldto(r, {
			"name"  : "public",
			"label" : "Public",
			"type"  : "checkbox",
			"style" : "justify-self:left",
		});

		let urlinfo = addlabelfieldto(r, {
			"name"  : "urlinfo",
			"label" : "URL",
			"type"  : "url",
		});

		p.appendChild(r);

		let b = document.createElement("button");
		b.textContent = "Submit";
		b.style.float = "right";

		p.appendChild(b);

	b.addEventListener("click", function(e) {
		e.preventDefault()
		console.log(e);

		RPC.call("/data/set", {
			"token"   : getcookietoken(),
			"name"    : name.value,
			"type"    : type.value,
			"descr"   : descr.value,
			"fmt"     : fmt.value,
			"public"  : publik.checked,
			"urlinfo" : urlinfo.value,
			"content" : content.value,
		}, function(x) {
			console.log(x);
			alert("added!")
			return SPA.navigate("/login");
		}, function(y) {
			alert(y);
			console.error(y);
		});
	});

	return p;
}

/**
 * Try to chain, and thus test the validity, of the
 * provided cookie token value.
 *
 * @param{string} tok
 * @returns{Promise<HTMLElement>}
 */
function mkmaybesignedin(tok) {
	return RPC.pcall("/auth/chain", {
		"token" : tok
	}).then(function(chainout) {
		setcookietoken(chainout.token);

		let p = document.createElement("div")
		p.classList.add(Classes.account, Classes.twocols);

			p.appendChild(mklogoutsignout());
			p.appendChild(mkadddata());

		return p;
	}).catch(function(error) {
		alert("Session expired (probably): "+error);
		setcookietoken("")
		return mk();
	});
}

/**
 * @returns{HTMLElement|Promise<HTMLElement>}
 */
function mkloginsignin() {
	let p = document.createElement("div");
	p.classList.add(Classes.account);

		p.appendChild(mklogin());
		p.appendChild(mksignin());

	return p;
}

// TODO: rename login.html to account.html?

/**
 * @returns{HTMLElement|Promise<HTMLElement>}
 */
function mk() {
	let tok = getcookietoken()
	if (tok != "")
		return mkmaybesignedin(tok);

	// That's clumsy :shrug
	document.body.style.height   = "unset";
	document.body.style.overflow = "unset";

	document.getElementsByTagName("html")[0].style.height   = "unset";
	document.getElementsByTagName("html")[0].style.overflow = "unset";

	return mkloginsignin();
}

return {
	"mk" : mk,

	// TODO: move those elsewhere
	"getcookietoken" : getcookietoken,
	"setcookietoken" : setcookietoken,
};
})();
