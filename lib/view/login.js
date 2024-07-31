var ViewLogin = (function() {

/**
 * Create a form holding the given fields.
 */
function mkform() {
}

/**
 * TODO:
 * @param{HTMLElement} p
 * @param{any} f
 */
function addlabelfieldto(p, f) {
	let l = document.createElement("label");
	l.textContent = f.label+" ";
	l.setAttribute("for", f.name);

	let q = document.createElement("input")
	q.setAttribute("type", f.type);
	q.setAttribute("name", f.name);

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
	let p = document.createElement("div");
	p.textContent = "TODO";
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
 * Try to chain, and thus test the validity, of the
 * provided cookie token value.
 *
 * @param{string} tok
 * @returns{Promise<HTMLElement>}
 */
function mkmaybesignout(tok) {
	return RPC.pcall("/auth/chain", {
		"token" : tok
	}).then(function(chainout) {
		setcookietoken(chainout.token);
		return mklogout(); // also, signout I guess (TODO)
	}).catch(function(error) {
		alert("Session expired (probably): "+error);
		setcookietoken("")
		return mk();
	});
}

// TODO: rename login.html to account.html?

/**
 * @returns{HTMLElement|Promise<HTMLElement>}
 */
function mk() {
	let tok = getcookietoken()
	console.log("ViewLogin.mk() ", tok);
	if (tok != "")
		return mkmaybesignout(tok);

	let p = document.createElement("div");
	p.classList.add(Classes.loginsignin);

		p.appendChild(mklogin());
		p.appendChild(mksignin());

	return p;
}

return {
	"mk" : mk,
};
})();
