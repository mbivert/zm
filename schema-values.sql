
--------------------------------------------------------------
-- Numerical IDs below are dumb. Not sure there's a generic
-- SQL auto-increment feature; we'll add those via proper
-- SQL requests yet to be written anyway.

-- Note: User table is filled in user-dev.sql; there'll be
-- a non-committed user-prod.sql.

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
	(Id, UserId, Name, Type, Descr, Fmt, FmtParams, File, Formatter, UrlInfo)
VALUES
	(
		1, 1, 'CC-CEDICT', 'dict', 'Chinese/English dictionary',
		'cc-cedict', '{eol:"\r\n",cols:[0]}',
		'data/dict/cc-cedict.csv.gz', 'cat',
		'https://cc-cedict.org/wiki/'
	),
	(
		2, 1, 'ZM-add', 'dict', 'Additional CC-CEDICT, mainly "archaic" entries',
		'cc-cedict', '{eol:"\n",cols:[0]}',
		'data/dict/zm-add.csv.gz', 'cat',
		'https://zhongmu.eu/'
	),
	(
		3, 1, 'CC-CEDICT-singles', 'dict', 'Single-character CC-CEDICT entries only registered as simplified',
		'cc-cedict', '{eol:"\n",cols:[0]}',
		'data/dict/cc-cedict-singles.csv.gz', 'cat',
		'https://zhongmu.eu/'
	),
	(
		4, 1, 'CHISE-ids', 'decomp', 'CHISE UCS IDs',
		'chise', '',
		'data/decomp/chise.csv.gz', 'cat',
		'http://chise.org'
	),
	(
		5, 1, 'ZM-pict', 'dict', 'Pictographic descriptions',
		'cc-cedict', '{eol:"\n",cols:[0]}',
		'data/dict/zm-pict.csv.gz', 'cat',
		'https://zhongmu.eu/'
	),
	(
		6, 1, 'WM-decomp', 'decomp', 'WikiMedia graphical decomposition table',
		'wm-decomp', '',
		'data/decomp/wm-decomp.csv.gz', 'mk-wm-decomp.sh',
		'https://commons.wikimedia.org/wiki/Commons:Chinese_characters_decomposition'
	),
	(
		7, 1, 'Unicode-BIG5', 'big5', 'unicode.org s utf8/big5 correspondance table',
		'unicode-big5', '',
		'data/big5/big5.csv.gz', 'cat',
		'https://unicode.org/Public/MAPPINGS/OBSOLETE/EASTASIA/OTHER/BIG5.TXT'
	),
	(
		8, 1, 'Shuowen Jiezi, book (Wikisource)', 'book', 'WikiSource version of the ShuoWen JieZi',
		'markdown', '',
		'data/books/shuo-wen-jie-zi.src', 'mkshuowen-ws-book.js',
		'https://en.wikisource.org/wiki/zh:%E8%AA%AA%E6%96%87%E8%A7%A3%E5%AD%97'
	),
	(
		9, 1, 'WS-shuowen', 'dict', 'WikiSource version of the ShuoWen JieZi',
		'sw-markdown', '',
		'data/dict/ws-shuowen.csv.gz', 'mkshuowen-ws-dict.js',
		'https://en.wikisource.org/wiki/zh:%E8%AA%AA%E6%96%87%E8%A7%A3%E5%AD%97'
	),
	(
		10, 1, 'CFDICT', 'dict', 'Chinese/French dictionary',
		'cc-cedict', '{eol:"\r\n",cols:[0]}',
		'data/dict/cfdict.csv.gz', 'cat',
		'https://chine.in/mandarin/dictionnaire/CFDICT/'
	),
	(
		11, 1, 'HanDeDict', 'dict', 'Chinese/German dictionary',
		'cc-cedict', '{eol:"\r\n",cols:[0]}',
		'data/dict/handedict.csv.gz', 'cat',
		'https://handedict.zydeo.net/'
	),
	(
		12, 1, 'Bai Jia Xing', 'book', 'Bai Xia Jing',
		'markdown', '',
		'data/books/bai-jia-xing.src', 'cat',
		-- https://en.wikipedia.org/wiki/Hundred_Family_Surnames
		'https://www.gutenberg.org/files/25196/25196-0.txt'
	),
	(
		13, 1, 'Qian Zi Wen', 'book', 'Qian Zi Wen',
		'markdown', '',
		'data/books/qian-zi-wen.src', 'cat',
		-- https://en.wikipedia.org/wiki/Thousand_Character_Classic
		'https://zh.wikisource.org/wiki/%E5%8D%83%E5%AD%97%E6%96%87'
	),
	(
		14, 1, '三字經 (Three Character Classic)', 'book',
		'Three Character Classic, original',
		'markdown', '',
		'data/books/san-zi-jing.src', 'cat',
		'https://ctext.org/three-character-classic'
	),
	(
		15, 1, 'OpenRussian', 'dict', 'Russian to English (and Deustch) dictionary',
		'simple-dict', '',
		'data/dict/openrussian.csv.gz', 'cat',
		'https://en.openrussian.org/'
	),
	(
		16, 1, 'ZM-decomp', 'decomp', 'Additional decompositions to wikimedia data',
		'wm-decomp', '',
		'data/decomp/zm-decomp.csv.gz', 'cat',
		'https://zhongmu.eu/'
	),
	(
		17, 1, 'CFDICT-singles', 'dict', 'Single-character CFDICT entries only registered as simplified',
		'cc-cedict', '{eol:"\n",cols:[0]}',
		'data/dict/cfdict-singles.csv.gz', 'cat',
		'https://zhongmu.eu/'
	),
	(
		18, 1, 'HanDeDict-singles', 'dict', 'Single-character HanDeDict entries only registered as simplified',
		'cc-cedict', '{eol:"\n",cols:[0]}',
		'data/dict/cc-cedict-singles.csv.gz', 'cat',
		'https://zhongmu.eu/'
	),
	(
		19, 1, 'Art of war (partial)', 'book', 'Sun-Tzu s Art of war',
		'markdown', '',
		'data/books/art-of-war.src', 'cat',
		'https://ctext.org/art-of-war/'
	),
	(
		20, 1, 'Three Character Classic (translation)', 'book',
		'Three Character Classic translated by Herbert Giles',
		'markdown', '',
		'data/books/san-zi-jing.tr', 'cat',
		'https://ctext.org/three-character-classic'
	),
	(
		21, 1, 'Three Character Classic (pieces)', 'pieces',
		'Link between original & translation',
		'pieces', '',
		'data/books/san-zi-jing.pcs', 'cat',
		'https://ctext.org/three-character-classic'
	),
	(
		22, 1, 'Art of war (translation)', 'book', 'Sun-Tzu s Art of war',
		'markdown', '',
		'data/books/art-of-war.tr', 'cat',
		'https://ctext.org/art-of-war/'
	),
	(
		23, 1, 'Art of war (pieces)', 'pieces', 'Sun-Tzu s Art of war',
		'pieces', '',
		'data/books/art-of-war.pcs', 'cat',
		'https://ctext.org/art-of-war/'
	),
	(
		24, 1, 'Le Classique des Trois Caractères', 'book',
		'Le Classique des Trois Caractères, traduit par Deverge',
		'markdown', '',
		'data/books/san-zi-jing-fr.tr', 'cat',
		-- Not sure it's the one I took it from though. Don't remember.
		'http://wengu.tartarie.com/wg/wengu.php?l=Sanzijing&s=1&lang=fr'
	),
	(
		25, 1, 'Le Classique des Trois Caractères (pieces)', 'pieces',
		'',
		'pieces', '',
		'data/books/san-zi-jing-fr.pcs', 'cat',
		-- Not sure it's the one I took it from though. Don't remember.
		'http://wengu.tartarie.com/wg/wengu.php?l=Sanzijing&s=1&lang=fr'
	),
	(
		26, 1, 'Father Serge, Tolstoï (Отец Сергий, Толстой) (partial)', 'book',
		'First few paragraphs from Tolstoï s Father Serge, in Russian',
		'markdown', '',
		'data/books/father-serge-tolstoi.src', 'cat',
		-- Definitely not the correct link (those are translations); it's late.
		'https://en.wikisource.org/wiki/Father_Sergius'
	)
	;
