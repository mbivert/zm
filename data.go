package main

/*
 * Manage all "/data/" related routes.
 * This is mostly a wrapper above the corresponding
 * database functions (db-data.go)
 */

import (
	"fmt"
	"github.com/mbivert/auth"
	"os"
	"net/http"
	"path/filepath"
)

type DataType string

// XXX we have it 3 times now: JS, Go, SQL
const (
	dataTDict DataType = "dict"
	dataTDecomp        = "decomp"
	dataTBig5          = "big5"
	dataTBook          = "book"
	dataTPieces        = "pieces"
)

type DataFmt string

const (
	dataFCCCEdict DataFmt = "cc-cedict"
	dataFWMDecomp         = "wm-decomp"
	dataFChise            = "chise"
	dataFUnicodeBig5      = "unicode-big5"
	dataFMarkdown         = "markdown"
	dataFSWMarkdown       = "sw-markdown"
	dataFSimpleDict       = "simple-dict"
	dataFPieces           = "pieces"
)

type DataSetIn struct {
	Token     string   // `json:"token"`
	Name      string   // `json:"name"`
	Type      DataType // `json:"type"`
	Descr     string   // `json:"descr"`
	Fmt       DataFmt  // `json:"fmt"`

	Public    bool     // `json:"public"`
	LicenseId int64    // `json:"licenseid"`

	// XXX We at least would want to check that
	// this looks like a URL
	// rename to url?
	UrlInfo   string   // `json:"urlinfo"`

	// Okay, we'll do that for now, this should be
	// good enough for a first draft, and small documents.
	Content   string   // `json:"content"`

	// This two are automatically computed
	File      string
	UserId    auth.UserId
}

type DataSetOut struct {
}

// TODO: have per user size limits; encode this in a context,
// which is to be the first argument of DataSet and probably
// most other such functions (e.g. ctx.CanWrite(uid, xs))
func DataSet(db *DB, in *DataSetIn, out *DataSetOut) error {
	fmt.Println(in)
	ok, uid, err := auth.IsValidToken(in.Token)
	if err != nil {
		return err
	}
	if !ok {
		return fmt.Errorf("Not connected!")
	}

	in.File = mkRandPath(uid)
	in.UserId = uid

	// NOTE: we (try to) write the file before adding to the
	// DB because it's easier to revert in case of issue
	fpath := filepath.Join(dir, in.File)
	if err := writeFile(fpath, []byte(in.Content)); err != nil {
		return err
	}

	if err := db.AddData(in); err != nil {
		// Remove the file we've just added
		if err2 := os.RemoveAll(fpath); err2 != nil {
			err = fmt.Errorf("%s; in addition: %s", err, err2)
		}
		return err
	}
	return nil
}

type DataGetBooksIn struct {
	Token string `json:"token"`
}

type DataGetBooksOut struct {
	Books []Book `json:"books"`
}

func DataGetBooks(db *DB, in *DataGetBooksIn, out *DataGetBooksOut) error {
	ok, uid, err := auth.IsValidToken(in.Token)
	if err != nil {
		return err
	}
	if !ok {
		return fmt.Errorf("Not connected!")
	}

	out.Books, err = db.GetBooks(uid)
	return err
}

type DataGetAboutIn struct {
}

type DataGetAboutOut struct {
	Datas []AboutData `json:"datas"`
}

func DataGetAbout(db *DB, in *DataGetAboutIn, out *DataGetAboutOut) (err error) {
	out.Datas, err = db.GetAbouts()
	return err
}

type DataGetMetasIn struct {
	Names []string `json:"names"`
}

// TODO: we may want to merge this with AboutData;
// naming for sure will have to be unified.
type Metas struct {
	Type       DataType `json:"Type"`
	Name       string   `json:"Name"`
	Fmt        DataFmt  `json:"Fmt"`
	File       string   `json:"File"`
}

type DataGetMetasOut struct {
	Metas []Metas `json:"metas"`
}

func DataGetMetas(db *DB, in *DataGetMetasIn, out *DataGetMetasOut) (err error) {
	out.Metas, err = db.GetMetas(in.Names)
	return err
}

// "Special" request: this is a "GET /data/..." request; it's
// been kept as a GET because we want to involve the browser cache
// For more, see 'DONE.md:/^## medium @data-organisation/'
func GETData(db *DB, root string, w http.ResponseWriter, r *http.Request) {
	var ok bool

	uid, err := getTokenCookie(w, r)
	if err != nil {
		goto Err
	}

	ok, err = db.CanGet(uid, r.URL.Path)
	if !ok {
		err = fmt.Errorf("Access forbidden")
	}
	if err != nil {
		goto Err
	}

	http.ServeFile(w, r, filepath.Join(root, r.URL.Path))
	return

Err:
	fails(w, err)
}
