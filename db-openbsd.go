//go:build openbsd
package main

func isErrConstraintFk(err error) bool {
	return false
}
func isErrConstraintUniq(err error) bool {
	return false
}
