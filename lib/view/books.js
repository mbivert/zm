var ViewBooks = (function() {

/*
 * @returns{HTMLElement}
 */
function mkhighlights() {
	let p = document.createElement("div");

	p.innerHTML = `
	<h3>Highlights (public)</h3>
	<p>San Bai Qian:</p>
	<ul>
		<li><a href="trbook.html#b=san-zi-jing">Sānzì Jīng (三字經)</a>;</li>
		<li><a href="trbook.html#b=san-zi-jing-fr">Sānzì Jīng (三字經) (français)</a>;</li>
		<li><a href="book.html#b=bai-jia-xing">Bǎijiā Xìng (百家姓)</a>;</li>
		<li><a href="book.html#b=qian-zi-wen">Qiānzì Wén (千字文)</a>.</li>
	</ul>
	<p>Seven military classics of ancient China (武經七書):</p>
	<ul>
		<li><a href="trbook.html#b=art-of-war">Sun-Tzu's Art of war (孫子兵法, partial)</a>.</li>
	</ul>
	<p>Ancient dictionaries:</p>
	<ul>
		<li><a href="book.html#b=shuo-wen-jie-zi">Shuōwén Jiězì (說文解字)</a>.</li>
	</ul>
	<p>Russian test:</p>
	<ul>
		<li><a href="book.html#b=father-serge-tolstoi">Father Serge, Tolstoï (Отец Сергий, Толстой)</a>.</li>
	</ul>
`;

	return p;
}

/**
 * @param{any} bs TODO
 * @returns{HTMLElement}
 */
function mkbooks(bs) {
	let p = document.createElement("p")

	for (let i = 0; i < bs.length; i++) {
		let q = document.createElement("div");

			let a = document.createElement("a");
			a.textContent = bs[i].name;
			a.href = "/book.html#b="+bs[i].file;

			q.appendChild(a);

		p.appendChild(q);
	}

	return p;
}

/**
 * @param{any} bs TODO
 * @returns{HTMLElement}
 */
function mkothers(bs) {
	let p = document.createElement("div");

	{
		let q = document.createElement("h3");
		q.textContent = "Public";
		p.appendChild(q);

		// TODO
		// @ts-ignore
		p.appendChild(mkbooks(bs.filter(function(b) { return !b.Owned })));
	}

	{
		let q = document.createElement("h3");
		q.textContent = "Owned";
		p.appendChild(q);

		// TODO
		// @ts-ignore
		p.appendChild(mkbooks(bs.filter(function(b) { return b.Owned })));
	}

	return p;
}

/**
 * Try to chain, and thus test the validity, of the
 * provided cookie token value.
 *
 * @param{string} tok
 * @returns{Promise<HTMLElement>}
 */
function mkmaybeothers(tok) {
	return RPC.pcall("/data/get/books", {
		"token" : tok
	}).then(function(x) {
		console.log(x);
		return mkothers(x.books)

	// TODO: better error management (could be e.g. SQL error)
	}).catch(function(error) {
		alert("Session expired (probably): "+error);
		Account.settokencookie("");
		return document.createElement("div");
	});
}
/**
 * For now, just a static list. Eventually, we'll want
 * to loop on our database, as we do for ./about.js.
 *
 * But we'll then have to distinguish between "public" and
 * "private" books.
 *
 * @returns{HTMLElement}
 */
function mk() {
	let p = document.createElement("div");
	// TODO: should be in Classes
	p.classList.add("main-books", Classes.twocols);

	p.appendChild(mkhighlights());

	let tok = Account.gettokencookie()
	if (tok != "") mkmaybeothers(tok).then(function(q) {
		p.appendChild(q)
	});

	// That's clumsy :shrug
	document.body.style.height   = "unset";
	document.body.style.overflow = "unset";

	document.getElementsByTagName("html")[0].style.height   = "unset";
	document.getElementsByTagName("html")[0].style.overflow = "unset";

	return p;
}

return {
	"mk" : mk,
};
})();
