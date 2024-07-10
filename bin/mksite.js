/*
 * This is a quick and dirty "SSG".
 *
 * We may want to upgrade to something more refined later,
 * for now this does the job.
 */
import * as Node   from '../modules/node.js'
import * as Config from '../modules/config.js'

// @ts-ignore
import * as path   from 'path';

/**
 * Output HTML file header.
 *
 * NOTE: uses Config.{root,version}.
 *
 * Input:
 *	@param{string} t - title
 * Output:
 *	@returns{string} - HTML header as a string.
 */
function mkhead(t) {
	return `<!DOCTYPE html>
<html>
	<head>
		<!-- Google tag (gtag.js) -->
		<script async src="https://www.googletagmanager.com/gtag/js?id=G-CR2JJD19S0"></script>
		<script>
			window.dataLayer = window.dataLayer || [];
			function gtag(){dataLayer.push(arguments);}
			gtag('js', new Date());
			gtag('config', 'G-CR2JJD19S0');
		</script>

		<title>Zhongmu - ${t}</title>

		<meta charset="utf-8" />

		<link type="text/css" rel="stylesheet" href="${Config.root}/zm.css?v=${Config.version}"   />
		<link type="text/css" rel="stylesheet" href="${Config.root}/show.css?v=${Config.version}" />

		<script src="${Config.root}/pako.min.js?v=${Config.version}"></script>
		<script src="${Config.root}/require.min.js?v=${Config.version}"></script>
		<script src="${Config.root}/full.js?v=${Config.version}"></script>

		<meta name="description" content="Chinese character deep recursive inspection" />
		<meta name="robots" content="index, archive" />
		<meta name="keywords" content="Chinese language, character decomposition, San Bai Qian">
		<meta name="author" content="Mathieu Bivert" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	</head>
	<body>
		<div id="loading"><span id="loading-wheel"></span></div>

		<div id="content">
			<div id="header">
				<div id="menu">
					<ul>
						<li><a href="${Config.root}/index.html">🏠</a></li>
						<li><a href="${Config.root}/books.html">Books</a></li>
						<li><a href="${Config.root}/help.html">Help</a></li>
						<li><a href="${Config.root}/about.html">About</a></li>
					</ul>
				</div>
				<div id="important">
					You may want to
					<a href="https://organharvestinvestigation.net/">document</a>
					yourself about human rights in China.
				</div>
			</div>
`;
}

/**
 * Output HTML file header.
 *
 * Input:
 * Output:
 *	@returns{string} - HTML header as a string.
 */
function mktail() {
	return `
			<div id="footer">
				<p> © Last update: 2024-03-02 - WIP, Code & data soon available; optimised for desktop</p>
			</div>
		</div>
	</body>
</html>
`;
}

/**
 * Wrap the given HTML bits between a head and a body.
 *
 * Input:
 *	@param{string} t - page's title
 *	@param{string} s - page's HTML content
 * Output:
 *	@returns{string} - full HTML page
 */
function wrap(t, s) { return mkhead(t)+s+mktail(); }

/** @type{Array.<Array.<string>>} */
var site = [
	// outputh path, title, input path/content
	[ "index.html",       "Chinese character inspection", "content/index.html"       ],
	[ "book.html",        "Book viewing",                 "content/book.html"        ],
	[ "trbook.html",      "Translated book viewing",      "content/trbook.html"      ],
	[ "help.html",        "Help",                         "content/help.html"        ],
	[ "about.html",       "About",                        "content/about.html"       ],
	[ "books.html",       "Books",                        "content/books.html"       ],
];

/**
 * Create the described site from input directory to output directory.
 *
 * Input:
 *	@param{Array.<Array.<string>>} site   - site description
 *	@param{string}     input  - input directory
 *	@param{string}     output - output directory
 * Output:
 */
function mksite(site, input, output) {
	for (var i = 0; i < site.length; i++) {
		var [p, t, c] = site[i];
		Node.writef(output+"/"+p, wrap(t, Node.readf(input+"/"+c)));
	}
}

/*
 * CLI arguments parsing
 */
// @ts-ignore
if (process.argv.length < 3) {
	// @ts-ignore
	console.log(path.basename(process.argv[1]) +" <path/to/input> <path/to/output>");
	// @ts-ignore
	process.exit(1);
}

// @ts-ignore
var [input, output]  = [process.argv[2], process.argv[3]];

// XXX fear.
Node.system("rm -rf "+output);
Node.system("cp -rf "+input+"/base "+output)
mksite(site, input, output);
