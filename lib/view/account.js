var ViewAccount = (function() {

function mklogin() {
	let p = document.createElement("form");

		let q = document.createElement("h3");
		q.textContent = "Login";
		q.style.textAlign = "center";

		p.appendChild(q);

			let r = document.createElement("form");
			r.classList.add(Classes.twocols);

			let login = Fields.mkaddto(r, {
				"name"   : "login",
				"label"  : "Name/email",
				"ftype"  : "email",
			});
			let passwd = Fields.mkaddto(r, {
				"name"  : "passwd",
				"label" : "Password",
				"ftype" : "password",
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
			Account.settokencookie(loginout.token);
			console.log(loginout);
			// This should chain the cookie, and
			// load the logout/signout form now.
			return SPA.navigate("/account");
		}, function(y) {
			alert(y.err);
			console.error(y);
		});
	});

	return p;
}

/**
 * @param{string} cid - captcha Id
 * @param{string}   cimg - captcha Base64 Img
 * @returns{HTMLElement}
 */
function mksignin(cid, cimg) {
	let p = document.createElement("form");

		let q = document.createElement("h3");
		q.textContent = "Sign-in";
		q.style.textAlign = "center";

		p.appendChild(q);

			let r = document.createElement("form");
			r.classList.add(Classes.twocols);

			let name = Fields.mkaddto(r, {
				"name"  : "name",
				"label" : "Name",
				"ftype" : "string",
			});
			let email = Fields.mkaddto(r, {
				"name"  : "email",
				"label" : "Email",
				"ftype" : "email",
			});
			let passwd = Fields.mkaddto(r, {
				"name"  : "passwd",
				"label" : "Password",
				"ftype" : "password",
			});

			let answer = Fields.mkaddto(r, {
				"name"  : "answer",
				"label" : "Captcha answer",
				"ftype" : "string",
			});

			p.appendChild(r);

		let i = document.createElement("img");
		i.src = cimg;
		p.appendChild(i);

		let id   = document.createElement("input");
		id.type  = "text";
		id.style.display = "none";
		id.value = cid;

		// not even needed
		p.appendChild(i);

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

			"CaptchaId"     : id.value,
			"CaptchaAnswer" : answer.value,
		}, function(signinout) {
			if (!signinout.CaptchaMatch) {
				alert("captcha mismatch")
				return RPC.pcall("/captcha/get").then(function(x) {
					i.src = x.B64Img;
					id.value = x.Id;
				});
			}

			Account.settokencookie(signinout.token);
			console.log(signinout);
			// This should chain the cookie, and
			// load the logout/signout form now.
			return SPA.navigate("/account");
		}, function(y) {
			alert(y.err);
			console.error(y);
			return RPC.pcall("/captcha/get").then(function(x) {
				i.src = x.B64Img;
				id.value = x.Id;
			});
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
			"token"  : Account.gettokencookie(),
		}, function(loginout) {
			Account.rsttokencookie();
			console.log(loginout);
			return SPA.navigate("/account");
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
			"token"  : Account.gettokencookie(),
		}, function(signoutout) {
			Account.rsttokencookie();
			console.log(signoutout);
			return SPA.navigate("/account");
		}, function(y) {
			alert(y.err);
			console.error(y);
		});
	});

	return p;
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
 * @param{any} ds -- TODO
 * @param{any} ls -- TODO
 * @returns{HTMLElement}
 */
