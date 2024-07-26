let ViewBooks = (function() {

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
	p.classList.add("main-books");

	p.innerHTML = `
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
