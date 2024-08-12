//go:build linux
package main

import (
	sqlite3 "github.com/mattn/go-sqlite3"
)

// This is clumsy: https://github.com/mattn/go-sqlite3/issues/949
// Even more so given that this doesn't cross-compile to OpenBSD.
func isErrConstraintFk(err error) bool {
	err2, ok := (err).(sqlite3.Error)
	if ok {
		if err2.Code == sqlite3.ErrConstraint {
			if err2.ExtendedCode == sqlite3.ErrConstraintForeignKey {
				return true
			}
		}
	}
	return false
}

func isErrConstraintUniq(err error) bool {
	err2, ok := (err).(sqlite3.Error)
	if ok {
		if err2.Code == sqlite3.ErrConstraint {
			if err2.ExtendedCode == sqlite3.ErrConstraintUnique {
				return true
			}
		}
	}
	return false
}
