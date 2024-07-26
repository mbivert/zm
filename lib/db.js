/* Automatically generated; see ../Makefile & ../bin/mkdbjs.sh */
let DB = (function() {

// Improperly typed because of enums
// @ts-ignore
var datas = [
  {
    "Id": 1,
    "Name": "CC-CEDICT",
    "Type": "dict",
    "Descr": "Chinese/English dictionary",
    "Fmt": "cc-cedict",
    "FmtParams": "{eol:\"\\r\\n\",cols:[0]}",
    "File": "data/dict/cc-cedict.csv.gz",
    "UrlInfo": "https://cc-cedict.org/wiki/",
    "License": "CC BY-SA 4.0",
    "UrlLicense": "https://creativecommons.org/licenses/by-sa/4.0/"
  },
  {
    "Id": 2,
    "Name": "ZM-add",
    "Type": "dict",
    "Descr": "Additional CC-CEDICT, mainly \"archaic\" entries",
    "Fmt": "cc-cedict",
    "FmtParams": "{eol:\"\\n\",cols:[0]}",
    "File": "data/dict/zm-add.csv.gz",
    "UrlInfo": "https://zhongmu.eu/",
    "License": "CC BY-SA 4.0",
    "UrlLicense": "https://creativecommons.org/licenses/by-sa/4.0/"
  },
  {
    "Id": 3,
    "Name": "CC-CEDICT-singles",
    "Type": "dict",
    "Descr": "Single-character CC-CEDICT entries only registered as simplified",
    "Fmt": "cc-cedict",
    "FmtParams": "{eol:\"\\n\",cols:[0]}",
    "File": "data/dict/cc-cedict-singles.csv.gz",
    "UrlInfo": "https://zhongmu.eu/",
    "License": "CC BY-SA 4.0",
    "UrlLicense": "https://creativecommons.org/licenses/by-sa/4.0/"
  },
  {
    "Id": 4,
    "Name": "CHISE-ids",
    "Type": "decomp",
    "Descr": "CHISE UCS IDs",
    "Fmt": "chise",
    "FmtParams": "",
    "File": "data/decomp/chise.csv.gz",
    "UrlInfo": "http://chise.org",
    "License": "GPLv2",
    "UrlLicense": "https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html"
  },
  {
    "Id": 5,
    "Name": "ZM-pict",
    "Type": "dict",
    "Descr": "Pictographic descriptions",
    "Fmt": "cc-cedict",
    "FmtParams": "{eol:\"\\n\",cols:[0]}",
    "File": "data/dict/zm-pict.csv.gz",
    "UrlInfo": "https://zhongmu.eu/",
    "License": "CC BY-SA 4.0",
    "UrlLicense": "https://creativecommons.org/licenses/by-sa/4.0/"
  },
  {
    "Id": 6,
    "Name": "WM-decomp",
    "Type": "decomp",
    "Descr": "WikiMedia graphical decomposition table",
    "Fmt": "wm-decomp",
    "FmtParams": "",
    "File": "data/decomp/wm-decomp.csv.gz",
    "UrlInfo": "https://commons.wikimedia.org/wiki/Commons:Chinese_characters_decomposition",
    "License": "CC BY-SA 3.0",
    "UrlLicense": "https://creativecommons.org/licenses/by-sa/3.0/"
  },
  {
    "Id": 7,
    "Name": "Unicode-BIG5",
    "Type": "big5",
    "Descr": "unicode.org s utf8/big5 correspondance table",
    "Fmt": "unicode-big5",
    "FmtParams": "",
    "File": "data/big5/big5.csv.gz",
    "UrlInfo": "https://unicode.org/Public/MAPPINGS/OBSOLETE/EASTASIA/OTHER/BIG5.TXT",
    "License": "Unicode ToS",
    "UrlLicense": "https://www.unicode.org/copyright.html"
  },
  {
    "Id": 8,
    "Name": "Shuowen Jiezi, book (Wikisource)",
    "Type": "book",
    "Descr": "WikiSource version of the ShuoWen JieZi",
    "Fmt": "markdown",
    "FmtParams": "",
    "File": "data/books/shuowen",
    "UrlInfo": "https://en.wikisource.org/wiki/zh:%E8%AA%AA%E6%96%87%E8%A7%A3%E5%AD%97",
    "License": "CC0 1.0",
    "UrlLicense": "https://creativecommons.org/publicdomain/zero/1.0/"
  },
  {
    "Id": 9,
    "Name": "WS-shuowen",
    "Type": "dict",
    "Descr": "WikiSource version of the ShuoWen JieZi",
    "Fmt": "sw-markdown",
    "FmtParams": "",
    "File": "data/dict/ws-shuowen.csv.gz",
    "UrlInfo": "https://en.wikisource.org/wiki/zh:%E8%AA%AA%E6%96%87%E8%A7%A3%E5%AD%97",
    "License": "CC0 1.0",
    "UrlLicense": "https://creativecommons.org/publicdomain/zero/1.0/"
  },
  {
    "Id": 10,
    "Name": "CFDICT",
    "Type": "dict",
    "Descr": "Chinese/French dictionary",
    "Fmt": "cc-cedict",
    "FmtParams": "{eol:\"\\r\\n\",cols:[0]}",
    "File": "data/dict/cfdict.csv.gz",
    "UrlInfo": "https://chine.in/mandarin/dictionnaire/CFDICT/",
    "License": "CC BY-SA 4.0",
    "UrlLicense": "https://creativecommons.org/licenses/by-sa/4.0/"
  },
  {
    "Id": 11,
    "Name": "HanDeDict",
    "Type": "dict",
    "Descr": "Chinese/German dictionary",
    "Fmt": "cc-cedict",
    "FmtParams": "{eol:\"\\r\\n\",cols:[0]}",
    "File": "data/dict/handedict.csv.gz",
    "UrlInfo": "https://handedict.zydeo.net/",
    "License": "CC BY-SA 2.0",
    "UrlLicense": "https://creativecommons.org/licenses/by-sa/2.0/"
  },
  {
    "Id": 12,
    "Name": "Bai Jia Xing",
    "Type": "book",
    "Descr": "Bai Xia Jing",
    "Fmt": "markdown",
    "FmtParams": "",
    "File": "data/books/bai-jia-xing",
    "UrlInfo": "https://www.gutenberg.org/files/25196/25196-0.txt",
    "License": "Gutenberg license",
    "UrlLicense": "http://gutenberg.org/license"
  },
  {
    "Id": 13,
    "Name": "Qian Zi Wen",
    "Type": "book",
    "Descr": "Qian Zi Wen",
    "Fmt": "markdown",
    "FmtParams": "",
    "File": "data/books/qian-zi-wen",
    "UrlInfo": "https://zh.wikisource.org/wiki/%E5%8D%83%E5%AD%97%E6%96%87",
    "License": "CC0 1.0",
    "UrlLicense": "https://creativecommons.org/publicdomain/zero/1.0/"
  },
  {
    "Id": 14,
    "Name": "San Zi Jing",
    "Type": "book",
    "Descr": "San Zi Jing (Herbert Giles, ctext.org)",
    "Fmt": "markdown",
    "FmtParams": "",
    "File": "data/books/qian-zi-wen",
    "UrlInfo": "https://ctext.org/three-character-classic",
    "License": "CC0 1.0",
    "UrlLicense": "https://creativecommons.org/publicdomain/zero/1.0/"
  },
  {
    "Id": 15,
    "Name": "OpenRussian",
    "Type": "dict",
    "Descr": "Russian to English (and Deustch) dictionary",
    "Fmt": "simple-dict",
    "FmtParams": "",
    "File": "data/dict/openrussian.csv.gz",
    "UrlInfo": "https://en.openrussian.org/",
    "License": "CC BY-SA 4.0",
    "UrlLicense": "https://creativecommons.org/licenses/by-sa/4.0/"
  },
  {
    "Id": 16,
    "Name": "ZM-decomp",
    "Type": "decomp",
    "Descr": "Additional decompositions to wikimedia data",
    "Fmt": "wm-decomp",
    "FmtParams": "",
    "File": "data/decomp/zm-decomp.csv.gz",
    "UrlInfo": "https://zhongmu.eu/",
    "License": "CC BY-SA 3.0",
    "UrlLicense": "https://creativecommons.org/licenses/by-sa/3.0/"
  },
  {
    "Id": 17,
    "Name": "CFDICT-singles",
    "Type": "dict",
    "Descr": "Single-character CFDICT entries only registered as simplified",
    "Fmt": "cc-cedict",
    "FmtParams": "{eol:\"\\n\",cols:[0]}",
    "File": "data/dict/cfdict-singles.csv.gz",
    "UrlInfo": "https://zhongmu.eu/",
    "License": "CC BY-SA 4.0",
    "UrlLicense": "https://creativecommons.org/licenses/by-sa/4.0/"
  },
  {
    "Id": 18,
    "Name": "HanDeDict-singles",
    "Type": "dict",
    "Descr": "Single-character HanDeDict entries only registered as simplified",
    "Fmt": "cc-cedict",
    "FmtParams": "{eol:\"\\n\",cols:[0]}",
    "File": "data/dict/cc-cedict-singles.csv.gz",
    "UrlInfo": "https://zhongmu.eu/",
    "License": "CC BY-SA 2.0",
    "UrlLicense": "https://creativecommons.org/licenses/by-sa/2.0/"
  },
  {
    "Id": 19,
    "Name": "Art of war (partial)",
    "Type": "book",
    "Descr": "Sun-Tzu s Art of war",
    "Fmt": "markdown",
    "FmtParams": "",
    "File": "data/books/art-of-war",
    "UrlInfo": "https://ctext.org/art-of-war/",
    "License": "CC0 1.0",
    "UrlLicense": "https://creativecommons.org/publicdomain/zero/1.0/"
  }
]
return { "datas" : datas, };
})();
