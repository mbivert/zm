package main

/*
 * We're testing data.go functions, but via HTTP
 * handlers instead of directly.
 *
 * This should be fine-grained enough.
 *
 * Furthermore, we're focusing on testing the local
 * code of data.go functions: finer tests for DB access
 * can be found in db_test.go.
 */

import (
	"testing"
	"log"
	"net/http"
	"encoding/json"
	"strings"
//	"os"
	"errors"
	"database/sql"
//	"io/ioutil"
	"net/http/httptest"
	jwt "github.com/golang-jwt/jwt/v5"
//	"encoding/base64"
	"github.com/mbivert/ftests"
	"github.com/mbivert/auth"
)

var handler http.Handler

// ease lib update
var errSegment = jwt.ErrTokenMalformed.Error()+": token contains an invalid number of segments"
var errSignature = jwt.ErrTokenSignatureInvalid.Error()+": signature is invalid"

func init() {
	if err := loadConf("config.json", &C); err != nil {
		log.Fatal(err)
	}
}

// Individual tests rely on a ~fresh DB; "init()" cannot be
// called directly.
func initDataTest() {
	initTestDB() // see 'db_test.go:/^func initTestDB\('

//	handler = http.DefaultServeMux
	handler = mkServeMux(db)

	if err := auth.LoadConf("config.auth.json"); err != nil {
		log.Fatal(err)
	}

	// XXX/NOTE: for now, all tests require verification to be disabled.
	// TODO: this is in auth's config
//	C.NoVerif = true
}


func callURL(handler http.Handler, url string, args any, tok string) any {
	ts := httptest.NewServer(handler)
	defer ts.Close()

	sargs, err := json.MarshalIndent(args, "", "\t")
	if err != nil {
		log.Fatal(err)
	}

//	r, err := http.Post(ts.URL+url, "application/json", strings.NewReader(string(sargs)))

	req, err := http.NewRequest("POST", ts.URL+url, strings.NewReader(string(sargs)))
	if err != nil {
		log.Fatal(err)
	}

	req.Header.Add("Content-Type", "application/json")
	if tok != "" {
		req.AddCookie(&http.Cookie{
			Name:     auth.CookieName,
			Value:    tok,
			Path:     "/",
			HttpOnly: true,
		})
	}

	r, err := http.DefaultClient.Do(req)

	var out any
//	x, err := ioutil.ReadAll(r.Body)
//	fmt.Println(string(x))
	err = json.NewDecoder(r.Body).Decode(&out)
//	err = json.Unmarshal(x, &out)
	if err != nil {
		log.Fatal(err)
	}

	r.Body.Close()

	return out
}

// shared token set by callURLWithToken,
// so that we can re-use it for later queries
var tokenStr = ""

// same as callURL, but output is expected to be a hash containing
// a token
func callURLWithToken(handler http.Handler, url string, args any) any {
	out := callURL(handler, url, args, tokenStr)

	out2, ok := out.(map[string]any)
	if !ok {
		log.Println(out)
		log.Fatal("Weird output")
	}

	xstr, ok := out2["token"]
	if !ok {
		log.Fatal("No token found! (", out2["err"], ")")
	}

	tokenStr, ok = xstr.(string)
	if !ok {
		log.Fatal("Token is not a string")
	}

	tok, err := auth.ParseToken(tokenStr)
	if err != nil {
		log.Fatal("Failed to parse token")
	}

	if _, ok := tok["date"]; !ok {
		log.Fatal("No date!")
	}

	tok["date"] = 0
	tok["uniq"] = "redacted"

	out2["token"] = tok

	return out2
}

func (db *DB) getDataByNameUidNoPath(name string, uid auth.UserId) (*SetDataIn, error) {
	x, err := db.getDataByNameUid(name, uid)
	if err != nil {
		return nil, err
	}
	x.File = ""
	return x, err
}

