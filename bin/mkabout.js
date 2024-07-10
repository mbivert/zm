/*
 * Quick script used to generate about.html's content on stdout.
 * Generated from what we currently have in database; could be
 * prettier but does the job.
 */
import * as DB     from "../modules/db.js";
import * as Assert from "../modules/assert.js";
import * as Config from "../modules/config.js";

/**
 * Data type : [[name, url, license, license url], ...]
 *
 * @type{Object.<string, Array<[string, string, string, string]>>}
 */
var datas = {
	"dict"   : [],
	"decomp" : [],
	"big5"   : [],
	"book"   : [],

	// Not in database (yet?)
	"audio"  : [
		[
			"AllSet Learning", "https://www.allsetlearning.com/",
			"CC BY-NC-SA 3.0", "https://creativecommons.org/licenses/by-nc-sa/3.0/",
		],
		[
			"Davinfifield", "https://github.com/davinfifield/mp3-chinese-pinyin-sound",
			"Unlicense",    "https://unlicense.org/",
		],
	],
	"img"    : [
		[
			"WikiMedia Stroke Order Project",
			"https://commons.wikimedia.org/wiki/Commons:Ancient_Chinese_characters_project",
			"CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0/",
		],
		[
			"WikiMedia Ancient Chinese characters project",
			"https://commons.wikimedia.org/wiki/Commons:Ancient_Chinese_characters_project",
			"CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0/",
		],
	],
};

for (var i = 0; i < DB.datas.length; i++) {
	// Home made data; not necessary.
	if (DB.datas[i].UrlInfo == "https://www.zhongmu.eu/")
		continue;

	datas[DB.datas[i].Type].push([
		DB.datas[i].Name,
		DB.datas[i].UrlInfo,
		DB.datas[i].License,
		DB.datas[i].UrlLicense,
	]);
}

/** @type{Object.<string, string>} */
var datanames = {
	"dict"   : "Dictionaries",
	"decomp" : "Decomposition tables",
	"book"   : "Books",
	"img"    : "Images",
	"audio"  : "Audio",
	"big5"   : "Unicode/Big5 tables",
}

/** @type{(arg0 : string) => string} */
function datasection(t) {
	if (!(t in datanames)) {
		Assert.assert(t+" not in datanames");
		return "";
	}

	if (!(t in datas)) {
		Assert.assert(t+" not in datas");
		return "";
	}

	var s = "<h3>"+datanames[t]+"</h3>\n"
	s += "<p>Are currently supported to various degrees:</p><ul>";

	for (var i = 0; i < datas[t].length; i++) {
		s += "<li>"
		s += '<a href="'+datas[t][i][1]+'">'+datas[t][i][0]+'</a>, ';
		s += '<a href="'+datas[t][i][3]+'">'+datas[t][i][2]+'</a>;';
		s += "</li>\n";
	}

	return s+"</ul>\n";
}

/** @type{() => string} */
function body() {
	var s = "";

	for (var t of ["dict", "decomp", "book", "img", "audio", "big5"])
		s += datasection(t);

	return s;
}

/** @type{() => string} */
function header() {
	return `
<style>
	html, body {
		height   : unset !important;
		overflow : unset !important;
	}
</style>

<h2>Contact</h2>
<p>You can contact <a href="https://tales.mbivert.com/about">me</a> by
email at mathieu.<span style="display: none">nope</span>bivert chez:</p>

<img src="${Config.root}/me.png" alt="email" />

<h2>Resources</h2>
<p>We rely on several resources that are at least free for
non-commercial use.</p>

<p>If you find this software useful, you may want to consider
donating to either
<a href="https://www.mdbg.net/chinese/dictionary?page=donation">MDBG</a>
(CC-CEDICT's maintainers) or to
<a href="https://donate.wikimedia.org/wiki/Ways_to_Give">Wikimedia</a>,
or to the maintainers of any other data sources used by this project.</p>
`
}

/** @type{() => string} */
function footer() {
	return `<!-- <h2>License</h2>
</p>All this software is available under a
<a href="https://opensource.org/licenses/BSD-3-Clause">BSD</a> license.</p>
-->
</div>
<script>
	window.addEventListener('load', function() {
		require(["dom"], function(Dom) {
			Dom.loaded()
		});
	});
</script>
`
}

console.log(header());
console.log(body());
console.log(footer());
