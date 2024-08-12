package main

/*
 * We're testing data.go functions, but via HTTP
 * handlers instead of directly.
 *
 * This should be fine-grained enough.
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

// We're only testing what's happening locally in 'data.go:/^func SetData\(';
// finer tests can be found in db_test.go
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
		{
			"Valid user/password",
			callURLWithToken,
			[]any{handler, "/auth/login", map[string]any{
				"login"  : "zhongmu",
				"passwd" : "{c=!aW}4:1J~UR]j\"q|Q",
			}},
			[]any{map[string]any{
				"token" : jwt.MapClaims{
					"date" : 0,          // redacted to ease tests
					"uniq" : "redacted", // idem
					"uid"  : float64(zmId),
				},
			}},
		},
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