// For tests purposes only
func (db *DB) mustGetDataIdFile(name string, uid auth.UserId) (int64, string) {
	db.Lock()
	defer db.Unlock()

	did := int64(-1)
	fn := ""

	err := db.QueryRow(`
		SELECT Id, File FROM Data WHERE Name = $1 AND UserID = $2
	`, name, uid).Scan(&did, &fn)

	if errors.Is(err, sql.ErrNoRows) {
		return -1, ""
	} else if err != nil {
		log.Fatal(err)
	}
	return did, fn
}

func mustParseJSON(s string) any {
	var x any
	if err := json.Unmarshal([]byte(s), &x); err != nil {
		log.Fatal(err)
	}
	return x
}

func mkLoginWith(uname string, uid auth.UserId) ftests.Test {
	// can't be declared static because of the handler thing
	return ftests.Test{
		"Valid user/password",
		callURLWithToken,
		[]any{handler, "/auth/login", map[string]any{
			"login"  : uname,
			"passwd" : "{c=!aW}4:1J~UR]j\"q|Q",
		}},
		[]any{map[string]any{
			"token" : jwt.MapClaims{
				"date" : 0,          // redacted to ease tests
				"uniq" : "redacted", // idem
				"uid"  : float64(uid),
			},
		}},
	}
}

func mkLoginWithZM() ftests.Test {
	return mkLoginWith("zhongmu", zmId)
}

func mkLoginWithMb() ftests.Test {
	return mkLoginWith("mbivert", mbId)
}

func TestSetData(t *testing.T) {
	initDataTest()

	path := "private/data/path"

	name := "superbuniquename"
//	name1 := "ooook"

	mkd := func(name, path string, uid auth.UserId, lid int64, pub bool) *SetDataIn {
		return &SetDataIn{
			Token     : "x",
			Name      : name,
			Type      : "book",
			Descr     : "foo",
			Fmt       : "markdown",
			Public    : pub,
			LicenseId : lid,
			UrlInfo   : "x",
			Content   : "foo",
			File      : path,
			UserId    : uid,
			Id        : -1,
		}
	}

	ftests.Run(t, []ftests.Test{
		{
			"Invalid input",
			callURL,
			[]any{handler, "/set/data", "", ""},
			[]any{map[string]any{
				"err": "JSON decoding failure: json: cannot unmarshal string into Go value of type main.SetDataIn",
			}},
		},
		{
			"Not logged in",
			callURL,
			[]any{handler, "/set/data", &SetDataIn{}, ""},
			[]any{map[string]any{
				"err" : "Not connected!",
			}},
		},
		mkLoginWithZM(),
	})

	data := mkd(name, path, zmId, cc0Id, true)

	ftests.Run(t, []ftests.Test{
		{
			"Adding new data, connected as zm",
			callURL,
			[]any{handler, "/set/data", data, tokenStr},
			[]any{mustParseJSON(`{}`)},
		},
		// okay, let's bypass a few things to check things out:
		{
			"Data correctly added",
			db.getDataByNameUidNoPath,
			[]any{name, zmId},
			[]any{&SetDataIn{
				Token     : "", // not set
				Name      : name,
				Type      : "book",
				Descr     : "foo",
				Fmt       : "markdown",
				Public    : true,
				LicenseId : cc0Id,
				UrlInfo   : "x",
				Content   : "", // not set
				File      : "", // redacted (random)
				UserId    : zmId,
				Id        : 0, // not set
			}, nil },
		},
	})
	data.Id, data.File = db.mustGetDataIdFile(data.Name, data.UserId)
	data.Name = "ookay"
	data.LicenseId = 4 // meh
	data.Descr     = "whaaatever"
	data.UrlInfo   = "https://gaagle.com"
	data.Content   = "updated content"
	data.Public    = false
	data.Type      = dataTDict
	data.Fmt       = dataFWMDecomp

	ftests.Run(t, []ftests.Test{
		{
			"Updating data, connected as zm",
			callURL,
			[]any{handler, "/set/data", data, tokenStr},
			[]any{mustParseJSON(`{}`)},
		},
		{
			"Data correctly updated",
			db.getDataByNameUid,
			[]any{data.Name, data.UserId},
			[]any{&SetDataIn{
				Token     : "", // not set
				Name      : data.Name,
				Type      : data.Type,
				Descr     : data.Descr,
				Fmt       : data.Fmt,
				Public    : data.Public,
				LicenseId : data.LicenseId,
				UrlInfo   : data.UrlInfo,
				Content   : "", // not set
				File      : data.File,
				UserId    : zmId,
				Id        : 0, // not set
			}, nil },
		},
		{
			"Content file correctly updated",
			readDataFile,
			[]any{data.File},
			[]any{data.Content, nil},
		},
	})
}

