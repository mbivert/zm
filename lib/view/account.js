var ViewAccount = (function() {

function mklogin() {
	let p = document.createElement("form");

		let q = document.createElement("h3");
		q.textContent = "Login";
		q.style.textAlign = "center";

		p.appendChild(q);

			let r = document.createElement("div");
			r.classList.add(Classes.twocols);

			/** @type{Array<FieldHTMLElement>} */
			let fs = [];

			fs.push(Fields.mkaddto(r, {
				"name"   : "login",
				"label"  : "Name/email",
				"ftype"  : "email",
			}));
			fs.push(Fields.mkaddto(r, {
				"name"  : "passwd",
				"label" : "Password",
				"ftype" : "password",
			}));

			p.appendChild(r);

		let b = document.createElement("button");
		b.textContent = "Submit";
		b.style.float = "right";

		p.appendChild(b);

	b.addEventListener("click", function(e) {
		e.preventDefault()
		console.log(e);

		RPC.call("/auth/login", Fields.getall(fs), function(loginout) {
			console.log(loginout);
			// This should check the cookie, and
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

			let r = document.createElement("div");
			r.classList.add(Classes.twocols);

			/** @type{Array<FieldHTMLElement>} */
			let fs = [];

			fs.push(Fields.mkaddto(r, {
				"name"  : "name",
				"label" : "Name",
				"ftype" : "string",
			}));
			fs.push(Fields.mkaddto(r, {
				"name"  : "email",
				"label" : "Email",
				"ftype" : "email",
			}));
			fs.push(Fields.mkaddto(r, {
				"name"  : "passwd",
				"label" : "Password",
				"ftype" : "password",
			}));

			fs.push(Fields.mkaddto(r, {
				"name"  : "CaptchaAnswer",
				"label" : "Captcha answer",
				"ftype" : "string",
			}));

			p.appendChild(r);

		let i = document.createElement("img");
		i.src = cimg;
		p.appendChild(i);

		let id = Fields.mk({
			"name"  : "CaptchaId",
			"ftype" : "string",
			"style" : "display:none",
			"value" : cid,
		})[0];

		p.appendChild(i);
		fs.push(id);
		p.appendChild(id);

		let b = document.createElement("button");
		b.textContent = "Submit";
		b.style.float = "right";

		p.appendChild(b);

	b.addEventListener("click", function(e) {
		e.preventDefault()
		console.log(e);

		RPC.call("/auth/signin", Fields.getall(fs), function(signinout) {
			if (!signinout.captchamatch) {
				alert("Captcha mis-match")
				return RPC.pcall("/captcha/get").then(function(x) {
					i.src = x.b64img;
					id.value = x.id;
				});
			}

			console.log(signinout);

			// Reload the account page now that we're logged-in
			return SPA.navigate("/account");
		}, function(y) {
			alert(y.err);
			console.error(y);
			return RPC.pcall("/captcha/get").then(function(x) {
				i.src = x.b64img;
				id.value = x.id;
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

		RPC.call("/auth/logout", {}, function(loginout) {
			Account.rst();
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

		RPC.call("/auth/signout", {}, function(signoutout) {
			Account.rst();
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

		/** @type{Array<FieldHTMLElement>} */
		let fs = [];

		let action = Fields.mkaddto(p, {
			"name"    : "id",
			"ftype"   : "enumnum",
			"options" : [
				{
					"value" : -1,
					"name"  : "Add new data",
				},
			// @ts-ignore TODO
			].concat(ds.map(function(d) {
				return {
					"value" : d.id,
					"name"  : "Edit '"+d.name+"'",
				};
			})),
		});
		fs.push(action)

		let r = document.createElement("form")
		r.classList.add(Classes.twocols);

			fs.push(Fields.mkaddto(r, {
				"name"  : "name",
				"label" : "Name",
				"ftype" : "string",
			}));

			fs.push(Fields.mkaddto(r, {
				"name"    : "type",
				"label"   : "Type",
				"ftype"   : "enumstr",
				"options" : Object.values(DataType).map(function(x) {
					return {
						"value" : x,
						"name"  : Utils.capitalize(x),
					};
				}),
			}));

			fs.push(Fields.mkaddto(r, {
				"name"  : "descr",
				"label" : "Descr",
				"ftype" : "text",
				"style" : "height: 5em",
			}));

			// TODO: rebuild on type's change; we can use
			// Data.parsers to know which formats are associated
			// to which data type.
			fs.push(Fields.mkaddto(r, {
				"name"    : "fmt",
				"label"   : "Format",
				"ftype"   : "enumstr",
				"options" : Object.values(DataFmt).map(function(x) {
					return {
						"value" : x,
						"name"  : x,
					};
				}),
			}));

			// meh.
	/*
			let content = Fields.mkaddto(r, {
				"name"  : "content",
				"label" : "Content",
				"type"  : "file",
			});
	*/
			fs.push(Fields.mkaddto(r, {
				"name"  : "content",
				"label" : "Content",
				"ftype" : "text",
				"style" : "height: 10em",
			}));

			fs.push(Fields.mkaddto(r, {
				"name"  : "public",
				"label" : "Public",
				"ftype" : "bool",
				"style" : "justify-self:left",
			}));

			fs.push(Fields.mkaddto(r, {
				"name"  : "urlinfo",
				"label" : "URL",
				"ftype" : "url",
			}));

			// TODO: this should be a standalone field.
			fs.push(Fields.mkaddto(r, {
				"name"    : "licenseid",
				"label"   : "License",
				"ftype"   : "enumnum",
				// @ts-ignore TODO
				"options" : ls.map(function(l) {
					return {
						"value" : l.id,
						"name"  : Utils.capitalize(l.name),
					};
				}),
			}));

			p.appendChild(r);

		let b = document.createElement("button");
		b.textContent = "Submit";
		b.style.float = "right";

		p.appendChild(b);

	/** @param{number} id */
	function loadData(id) {
		for (let i = 0; i < ds.length; i++) if (ds[i].id == id)
			Fields.setall(fs, ds[i])
	}

	// @ts-ignore TODO
	action.addEventListener("change", function(e) {
		if (action.get() != -1) loadData(action.get())
		else Fields.rstall(fs)
	});

	b.addEventListener("click", function(e) {
		e.preventDefault()
		console.log(e);

		// XXX perhaps one route will do?
		let route = action.get() == -1 ? "/data/set" : "/data/edit";

		RPC.call("/data/set", Fields.getall(fs), function(x) {
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
 * @returns{Promise<HTMLElement>}
 */
function mkmaybesignedin() {
	// This will fail if we're not logged-in
	return RPC.pcall("/get/my/data").then(function(getmydataout) {
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
		Account.rst()
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
			p.appendChild(mksignin(x.id, x.b64img));
			return p;
		});
}

/**
 * @returns{HTMLElement|Promise<HTMLElement>}
 */
function mk() {
	if (Account.isconnected())
		return mkmaybesignedin();

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
