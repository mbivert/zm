package main

/*
 * NOTE: tests for db-user.go can be found in ../auth/db-sqlite_test.go;
 * we're here, for now, focusing on testing data access.
 */

import (
	"testing"
	"time"
	"os"
	"fmt"
	"log"
	"github.com/mbivert/auth"
	"github.com/mbivert/ftests"

	_ "github.com/mattn/go-sqlite3"
)

var db *DB
var now int64

// Tests below rely heavily on what's in schema.sql; the
// goal of those variables is to clarify what we use, and
// to make the tests more resilient to potential changes
// (though we may also keep the current schema.sql for
// tests regardless).
var zmId = auth.UserId(1)
var mbId = auth.UserId(2)
var ccCEDictPath = "data/dict/cc-cedict.csv.gz"

// Individual tests rely on a ~fresh DB; `init()` cannot be
// called directly.
func initTestDB() {
	dbfn := "./db-test.sqlite"
	err := os.RemoveAll(dbfn) // won't complain if dbfn doesn't exist
	if err != nil {
		log.Fatal(err)
	}
	db, err = NewDB(dbfn+"?multiStatements=true")
	if err != nil {
		log.Fatal(err)
	}

	if err := loadTestSQL("schema.sql"); err != nil {
		log.Fatal(err)
	}

	if err := loadTestSQL("user-dev.sql"); err != nil {
		log.Fatal(err)
	}

	now = time.Now().Unix()
}

// Bare SQL injections; requires the multiStatements=true
// in the connection string.
func loadTestSQL(path string) error {
	x, err := os.ReadFile(path)
	if err != nil {
		return err
	}

	_, err = db.Exec(string(x))
	return err
}

func TestCanGet(t *testing.T) {
	initTestDB()

	x := DataSetIn{
		Token     : "x",
		Name      : "foo",
		Type      : "book",
		Descr     : "foo",
		Fmt       : "markdown",
		Public    : false,
		LicenseId : 1,
		UrlInfo   : "x",
		Content   : "foo",
		File      : "private/data/path",
		UserId    : zmId,
		Id        : -1,
	}

	ftests.Run(t, []ftests.Test{
		{
			"Public files available to read for zm",
			db.CanGet,
			[]any{zmId, ccCEDictPath},
			[]any{true, nil},
		},
		{
			"Can't get inexistant paths",
			db.CanGet,
			[]any{zmId, "nowhere/to/be/found"},
			[]any{false, fmt.Errorf("No DB entry with given path: 'nowhere/to/be/found'")},
		},
		{
			"Add some private data",
			db.AddData,
			[]any{&x},
			[]any{nil},
		},
		{
			"Can't get private paths for mb",
			db.CanGet,
			[]any{mbId, "private/data/path"},
			[]any{false, nil},
		},
		{
			"Can get private paths for zm",
			db.CanGet,
			[]any{zmId, "private/data/path"},
			[]any{true, nil},
		},
	})
}