func TestDataGetBooks(t *testing.T) {
	initDataTest()

	ftests.Run(t, []ftests.Test{
		{
			"Invalid input",
			callURL,
			[]any{handler, "/get/books", "", ""},
			[]any{map[string]any{
				"err": "JSON decoding failure: json: cannot unmarshal string into Go value of type main.GetBooksIn",
			}},
		},
		{
			"Not logged in",
			callURL,
			[]any{handler, "/get/books", &GetBooksIn{}, ""},
			[]any{map[string]any{
				"err" : "Not connected!",
			}},
		},
		mkLoginWithZM(),
	})

	// again, the needless verbosity sucks, but that'll do for now.
	ftests.Run(t, []ftests.Test{
		{
			"Retrieving books, connected as zm",
			callURL,
			[]any{handler, "/get/books", &GetBooksIn{}, tokenStr},
			[]any{mustParseJSON(`{
        		"books": [
        			{
        				"descr": "WikiSource version of the ShuoWen JieZi",
        				"file": "data/books/shuo-wen-jie-zi.src",
        				"name": "Shuowen Jiezi, book (Wikisource)",
        				"owned": true,
        				"urlinfo": "https://en.wikisource.org/wiki/zh:%E8%AA%AA%E6%96%87%E8%A7%A3%E5%AD%97"
        			},
        			{
        				"descr": "Bai Xia Jing",
        				"file": "data/books/bai-jia-xing.src",
        				"name": "Bai Jia Xing",
        				"owned": true,
        				"urlinfo": "https://www.gutenberg.org/files/25196/25196-0.txt"
        			},
        			{
        				"descr": "Qian Zi Wen",
        				"file": "data/books/qian-zi-wen.src",
        				"name": "Qian Zi Wen",
        				"owned": true,
        				"urlinfo": "https://zh.wikisource.org/wiki/%E5%8D%83%E5%AD%97%E6%96%87"
        			},
        			{
        				"descr": "Three Character Classic, original",
        				"file": "data/books/san-zi-jing.src",
        				"name": "三字經 (Three Character Classic)",
        				"owned": true,
        				"urlinfo": "https://ctext.org/three-character-classic"
        			},
        			{
        				"descr": "Sun-Tzu s Art of war",
        				"file": "data/books/art-of-war.src",
        				"name": "Art of war (partial)",
        				"owned": true,
        				"urlinfo": "https://ctext.org/art-of-war/"
        			},
        			{
        				"descr": "Three Character Classic translated by Herbert Giles",
        				"file": "data/books/san-zi-jing.tr",
        				"name": "Three Character Classic (translation)",
        				"owned": true,
        				"urlinfo": "https://ctext.org/three-character-classic"
        			},
        			{
        				"descr": "Sun-Tzu s Art of war",
        				"file": "data/books/art-of-war.tr",
        				"name": "Art of war (translation)",
        				"owned": true,
        				"urlinfo": "https://ctext.org/art-of-war/"
        			},
        			{
        				"descr": "Le Classique des Trois Caractères, traduit par Deverge",
        				"file": "data/books/san-zi-jing-fr.tr",
        				"name": "Le Classique des Trois Caractères",
        				"owned": true,
        				"urlinfo": "http://wengu.tartarie.com/wg/wengu.php?l=Sanzijing\u0026s=1\u0026lang=fr"
        			},
        			{
        				"descr": "First few paragraphs from Tolstoï s Father Serge, in Russian",
        				"file": "data/books/father-serge-tolstoi.src",
        				"name": "Father Serge, Tolstoï (Отец Сергий, Толстой) (partial)",
        				"owned": true,
        				"urlinfo": "https://en.wikisource.org/wiki/Father_Sergius"
        			}
        		]
        	}`)},
		},
		mkLoginWithMb(),
	})

	ftests.Run(t, []ftests.Test{
		{
			"Retrieving books, connected as mb",
			callURL,
			[]any{handler, "/get/books", &GetBooksIn{}, tokenStr},
			[]any{mustParseJSON(`{
        		"books": [
        			{
        				"descr": "WikiSource version of the ShuoWen JieZi",
        				"file": "data/books/shuo-wen-jie-zi.src",
        				"name": "Shuowen Jiezi, book (Wikisource)",
        				"owned": false,
        				"urlinfo": "https://en.wikisource.org/wiki/zh:%E8%AA%AA%E6%96%87%E8%A7%A3%E5%AD%97"
        			},
        			{
        				"descr": "Bai Xia Jing",
        				"file": "data/books/bai-jia-xing.src",
        				"name": "Bai Jia Xing",
        				"owned": false,
        				"urlinfo": "https://www.gutenberg.org/files/25196/25196-0.txt"
        			},
        			{
        				"descr": "Qian Zi Wen",
        				"file": "data/books/qian-zi-wen.src",
        				"name": "Qian Zi Wen",
        				"owned": false,
        				"urlinfo": "https://zh.wikisource.org/wiki/%E5%8D%83%E5%AD%97%E6%96%87"
        			},
        			{
        				"descr": "Three Character Classic, original",
        				"file": "data/books/san-zi-jing.src",
        				"name": "三字經 (Three Character Classic)",
        				"owned": false,
        				"urlinfo": "https://ctext.org/three-character-classic"
        			},
        			{
        				"descr": "Sun-Tzu s Art of war",
        				"file": "data/books/art-of-war.src",
        				"name": "Art of war (partial)",
        				"owned": false,
        				"urlinfo": "https://ctext.org/art-of-war/"
        			},
        			{
        				"descr": "Three Character Classic translated by Herbert Giles",
        				"file": "data/books/san-zi-jing.tr",
        				"name": "Three Character Classic (translation)",
        				"owned": false,
        				"urlinfo": "https://ctext.org/three-character-classic"
        			},
        			{
        				"descr": "Sun-Tzu s Art of war",
        				"file": "data/books/art-of-war.tr",
        				"name": "Art of war (translation)",
        				"owned": false,
        				"urlinfo": "https://ctext.org/art-of-war/"
        			},
        			{
        				"descr": "Le Classique des Trois Caractères, traduit par Deverge",
        				"file": "data/books/san-zi-jing-fr.tr",
        				"name": "Le Classique des Trois Caractères",
        				"owned": false,
        				"urlinfo": "http://wengu.tartarie.com/wg/wengu.php?l=Sanzijing\u0026s=1\u0026lang=fr"
        			},
        			{
        				"descr": "First few paragraphs from Tolstoï s Father Serge, in Russian",
        				"file": "data/books/father-serge-tolstoi.src",
        				"name": "Father Serge, Tolstoï (Отец Сергий, Толстой) (partial)",
        				"owned": false,
        				"urlinfo": "https://en.wikisource.org/wiki/Father_Sergius"
        			}
        		]
        	}`)},
		},
	})

}

