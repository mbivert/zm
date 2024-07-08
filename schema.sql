-- NOTE: 2023-03-15: sqlite3 stopped reading this file because
-- of double-quoted strings (see Data table, "CHECK (Type IN (...")
--
-- I've switched to single quotes everywhere, but haven't bothered
-- fixing the possesive s (e.g. Sun Tzu's Art of War)
--
-----------------------------------------------------------------------------
--
-- This is a preemptive attempt to normalize our data management.
-- For now, this is converted to JSON through SQLite, and injected
-- to JavaScript; later on, a similar operation is expected to be performed
-- through an AJAX call.
--
-- The goal here is to draft data-related upcoming features, and
-- to start sketching our SQL database format.
--
-- We're currently only using a small subset from those data, enough
-- to implement a multidict/multidecomp cut mechanism; what remains can
-- be considered unstable. As such, data usage is properly wrapped
-- in JavaScript code to avoid polluting the code too far.
--
-- Later features will include:
--	- [prepared] automatic external ressource update (see ./update-data.go)
--	- [prepared] automatic data formatting (see ./update-data.go)
--	- [prepared] data metadata (license, URLs, description, etc.) web
--	  display
--	- data versioning
--		- This is a bit tricky, but should become handy, especially
--		  considering our the patches-chain feature. We'll likely need an
--		  extra table to store all versions of a Resource, separating
--		  versions per date (YYYYMMDDHHMMSS).
--		- See also ./update-data.go
--	- ownership and data sharing
--		- User/group models and data sharing models aren't designed yet.
--		- See also ./schema2.sql and ./update-data.go
--	- Likely, automatic go(1) code generation through sqlc, hence the
--	  peculiar CamelCase field naming, and hence why we try to stick to
--	  standard SQL (e.g. CHECK(x IN (...)) instead of enums).
--	- We intend to prototype the thing with SQLite, and eventually move to
--	  PostgreSQL once the design is stable, so as not to have to worry about
--	  PostgreSQL settings for now.
-----------------------------------------------------------------------------

-- External ressources for which we keep a local copy of the raw,
-- unformatted data.
--
-- The same unformatted data can be formatted in multiple ways,
-- e.g. wikisource's 說文解字 gets transformed in a cc-cedict formatted
-- dictionary and as a markdown book.
CREATE TABLE Resource (
	Id        BIGSERIAL PRIMARY KEY,

	Name      TEXT      UNIQUE NOT NULL,

	-- URL of file or similar
	UrlFetch  TEXT,

	-- Optional field referencing a command to be executed
	-- to update file's content from remote location.
	Fetcher   TEXT,

	-- Path to local version of the file; enforce
	-- uniqueness for safety.
	File      TEXT      UNIQUE NOT NULL
);

-- Available data files.
CREATE TABLE Data (
	Id        BIGSERIAL PRIMARY KEY,

	-- Acts as a textual ID in JavaScript code, for clarity to users.
	Name      TEXT      UNIQUE NOT NULL,

	Type      TEXT CHECK(Type IN (
		-- Dictionaries
		'dict',

		-- Decomposition tables
		'decomp',

		-- UTF8 / BIG5 correspondance tables
		'big5',

		-- Book, article, text to be inspected
		'book'
	))                  NOT NULL,

	Descr     TEXT,

	-- Path to formatted Resource.File
	File       TEXT,

	-- Command used to create .File from Resource.File
	Formatter   TEXT,

	-- .File's format, that is, what .Formatter is supposed
	-- to have created.
	Fmt       TEXT CHECK(fmt IN (
		-- CC-CEDICT "extended" (+basic patching abilities)
		'cc-cedict',

		-- Wikimedia "extended" (+basic patching abilities)
		'wm-decomp',

		-- CHISE project IDs format
		'chise',

		-- Same format as unicode.org's table
		'unicode-big5',

		-- Pseudo-markdown formatted book.
		'markdown',

		-- XXX to be removed
		'sw-markdown',

		-- Basic "word\tdefinitions" format; perhaps temporary
		'simple-dict'
	))                  NOT NULL,

	-- The code that loads a file from its .Fmt sometimes needs
	-- additional parameters (e.g. EOL). Typically a small JSON blob.
	--
	-- Note that we could have used .Formatter to avoid such peculiarities
	-- and normalize the formats. We may do so in the future.
	FmtParams TEXT,

	-- URL of the project if any
	UrlInfo  TEXT
);

-- For clarity's sake, we want to display licenses of the
-- various external ressources we're using.
CREATE TABLE License (
	Id    BIGSERIAL PRIMARY KEY,
	Name  TEXT      UNIQUE NOT NULL,
	Descr TEXT,
	URL   TEXT
);

-- Join table between Data & License
CREATE TABLE DataLicense (
	DataId     BIGSERIAL,
	LicenseId  BIGSERIAL,

	-- URL where to check for license
	URL        TEXT,

	-- Comment on license assignment.
	Comment   TEXT,

	CONSTRAINT fk_data    FOREIGN KEY (DataId)
		REFERENCES Data(Id)    ON DELETE CASCADE,
	CONSTRAINT fk_license FOREIGN KEY (LicenseId)
		REFERENCES License(Id) ON DELETE CASCADE
);

-- Join table between Data & Resource
CREATE TABLE DataResource (
	DataId     BIGSERIAL,
	ResourceId BIGSERIAL,

	CONSTRAINT fk_data    FOREIGN KEY (DataId)
		REFERENCES Data(Id)    ON DELETE CASCADE,
	CONSTRAINT fk_ressource FOREIGN KEY (ResourceId)
		REFERENCES Resource(Id) ON DELETE CASCADE
);

--------------------------------------------------------------
-- Numerical IDs below are dumb. Not sure there's a generic
-- SQL auto-increment feature; we'll add those via proper
-- SQL requests yet to be written anyway.

-- Known licenses
INSERT INTO License
	(Id, Name,          Descr,            URL)
VALUES
	(1,  'CC0 1.0',           'Public domain', 'https://creativecommons.org/publicdomain/zero/1.0/'),
	(2,  'CC BY-SA 3.0',      '',              'https://creativecommons.org/licenses/by-sa/3.0/'),
	(3,  'CC BY-SA 4.0',      '',              'https://creativecommons.org/licenses/by-sa/4.0/'),
	(4,  'Unicode ToS',       '',              'https://www.unicode.org/copyright.html'),
	(5,  'GPLv2',             '',              'https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html'),
	(6,  'CC BY-SA 2.0',      '',              'https://creativecommons.org/licenses/by-sa/2.0/'),
	(7,  'CC BY-NC-SA 3.0',   '',              'https://creativecommons.org/licenses/by-nc-sa/3.0/'),
	(8,  'Unlicense',         'Public domain', 'https://unlicense.org/'),
	(9,  'Gutenberg license', '',              'http://gutenberg.org/license')
	;

-- External resources.
INSERT INTO Resource
	(Id, Name, UrlFetch, Fetcher, File)
VALUES
	(
		1, 'CC-CEDICT',
		'https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz',
		'fetch-cc-cedict.sh', 'data/raw/dict/cc-cedict.csv'
	),
	(
		2, 'WM-decomp',
		'https://commons.wikimedia.org/wiki/Commons:Chinese_characters_decomposition',
		'fetch-wm-decomp.sh', 'data/raw/decomp/wm-decomp.csv'
	),
	(
		3, 'Unicode-BIG5',
		'https://unicode.org/Public/MAPPINGS/OBSOLETE/EASTASIA/OTHER/BIG5.TXT',
		'fetch-unicode-big5.sh', 'data/raw/big5/unicode-big5.csv'
	),
	(
		4, 'Shuowen Jiezi (Wikisource)',
		'https://ws-export.wmcloud.org/?lang=zh&page=%E8%AA%AA%E6%96%87%E8%A7%A3%E5%AD%97&format=txt&fonts=&credits=false',
		'fetch-shuowen-jiezi.sh', 'data/raw/wikisource/shuowenjiezi.txt'
	),
	(
		5, 'CHISE',
		'https://gitlab.chise.org/CHISE/ids.git',
		'fetch-chise-decomp.sh', 'data/raw/decomp/chise-decomp.csv'
	),
	(
		6, 'CFDICT',
		'https://chine.in/mandarin/dictionnaire/CFDICT/cfdict.zip',
		'fetch-cfdict.sh', 'data/raw/dict/cfdict.csv'
	),
	(
		7, 'HanDeDict',
		'https://handedict.zydeo.net/api/export/download',
		'fetch-handedict.sh', 'data/raw/dict/handedict.csv'
	),
	(
		8, 'OpenRussian',
		'https://github.com/Badestrand/russian-dictionary.git',
		'fetch-openrussian-dict.sh', 'data/raw/dict/openrussian.csv'
	)
	;

INSERT INTO Data
	(Id, Name, Type, Descr, Fmt, FmtParams, File, Formatter, UrlInfo)
VALUES
	(
		1, 'CC-CEDICT', 'dict', 'Chinese/English dictionary',
		'cc-cedict', '{eol:"\r\n",cols:[0]}',
		'data/dict/cc-cedict.csv.gz', 'cat',
		'https://cc-cedict.org/wiki/'
	),
	(
		2, 'ZM-add', 'dict', 'Additional CC-CEDICT, mainly "archaic" entries',
		'cc-cedict', '{eol:"\n",cols:[0]}',
		'data/dict/zm-add.csv.gz', 'cat',
		'https://zhongmu.eu/'
	),
	(
		3, 'CC-CEDICT-singles', 'dict', 'Single-character CC-CEDICT entries only registered as simplified',
		'cc-cedict', '{eol:"\n",cols:[0]}',
		'data/dict/cc-cedict-singles.csv.gz', 'cat',
		'https://zhongmu.eu/'
	),
	(
		4, 'CHISE-ids', 'decomp', 'CHISE UCS IDs',
		'chise', '',
		'data/decomp/chise.csv.gz', 'cat',
		'http://chise.org'
	),
	(
		5, 'ZM-pict', 'dict', 'Pictographic descriptions',
		'cc-cedict', '{eol:"\n",cols:[0]}',
		'data/dict/zm-pict.csv.gz', 'cat',
		'https://zhongmu.eu/'
	),
	(
		6, 'WM-decomp', 'decomp', 'WikiMedia graphical decomposition table',
		'wm-decomp', '',
		'data/decomp/wm-decomp.csv.gz', 'mk-wm-decomp.sh',
		'https://commons.wikimedia.org/wiki/Commons:Chinese_characters_decomposition'
	),
	(
		7, 'Unicode-BIG5', 'big5', 'unicode.org s utf8/big5 correspondance table',
		'unicode-big5', '',
		'data/big5/big5.csv.gz', 'cat',
		'https://unicode.org/Public/MAPPINGS/OBSOLETE/EASTASIA/OTHER/BIG5.TXT'
	),
	(
		8, 'Shuowen Jiezi, book (Wikisource)', 'book', 'WikiSource version of the ShuoWen JieZi',
		'markdown', '',
		'data/books/shuowen', 'mkshuowen-ws-book.js',
		'https://en.wikisource.org/wiki/zh:%E8%AA%AA%E6%96%87%E8%A7%A3%E5%AD%97'
	),
	(
		9, 'WS-shuowen', 'dict', 'WikiSource version of the ShuoWen JieZi',
		'sw-markdown', '',
		'data/dict/ws-shuowen.csv.gz', 'mkshuowen-ws-dict.js',
		'https://en.wikisource.org/wiki/zh:%E8%AA%AA%E6%96%87%E8%A7%A3%E5%AD%97'
	),
	(
		10, 'CFDICT', 'dict', 'Chinese/French dictionary',
		'cc-cedict', '{eol:"\r\n",cols:[0]}',
		'data/dict/cfdict.csv.gz', 'cat',
		'https://chine.in/mandarin/dictionnaire/CFDICT/'
	),
	(
		11, 'HanDeDict', 'dict', 'Chinese/German dictionary',
		'cc-cedict', '{eol:"\r\n",cols:[0]}',
		'data/dict/handedict.csv.gz', 'cat',
		'https://handedict.zydeo.net/'
	),
	(
		12, 'Bai Jia Xing', 'book', 'Bai Xia Jing',
		'markdown', '',
		'data/books/bai-jia-xing', 'cat',
		-- https://en.wikipedia.org/wiki/Hundred_Family_Surnames
		'https://www.gutenberg.org/files/25196/25196-0.txt'
	),
	(
		13, 'Qian Zi Wen', 'book', 'Qian Zi Wen',
		'markdown', '',
		'data/books/qian-zi-wen', 'cat',
		-- https://en.wikipedia.org/wiki/Thousand_Character_Classic
		'https://zh.wikisource.org/wiki/%E5%8D%83%E5%AD%97%E6%96%87'
	),
	(
		14, 'San Zi Jing', 'book', 'San Zi Jing (Herbert Giles, ctext.org)',
		'markdown', '',
		'data/books/qian-zi-wen', 'cat',
		'https://ctext.org/three-character-classic'
	),
	(
		15, 'OpenRussian', 'dict', 'Russian to English (and Deustch) dictionary',
		'simple-dict', '',
		'data/dict/openrussian.csv.gz', 'cat',
		'https://en.openrussian.org/'
	),
	(
		16, 'ZM-decomp', 'decomp', 'Additional decompositions to wikimedia data',
		'wm-decomp', '',
		'data/decomp/zm-decomp.csv.gz', 'cat',
		'https://zhongmu.eu/'
	),
	(
		17, 'CFDICT-singles', 'dict', 'Single-character CFDICT entries only registered as simplified',
		'cc-cedict', '{eol:"\n",cols:[0]}',
		'data/dict/cfdict-singles.csv.gz', 'cat',
		'https://zhongmu.eu/'
	),
	(
		18, 'HanDeDict-singles', 'dict', 'Single-character HanDeDict entries only registered as simplified',
		'cc-cedict', '{eol:"\n",cols:[0]}',
		'data/dict/cc-cedict-singles.csv.gz', 'cat',
		'https://zhongmu.eu/'
	),
	(
		19, 'Art of war (partial)', 'book', 'Sun-Tzu s Art of war',
		'markdown', '',
		'data/books/art-of-war', 'cat',
		'https://ctext.org/art-of-war/'
	)
	;

INSERT INTO DataLicense
	(DataId, LicenseId, URL, Comment)
VALUES
	(1,  3, 'https://www.mdbg.net/chinese/dictionary?page=cc-cedict', ''),
	(2,  3, 'https://www.mdbg.net/chinese/dictionary?page=cc-cedict', 'Keeping same license as CC-CEDICT'),
	(3,  3, 'https://www.mdbg.net/chinese/dictionary?page=cc-cedict', 'Extracted from CC-CEDICT'),
	(4,  5, 'https://gitlab.chise.org/CHISE/ids/-/blob/master/README.en', ''),
	(5,  3, 'https://www.mdbg.net/chinese/dictionary?page=cc-cedict', 'Keeping same license as CC-CEDICT'),
	(6,  2, 'https://commons.wikimedia.org/wiki/Commons:Chinese_characters_decomposition', ''),
	(7,  4, 'https://unicode.org/Public/MAPPINGS/OBSOLETE/EASTASIA/OTHER/BIG5.TXT', ''),
	(8,  1, 'https://zh.wikisource.org/wiki/%E8%AA%AA%E6%96%87%E8%A7%A3%E5%AD%97', ''),
	(9,  1, 'https://zh.wikisource.org/wiki/%E8%AA%AA%E6%96%87%E8%A7%A3%E5%AD%97', ''),
	(10, 3, 'https://chine.in/mandarin/dictionnaire/CFDICT/', ''),
	(11, 6, 'https://github.com/gugray/HanDeDict', ''),
	(12, 9, 'https://www.gutenberg.org/files/25196/25196-0.txt', ''),
	(13, 1, 'https://zh.wikisource.org/wiki/%E5%8D%83%E5%AD%97%E6%96%87', ''),
	(14, 1, 'https://archive.org/details/elementarychines00wangrich', 'no copyrigths'),
	(15, 3, 'https://en.openrussian.org/dictionary', 'CC-BY-SA version unmentionned'),
	(16, 2, 'https://commons.wikimedia.org/wiki/Commons:Chinese_characters_decomposition', 'Keeping same license as WikiMedia s'),
	(17, 3, 'https://chine.in/mandarin/dictionnaire/CFDICT/', 'Extracted from CFDICT'),
	(18, 6, 'https://github.com/gugray/HanDeDict', 'Extracted from HanDeDict'),
	(19, 1, 'https://archive.org/details/artofwaroldestmi00suntuoft/', 'no copyrigths')
	;

INSERT INTO DataResource
	(DataId, ResourceId)
VALUES
	(1, 1),
	(3, 1),
	(4, 5),
	(6, 2),
	(7, 3),
	(8, 4),
	(9, 4),
	(10, 6),
	(11, 7)
	;

-- SQLite JSON export:
-- .mode json

-- NOTE: we're not linking to Resource because not all Data have a Resource,
-- such Data would be skipped.
--
-- Also, the Resource won't be of much use JS-side, so this should be
-- realistic enough.
SELECT
	Data.Id, Data.Name, Data.Type, Data.Descr, Data.Fmt, Data.FmtParams,
	Data.File, Data.UrlInfo,
	License.name AS License,
	License.url  AS UrlLicense
FROM Data, License, DataLicense
	WHERE Data.Id      = DataLicense.DataId
	AND   License.Id   = DataLicense.LicenseId;
