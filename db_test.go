package main

/*
 * NOTE: tests for db-user.go can be found in ../auth/db-sqlite_test.go;
 * we're here, for now, focusing on testing data access.
 *
 * NOTE: Regarding errors, in particular broken FOREIGN KEYS constraint,
 * we can't build a sqlite3.Error correctly here, because its err field
 * is unexported.
 */

import (
	"testing"
	"time"
	"os"
	"fmt"
	"log"
	"errors"
	"database/sql"
	"github.com/mbivert/auth"
	"github.com/mbivert/ftests"
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
var cc0Id = int64(1) // CC0 1.0 license (~public domain)

// Individual tests rely on a ~fresh DB; `init()` cannot be
// called directly.
func initTestDB() {
	dbfn := "./db-test.sqlite"
	err := os.RemoveAll(dbfn) // won't complain if dbfn doesn't exist
	if err != nil {
		log.Fatal(err)
	}

	// multiStatements=true required for the rough
	// SQL injection performed by loadTestSQL()
	db, err = NewDB(dbfn+"?multiStatements=true")
	if err != nil {
		log.Fatal(err)
	}

	if err := loadTestSQL("schema.sql"); err != nil {
		log.Fatal(err)
	}

	if err := loadTestSQL("schema-user-dev.sql"); err != nil {
		log.Fatal(err)
	}

	if err := loadTestSQL("schema-values.sql"); err != nil {
		log.Fatal(err)
	}

	now = time.Now().Unix()
}

// Bare SQL injections
func loadTestSQL(path string) error {
	x, err := os.ReadFile(path)
	if err != nil {
		return err
	}

	_, err = db.Exec(string(x))
	return err
}

// For tests purposes only
func (db *DB) hasDataWithName(name string) (bool, error) {
	db.Lock()
	defer db.Unlock()

	did := -1

	err := db.QueryRow(`
		SELECT Id FROM Data WHERE name = $1
	`, name).Scan(&did)

	// Should never happen in normal circumstances
	if errors.Is(err, sql.ErrNoRows) {
		return false, nil
	} else if err != nil {
		return false, err
	}
	return true, nil
}

// This is to test AddData, which eats a DataSetIn: the
// fields we want to tests are essentially there too.
func (db *DB) getDataByNameUid(name string, uid auth.UserId) (*DataSetIn, error) {
	db.Lock()
	defer db.Unlock()

	var x DataSetIn

	err := db.QueryRow(`
		SELECT
			Data.Name, Data.UserId, Data.Type, Data.Descr, Data.File,
			Data.Fmt, Data.UrlInfo, Permission.Public, License.Id
		FROM
			Data, License, DataLicense, Permission
		WHERE
			DataLicense.DataId    = Data.Id
		AND DataLicense.LicenseId = License.Id
		AND Permission.DataId     = Data.Id
		AND Data.Name             = $1
		AND Data.UserId           = $2
	`, name, uid).Scan(
		&x.Name, &x.UserId, &x.Type, &x.Descr, &x.File,
		&x.Fmt,  &x.UrlInfo, &x.Public, &x.LicenseId,
	)

	if err != nil {
		return nil, err
	}
	return &x, nil
}

func (db *DB) deleteAllBooks() error {
	_, err := db.Exec("DELETE FROM Data WHERE Type = 'book'")
	return err
}

func TestCanGet(t *testing.T) {
	initTestDB()

	path := "private/data/path"

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
		File      : path,
		UserId    : zmId,
		Id        : -1,
	}

	// TODO: test the path starting with a / or not, to be done
	// while testing data.go.
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
			[]any{mbId, path},
			[]any{false, nil},
		},
		{
			"Can get private paths for zm",
			db.CanGet,
			[]any{zmId, path},
			[]any{true, nil},
		},
	})
}