func TestDataGetAbouts(t *testing.T) {
	initDataTest()

	ftests.Run(t, []ftests.Test{
		{
			"Invalid input",
			callURL,
			[]any{handler, "/get/about", "", ""},
			[]any{map[string]any{
				"err": "JSON decoding failure: json: cannot unmarshal string into Go value of type main.GetAboutIn",
			}},
		},
		{
			"Invalid input",
			callURL,
			[]any{handler, "/get/about", &GetAboutIn{}, ""},
			[]any{mustParseJSON(`{
        		"datas": [
        			{
        				"license": "CC BY-SA 4.0",
        				"name": "CC-CEDICT",
        				"type": "dict",
        				"urlinfo": "https://cc-cedict.org/wiki/",
        				"urllicense": "https://creativecommons.org/licenses/by-sa/4.0/"
        			},
        			{
        				"license": "CC BY-SA 4.0",
        				"name": "ZM-add",
        				"type": "dict",
        				"urlinfo": "https://zhongmu.eu/",
        				"urllicense": "https://creativecommons.org/licenses/by-sa/4.0/"
        			},
        			{
        				"license": "CC BY-SA 4.0",
        				"name": "CC-CEDICT-singles",
        				"type": "dict",
        				"urlinfo": "https://zhongmu.eu/",
        				"urllicense": "https://creativecommons.org/licenses/by-sa/4.0/"
        			},
        			{
        				"license": "GPLv2",
        				"name": "CHISE-ids",
        				"type": "decomp",
        				"urlinfo": "http://chise.org",
        				"urllicense": "https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html"
        			},
        			{
        				"license": "CC BY-SA 4.0",
        				"name": "ZM-pict",
        				"type": "dict",
        				"urlinfo": "https://zhongmu.eu/",
        				"urllicense": "https://creativecommons.org/licenses/by-sa/4.0/"
        			},
        			{
        				"license": "CC BY-SA 3.0",
        				"name": "WM-decomp",
        				"type": "decomp",
        				"urlinfo": "https://commons.wikimedia.org/wiki/Commons:Chinese_characters_decomposition",
        				"urllicense": "https://creativecommons.org/licenses/by-sa/3.0/"
        			},
        			{
        				"license": "Unicode ToS",
        				"name": "Unicode-BIG5",
        				"type": "big5",
        				"urlinfo": "https://unicode.org/Public/MAPPINGS/OBSOLETE/EASTASIA/OTHER/BIG5.TXT",
        				"urllicense": "https://www.unicode.org/copyright.html"
        			},
        			{
        				"license": "CC0 1.0",
        				"name": "Shuowen Jiezi, book (Wikisource)",
        				"type": "book",
        				"urlinfo": "https://en.wikisource.org/wiki/zh:%E8%AA%AA%E6%96%87%E8%A7%A3%E5%AD%97",
        				"urllicense": "https://creativecommons.org/publicdomain/zero/1.0/"
        			},
        			{
        				"license": "CC0 1.0",
        				"name": "WS-shuowen",
        				"type": "dict",
        				"urlinfo": "https://en.wikisource.org/wiki/zh:%E8%AA%AA%E6%96%87%E8%A7%A3%E5%AD%97",
        				"urllicense": "https://creativecommons.org/publicdomain/zero/1.0/"
        			},
        			{
        				"license": "CC BY-SA 4.0",
        				"name": "CFDICT",
        				"type": "dict",
        				"urlinfo": "https://chine.in/mandarin/dictionnaire/CFDICT/",
        				"urllicense": "https://creativecommons.org/licenses/by-sa/4.0/"
        			},
        			{
        				"license": "CC BY-SA 2.0",
        				"name": "HanDeDict",
        				"type": "dict",
        				"urlinfo": "https://handedict.zydeo.net/",
        				"urllicense": "https://creativecommons.org/licenses/by-sa/2.0/"
        			},
        			{
        				"license": "Gutenberg license",
        				"name": "Bai Jia Xing",
        				"type": "book",
        				"urlinfo": "https://www.gutenberg.org/files/25196/25196-0.txt",
        				"urllicense": "http://gutenberg.org/license"
        			},
        			{
        				"license": "CC0 1.0",
        				"name": "Qian Zi Wen",
        				"type": "book",
        				"urlinfo": "https://zh.wikisource.org/wiki/%E5%8D%83%E5%AD%97%E6%96%87",
        				"urllicense": "https://creativecommons.org/publicdomain/zero/1.0/"
        			},
        			{
        				"license": "CC0 1.0",
        				"name": "三字經 (Three Character Classic)",
        				"type": "book",
        				"urlinfo": "https://ctext.org/three-character-classic",
        				"urllicense": "https://creativecommons.org/publicdomain/zero/1.0/"
        			},
        			{
        				"license": "CC BY-SA 4.0",
        				"name": "OpenRussian",
        				"type": "dict",
        				"urlinfo": "https://en.openrussian.org/",
        				"urllicense": "https://creativecommons.org/licenses/by-sa/4.0/"
        			},
        			{
        				"license": "CC BY-SA 3.0",
        				"name": "ZM-decomp",
        				"type": "decomp",
        				"urlinfo": "https://zhongmu.eu/",
        				"urllicense": "https://creativecommons.org/licenses/by-sa/3.0/"
        			},
        			{
        				"license": "CC BY-SA 4.0",
        				"name": "CFDICT-singles",
        				"type": "dict",
        				"urlinfo": "https://zhongmu.eu/",
        				"urllicense": "https://creativecommons.org/licenses/by-sa/4.0/"
        			},
        			{
        				"license": "CC BY-SA 2.0",
        				"name": "HanDeDict-singles",
        				"type": "dict",
        				"urlinfo": "https://zhongmu.eu/",
        				"urllicense": "https://creativecommons.org/licenses/by-sa/2.0/"
        			},
        			{
        				"license": "CC0 1.0",
        				"name": "Art of war (partial)",
        				"type": "book",
        				"urlinfo": "https://ctext.org/art-of-war/",
        				"urllicense": "https://creativecommons.org/publicdomain/zero/1.0/"
        			},
        			{
        				"license": "CC0 1.0",
        				"name": "Three Character Classic (translation)",
        				"type": "book",
        				"urlinfo": "https://ctext.org/three-character-classic",
        				"urllicense": "https://creativecommons.org/publicdomain/zero/1.0/"
        			},
        			{
        				"license": "CC0 1.0",
        				"name": "Three Character Classic (pieces)",
        				"type": "pieces",
        				"urlinfo": "https://ctext.org/three-character-classic",
        				"urllicense": "https://creativecommons.org/publicdomain/zero/1.0/"
        			},
        			{
        				"license": "CC0 1.0",
        				"name": "Art of war (translation)",
        				"type": "book",
        				"urlinfo": "https://ctext.org/art-of-war/",
        				"urllicense": "https://creativecommons.org/publicdomain/zero/1.0/"
        			},
        			{
        				"license": "CC0 1.0",
        				"name": "Art of war (pieces)",
        				"type": "pieces",
        				"urlinfo": "https://ctext.org/art-of-war/",
        				"urllicense": "https://creativecommons.org/publicdomain/zero/1.0/"
        			},
        			{
        				"license": "CC0 1.0",
        				"name": "Le Classique des Trois Caractères",
        				"type": "book",
        				"urlinfo": "http://wengu.tartarie.com/wg/wengu.php?l=Sanzijing\u0026s=1\u0026lang=fr",
        				"urllicense": "https://creativecommons.org/publicdomain/zero/1.0/"
        			},
        			{
        				"license": "CC0 1.0",
        				"name": "Le Classique des Trois Caractères (pieces)",
        				"type": "pieces",
        				"urlinfo": "http://wengu.tartarie.com/wg/wengu.php?l=Sanzijing\u0026s=1\u0026lang=fr",
        				"urllicense": "https://creativecommons.org/publicdomain/zero/1.0/"
        			},
        			{
        				"license": "CC0 1.0",
        				"name": "Father Serge, Tolstoï (Отец Сергий, Толстой) (partial)",
        				"type": "book",
        				"urlinfo": "https://en.wikisource.org/wiki/Father_Sergius",
        				"urllicense": "https://creativecommons.org/publicdomain/zero/1.0/"
        			}
        		]
        	}`)},
		},
	})
}

