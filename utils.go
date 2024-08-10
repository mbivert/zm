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