func TestAddData(t *testing.T) {
	initTestDB()

	path := "private/data/path"

	name := "superbuniquename"

	mkd := func(uid auth.UserId, lid int64, pub bool) *DataSetIn {
		return &DataSetIn{
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

	// TODO: test the path starting with a / or not, to be done
	// while testing data.go.
	ftests.Run(t, []ftests.Test{
		{
			"Foreign key constraint broke on unknown uid",
			db.AddData,
			[]any{mkd(89, 1, false)},
			[]any{fmt.Errorf("Unknown UserId")},
		},
		{
			"Foreign key constraint broke on unknown license id",
			db.AddData,
			[]any{mkd(zmId, 1000, false)},
			[]any{fmt.Errorf("Unknown LicenseId")},
		},
		{
			"No dangling data from previous failure",
			db.hasDataWithName,
			[]any{name},
			[]any{false, nil},
		},
		{
			"Random data with okay foreign keys",
			db.AddData,
			[]any{mkd(zmId, cc0Id, true)},
			[]any{nil},
		},
		{
			"Data seems to have been registered in Data",
			db.hasDataWithName,
			[]any{name},
			[]any{true, nil},
		},
		{
			"Data correctly added",
			db.getDataByNameUid,
			[]any{name, zmId},
			[]any{&DataSetIn{
				Token     : "", // not set
				Name      : name,
				Type      : "book",
				Descr     : "foo",
				Fmt       : "markdown",
				Public    : true,
				LicenseId : cc0Id,
				UrlInfo   : "x",
				Content   : "", // not set
				File      : path,
				UserId    : zmId,
				Id        : 0, // not set
			}, nil },
		},
		{
			"Same Data name for different users",
			db.AddData,
			[]any{mkd(mbId, cc0Id, false)},
			[]any{nil},
		},
		{
			"Data correctly added (bis)",
			db.getDataByNameUid,
			[]any{name, mbId},
			[]any{&DataSetIn{
				Token     : "", // not set
				Name      : name,
				Type      : "book",
				Descr     : "foo",
				Fmt       : "markdown",
				Public    : false,
				LicenseId : cc0Id,
				UrlInfo   : "x",
				Content   : "", // not set
				File      : path,
				UserId    : mbId,
				Id        : 0, // not set
			}, nil },
		},
	})
}

// Edit x/^		{\n/+,/^		},?\n/- | qcol -k -n
func mkDefaultBooks(pub bool) []Book {
	return []Book {
		{
			Name:    "Shuowen Jiezi, book (Wikisource)",
			Descr:   "WikiSource version of the ShuoWen JieZi",
			File:    "data/books/shuo-wen-jie-zi.src",
			UrlInfo: "https://en.wikisource.org/wiki/zh:%E8%AA%AA%E6%96%87%E8%A7%A3%E5%AD%97",
			Owned:   pub,
		},
		{
			Name:    "Bai Jia Xing",
			Descr:   "Bai Xia Jing",
			File:    "data/books/bai-jia-xing.src",
			UrlInfo: "https://www.gutenberg.org/files/25196/25196-0.txt",
			Owned:   pub,
		},
		{
			Name:    "Qian Zi Wen",
			Descr:   "Qian Zi Wen",
			File:    "data/books/qian-zi-wen.src",
			UrlInfo: "https://zh.wikisource.org/wiki/%E5%8D%83%E5%AD%97%E6%96%87",
			Owned:   pub,
		},
		{
			Name:    "三字經 (Three Character Classic)",
			Descr:   "Three Character Classic, original",
			File:    "data/books/san-zi-jing.src",
			UrlInfo: "https://ctext.org/three-character-classic",
			Owned:   pub,
		},
		{
			Name:    "Art of war (partial)",
			Descr:   "Sun-Tzu s Art of war",
			File:    "data/books/art-of-war.src",
			UrlInfo: "https://ctext.org/art-of-war/",
			Owned:   pub,
		},
		{
			Name:    "Three Character Classic (translation)",
			Descr:   "Three Character Classic translated by Herbert Giles",
			File:    "data/books/san-zi-jing.tr",
			UrlInfo: "https://ctext.org/three-character-classic",
			Owned:   pub,
		},
		{
			Name:    "Art of war (translation)",
			Descr:   "Sun-Tzu s Art of war",
			File:    "data/books/art-of-war.tr",
			UrlInfo: "https://ctext.org/art-of-war/",
			Owned:   pub,
		},
		{
			Name:    "Le Classique des Trois Caractères",
			Descr:   "Le Classique des Trois Caractères, traduit par Deverge",
			File:    "data/books/san-zi-jing-fr.tr",
			UrlInfo: "http://wengu.tartarie.com/wg/wengu.php?l=Sanzijing\u0026s=1\u0026lang=fr",
			Owned:   pub,
		},
		{
			Name:    "Father Serge, Tolstoï (Отец Сергий, Толстой) (partial)",
			Descr:   "First few paragraphs from Tolstoï s Father Serge, in Russian",
			File:    "data/books/father-serge-tolstoi.src",
			UrlInfo: "https://en.wikisource.org/wiki/Father_Sergius",
			Owned:   pub,
		},
	}
}

func TestGetBooks(t *testing.T) {
	initTestDB()

	path := "private/data/path"

	name := "superbuniquename"

	mkd := func(uid auth.UserId, lid int64, pub bool) *DataSetIn {
		return &DataSetIn{
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
	book1 := mkd(mbId, cc0Id, true)

	ftests.Run(t, []ftests.Test{
		{
			"Default books",
			db.GetBooks,
			[]any{zmId},
			[]any{mkDefaultBooks(true), nil},
		},
		{
			"Add a private book",
			db.AddData,
			[]any{book},
			[]any{nil},
		},
	})

	books := append(mkDefaultBooks(true), Book{
		Name:    book.Name,
		Descr:   book.Descr,
		File:    book.File,
		UrlInfo: book.UrlInfo,
		Owned:   true,
	})

	ftests.Run(t, []ftests.Test{
		{
			"Default books + one privately owned",
			db.GetBooks,
			[]any{zmId},
			[]any{books, nil},
		},
		{
			"Default books + one privately not owned",
			db.GetBooks,
			[]any{mbId},
			[]any{mkDefaultBooks(false), nil},
		},
		{
			"Add a private book",
			db.AddData,
			[]any{book1},
			[]any{nil},
		},
	})

	books1 := append(books, Book{
		Name:    book1.Name,
		Descr:   book1.Descr,
		File:    book1.File,
		UrlInfo: book1.UrlInfo,
		Owned:   false,
	})

	ftests.Run(t, []ftests.Test{
		{
			"Default books + one privately owned + a public one",
			db.GetBooks,
			[]any{zmId},
			[]any{books1, nil},
		},
		{
			"Removing all books",
			db.deleteAllBooks,
			[]any{},
			[]any{nil},
		},
		{
			"No books is not an error",
			db.GetBooks,
			[]any{zmId},
			[]any{[]Book{}, nil},
		},
	})
}
