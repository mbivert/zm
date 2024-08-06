package main

/*
 * Some essentially standalone utilities.
 */

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/mbivert/auth"
	"math/rand"
	"net/http"
	"os"
	"path/filepath"
)

// alnum & randString are copied from ../auth/utils.go
const (
	alnum = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ123456789"
)

// Generate a random string of n bytes
func randString(n int) string {
	buf := make([]byte, n)

	for i := 0; i < n; i++ {
		buf[i] = alnum[rand.Intn(len(alnum))]
	}

	return string(buf)
}

// Test if the given path refer to an existing directory
func isDir(path string) (bool, error) {
	fi, err := os.Stat(path)
	if err != nil {
		return false, err
	}

	return fi.IsDir(), nil
}

type SomeErr struct {
	Err string `json:"err"`
}

// Does its best to dump the given error as JSON to
// the http.ResponseWriter
func fails(w http.ResponseWriter, err error) {
	w.WriteHeader(http.StatusBadRequest)

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	err2 := json.NewEncoder(w).Encode(&SomeErr{err.Error()})
	if err2 != nil {
		// XXX this will have to do for now
		w.Write([]byte("{ err : \"error while encoding '" +
			err.Error() + "': " + err2.Error() + "\"}"))
	}
}

// Read the request's body as JSON
func getJSONBody[Tin any](w http.ResponseWriter, r *http.Request, in *Tin) error {
	r.Body = http.MaxBytesReader(w, r.Body, 1048576)

	err := json.NewDecoder(r.Body).Decode(&in)
	if err != nil {
		err = fmt.Errorf("JSON decoding failure: %s", err)
	}
	return nil
}

// Dump out to w as JSON.
func setJSONBody[Tout any](w http.ResponseWriter, out *Tout) error {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	err := json.NewEncoder(w).Encode(out)
	if err != nil {
		err = fmt.Errorf("JSON encoding failure: %s", err)
	}
	return err
}

// Make the given function f a HandlerFunc which:
//	- grab its input by parsing the HTTP request's body as JSON
//	- dump its output to the HTTP writer.
func wrap[Tctx, Tin, Tout any](
	ctx *Tctx, f func(*Tctx, *Tin, *Tout) error,
) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var in Tin; var out Tout; var err error

		if err = getJSONBody[Tin](w, r, &in); err != nil {
			goto Err
		}

		if err = f(ctx, &in, &out); err != nil {
			goto Err
		}


		if err = setJSONBody[Tout](w, &out); err != nil {
			goto Err
		}

		return

Err:
		fails(w, err)
		return
	}
}

// Try to write content to path; path's intermediate
// directories are eventually created.
func writeFile(path string, content []byte) error {
	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		return err
	}
	return os.WriteFile(path, content, 0644)
}

// NOTE: theoretically, we'd need a lock; practically, much less so...
func mkRandPath(uid auth.UserId) string {
	path := ""
	for {
		path = fmt.Sprintf("data/%d/%s", uid, randString(15))
		fpath := filepath.Join(dir, path)
		_, err := os.Stat(fpath);
		if errors.Is(err, os.ErrNotExist) {
			break
		}
		// TODO: cleaner
		if err != nil {
			panic(err)
		}

	}
	return path
}

const (
	tokenCookie = "token"
)

// Reset the cookie token. This can be triggered e.g. when
// the cookie is now invalid.
//
// TODO: For now, this is only relevant in fs.go, but we'll soon
// drop the Token argument everywhere, and rely on a HttpOnly
// token cookie everywhere, including in ../auth/.
func rstTokenCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     tokenCookie,
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
	})
}

func getTokenCookie(w http.ResponseWriter, r *http.Request) (auth.UserId, error) {
	var ok bool

	// By default, assume the request was initiated by
	// someone not logged-in
	uid := auth.UserId(-1)

	ctok, err := r.Cookie(tokenCookie)

	// Should never happen I guess
	if err != nil && !errors.Is(err, http.ErrNoCookie) {
		return -1, err

	// There is a token cookie
	} else if err == nil && ctok.Value != "" {
		ok, uid, err = auth.IsValidToken(ctok.Value)
		if err != nil {
			return -1, err
		}

		// The cookie has e.g. expired, so consider
		// this a logged-out query, and reset the cookie.
		if !ok {
			rstTokenCookie(w)
			uid = -1
		}
	}

	return uid, nil
}