--	(Id, UserId, Name, Type, Descr, Fmt, FmtParams, File, Formatter, UrlInfo)

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
	(19, 1, 'https://archive.org/details/artofwaroldestmi00suntuoft/', 'no copyrigths'),
	(20, 1, 'https://en.wikisource.org/wiki/San_Tzu_Ching', 'no copyrigths'),
	(21, 1, 'https://en.wikisource.org/wiki/San_Tzu_Ching', 'no copyrigths'),
	(22, 1, 'https://archive.org/details/artofwaroldestmi00suntuoft/', 'no copyrigths'),
	(23, 1, 'https://archive.org/details/artofwaroldestmi00suntuoft/', 'no copyrigths'),
	(24, 1, 'http://wengu.tartarie.com/wg/wengu.php?l=Sanzijing&s=1&lang=fr', 'no copyrights'),
	(25, 1, 'http://wengu.tartarie.com/wg/wengu.php?l=Sanzijing&s=1&lang=fr', 'no copyrights'),
	(26, 1, 'https://en.wikisource.org/wiki/Father_Sergius', 'no copyrights')
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

INSERT INTO Permission
	(DataId, Public)
VALUES
	(1, 1),
	(2, 1),
	(3, 1),
	(4, 1),
	(5, 1),
	(6, 1),
	(7, 1),
	(8, 1),
	(9, 1),
	(10, 1),
	(11, 1),
	(12, 1),
	(13, 1),
	(14, 1),
	(15, 1),
	(16, 1),
	(17, 1),
	(18, 1),
	(19, 1),
	(20, 1),
	(21, 1),
	(22, 1),
	(23, 1),
	(24, 1),
	(25, 1),
	(26, 1)
	;