func TestDataGetMetas(t *testing.T) {
	initDataTest()

	path := "private/data/path"

	name := "superbuniquename"

	mkd := func(uid auth.UserId, lid int64, pub bool) *SetDataIn {
		return &SetDataIn{
			Token     : "x",
			Name      : name,
			Type      : "book",
			Descr     : "foo",
			Fmt       : "markdown",
			Public    : pub,
			LicenseId : lid,
			UrlInfo   : "x",
			Content   : "foo",
			File      : path,
			UserId    : uid,
			Id        : -1,
		}
	}

	book := mkd(zmId, cc0Id, false)

	ftests.Run(t, []ftests.Test{
		{
			"Invalid input",
			callURL,
			[]any{handler, "/get/metas", "", ""},
			[]any{map[string]any{
				"err": "JSON decoding failure: json: cannot unmarshal string into Go value of type main.GetMetasIn",
			}},
		},
		{
			"Not logged in: can access (literal) nothing",
			callURL,
			[]any{handler, "/get/metas", &GetMetasIn{
				Names : []string{},
			}, ""},
			[]any{mustParseJSON(`{
        		"metas": []
        	}`)},
		},
		{
			"Not logged in: can access public books",
			callURL,
			[]any{handler, "/get/metas", &GetMetasIn{
				Names : []string{"Shuowen Jiezi, book (Wikisource)"},
			}, ""},
			[]any{mustParseJSON(`{
        		"metas": [
        			{
        				"file": "data/books/shuo-wen-jie-zi.src",
        				"fmt": "markdown",
        				"name": "Shuowen Jiezi, book (Wikisource)",
        				"type": "book"
        			}
        		]
        	}`)},
		},
		{
			"Add a private book",
			db.AddData,
			[]any{book},
			[]any{nil},
		},
		{
			"Not logged in: can't access private book",
			callURL,
			[]any{handler, "/get/metas", &GetMetasIn{
				Names : []string{name},
			}, ""},
			[]any{mustParseJSON(`{ "metas" : [] }`)},
		},
		mkLoginWithZM(),
	})
	ftests.Run(t, []ftests.Test{
		{
			"Can access private book when logged-in",
			callURL,
			[]any{handler, "/get/metas", &GetMetasIn{
				Names : []string{name},
			}, tokenStr},
			[]any{mustParseJSON(`{ "metas" : [
				{
					"type": "book",
					"name": "`+name+`",
					"fmt":  "markdown",
					"file": "`+path+`"
				}
			] }`)},
		},
	})
}