function mkadddata(ds, ls) {
	let p = document.createElement("form");

		let q = document.createElement("h3");
		q.textContent = "My Data";
		q.style.textAlign = "center";

		p.appendChild(q);

		let action = Fields.mkaddto(p, {
			"name"    : "action",
			"ftype"   : "enum",
			"options" : [
				{
					"value" : "add",
					"name"  : "Add new data",
				},
			// @ts-ignore TODO
			].concat(ds.map(function(d) {
				return {
					"value" : d.Id,
					"name"  : "Edit '"+d.Name+"'",
				};
			})),
		});

		let r = document.createElement("form")
		r.classList.add(Classes.twocols);

			let name = Fields.mkaddto(r, {
				"name"  : "name",
				"label" : "Name",
				"ftype" : "string",
			});

			let type = Fields.mkaddto(r, {
				"name"    : "type",
				"label"   : "Type",
				"ftype"   : "enum",
				"options" : Object.values(DataType).map(function(x) {
					return {
						"value" : x,
						"name"  : Utils.capitalize(x),
					};
				}),
			});

			let descr = Fields.mkaddto(r, {
				"name"  : "descr",
				"label" : "Descr",
				"ftype" : "text",
				"style" : "height: 5em",
			});

			// TODO: rebuild on type's change; we can use
			// Data.parsers to know which formats are associated
			// to which data type.
			let fmt = Fields.mkaddto(r, {
				"name"    : "fmt",
				"label"   : "Format",
				"ftype"   : "enum",
				"options" : Object.values(DataFmt).map(function(x) {
					return {
						"value" : x,
						"name"  : x,
					};
				}),
			});

			// meh.
	/*
			let content = Fields.mkaddto(r, {
				"name"  : "content",
				"label" : "Content",
				"type"  : "file",
			});
	*/
			let content = Fields.mkaddto(r, {
				"name"  : "content",
				"label" : "Content",
				"ftype" : "text",
				"style" : "height: 10em",
			});

			let publik = Fields.mkaddto(r, {
				"name"  : "public",
				"label" : "Public",
				"ftype" : "bool",
				"style" : "justify-self:left",
			});

			let urlinfo = Fields.mkaddto(r, {
				"name"  : "urlinfo",
				"label" : "URL",
				"ftype" : "url",
			});

			// TODO: this should be a standalone field.
			let license = Fields.mkaddto(r, {
				"name"    : "license",
				"label"   : "License",
				"ftype"   : "enum",
				// @ts-ignore TODO
				"options" : ls.map(function(l) {
					return {
						"value" : l.Id,
						"name"  : Utils.capitalize(l.Name),
					};
				}),
			});

			p.appendChild(r);

		let b = document.createElement("button");
		b.textContent = "Submit";
		b.style.float = "right";

		p.appendChild(b);

	/** @param{number} id */
	function loadData(id) {
		for (let i = 0; i < ds.length; i++) if (ds[i].Id == id) {
			name.value     = ds[i].Name;
			type.value     = ds[i].Type;
			descr.value    = ds[i].Descr;
			fmt.value      = ds[i].Fmt;
			publik.checked = ds[i].Public;
			urlinfo.value  = ds[i].UrlInfo;
			content.value  = ds[i].Content;
			license.value  = ds[i].LicenseId;
		}
	}

	function rstData() {
		name.value     = "";
		type.value     = "";
		descr.value    = "";
		fmt.value      = "";
		publik.checked = false;
		urlinfo.value  = "";
		content.value  = "";
		license.value  = "";
	}

	// @ts-ignore TODO
	action.addEventListener("change", function(e) {
		if (action.value != "add") loadData(parseInt(action.value))
		else rstData()
	});

	b.addEventListener("click", function(e) {
		e.preventDefault()
		console.log(e);

		// XXX perhaps one route will do?
		let route = action.value == "add" ? "/data/set" : "/data/edit";

		RPC.call("/data/set", {
			"token"     : Account.gettokencookie(),
			"name"      : name.value,
			"type"      : type.value,
			"descr"     : descr.value,
			"fmt"       : fmt.value,
			"public"    : publik.checked,
			"urlinfo"   : urlinfo.value,
			"content"   : content.value,
			// Be cautious: if this is sent as a string, golang
			// fails to parse it as an int64 and default to zero.
			"licenseid" : parseInt(license.value),
		}, function(x) {
			console.log(x);
			alert("added!")
			return SPA.navigate("/account");
		}, function(y) {
			alert(y);
			console.error(y);
		});
	});

	return p;
}

/**
 * Try to check the given token's validity, and decide
 * as to whether we sohuld display the logged-in/out account
 * page.
 *
 * @param{string} tok
 * @returns{Promise<HTMLElement>}
 */
function mkmaybesignedin(tok) {
	// This will fail if we're not logged-in
	return RPC.pcall("/get/my/data", {
		"token" : tok,
	}).then(function(getmydataout) {
		return RPC.pcall("/get/licenses").then(
			function(getlicensesout) {
				let p = document.createElement("div")
				p.classList.add(Classes.account, Classes.twocols);

					p.appendChild(mklogoutsignout());
					// TODO: we shouldn't need to || []
					p.appendChild(mkadddata(
						getmydataout.Datas || [],
						getlicensesout.Licenses || [],
					));

				return p;
			});
	}).catch(function(error) {
		alert("Session expired (probably): "+error);
		Account.rsttokencookie()
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

		// XXX a bit clumsy to do it within mkadddata() as-is
		return RPC.pcall("/captcha/get").then(function(x) {
			p.appendChild(mksignin(x.Id, x.B64Img));
			return p;
		});
}

// TODO: rename login.html to account.html?

/**
 * @returns{HTMLElement|Promise<HTMLElement>}
 */
function mk() {
	let tok = Account.gettokencookie()
	if (tok != "")
		return mkmaybesignedin(tok);

	// That's clumsy :shrug:
	document.body.style.height   = "unset";
	document.body.style.overflow = "unset";

	document.getElementsByTagName("html")[0].style.height   = "unset";
	document.getElementsByTagName("html")[0].style.overflow = "unset";

	return mkloginsignin();
}

return {
	"mk" : mk,
};
})();
