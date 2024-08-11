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
	handler = initData(db)

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

func mustParseJSON(s string) any {
	var x any
	if err := json.Unmarshal([]byte(s), &x); err != nil {
		log.Fatal(err)
	}
	return x
}

func TestSetData(t *testing.T) {
	initDataTest()

	ftests.Run(t, []ftests.Test{
		{
			"Invalid input",
			callURL,
			[]any{handler, "/set/data", "", ""},
			[]any{map[string]any{
				"err": "JSON decoding failure: json: cannot unmarshal string into Go value of type main.SetDataIn",
			}},
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