func TestDataGetLicenses(t *testing.T) {
	initDataTest()

	ftests.Run(t, []ftests.Test{
		{
			"Invalid input",
			callURL,
			[]any{handler, "/get/licenses", "", ""},
			[]any{map[string]any{
				"err": "JSON decoding failure: json: cannot unmarshal string into Go value of type main.GetLicensesIn",
			}},
		},
		{
			"Default licenses",
			callURL,
			[]any{handler, "/get/licenses", &GetLicensesIn{}, ""},
			// a bit clumsy, but having raw struct can lead to more or
			// less weird issues when comparing (e.g. json makes float64 out
			// of all numbers, but for example in the present case, even
			// this isn't enough (haven't digged deeper))
			[]any{mustParseJSON(`
				{
		       		"Licenses": [
		       			{
		       				"id": 1,
		       				"name": "CC0 1.0"
		       			},
		       			{
		       				"id": 2,
		       				"name": "CC BY-SA 3.0"
		       			},
		       			{
		       				"id": 3,
		       				"name": "CC BY-SA 4.0"
		       			},
		       			{
		       				"id": 4,
		       				"name": "Unicode ToS"
		       			},
		       			{
		       				"id": 5,
		       				"name": "GPLv2"
		       			},
		       			{
		       				"id": 6,
		       				"name": "CC BY-SA 2.0"
		       			},
		       			{
		       				"id": 7,
		       				"name": "CC BY-NC-SA 3.0"
		       			},
		       			{
		       				"id": 8,
		       				"name": "Unlicense"
		       			},
		       			{
		       				"id": 9,
		       				"name": "Gutenberg license"
		       			}
		       		]
		       	}`),
	       	},
		},
	})
}
