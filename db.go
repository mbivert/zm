package main

/*
 * NOTE: I'm often using $n (e.g. $1, $2, $3) as placeholders
 * for variables here, but the correct SQLite syntax would be
 * ?NNN (e.g. ?1, ?2, ?3).
 *
 * This is because we may switch to PostgreSQL later on, that'd
 * be one less thing to change.
 *
 * However it must be then noted that $1, $2, etc. ARE NOT positional
 * parameters, but merely equivalent to a simple generic ?
 *
 * NOTE: AddData/UpdateData are in charge of writing .Content to .File
 * to help reverting changes in case of errors.
 */

import (
	"database/sql"
	"errors"
	"fmt"
	"sync"
	"strconv"
	"strings"
	_ "github.com/mattn/go-sqlite3"
	"testing"

	"github.com/mbivert/auth"
)

type DB struct {
	*sql.DB
	*sync.Mutex
}

// Assumes that the DB has been initialized beforehand.
func NewDB(path string) (*DB, error) {
	db, err := sql.Open("sqlite3", "file:"+path)

	if err != nil {
		return nil, err
	}

	return &DB{db,&sync.Mutex{}}, nil
}

// XXX eventually, we'll want this to be cached, but for zm's purposes,
// this should be mooore than enough.
func (db *DB) CanGet(uid auth.UserId, path string) (bool, error) {
	db.Lock()
	defer db.Unlock()

	// XXX/TODO this shouldn't happen anymore, but that's
	// probably handled too lightly upstream.
	if strings.HasPrefix(path, "/") {
//		panic(path)
		path = path[1:]
	}

	var owner auth.UserId
	var public int

	// XXX: meh, path vs. File
	err := db.QueryRow(`
		SELECT
			Permission.Public, User.Id
		FROM
			Data, Permission, User
		WHERE
			File = $1
		AND Data.Id = Permission.DataId
		AND Data.UserId == User.Id
	`, path).Scan(&public, &owner)

	// XXX/TODO: we probably leak bits we shouldn't be leaking here.
	// (e.g. it's possible to enumerate all files for all users)
	//
	// This can (should) be tweaked by the data.go code instead of here.
	if errors.Is(err, sql.ErrNoRows) {
		return false, fmt.Errorf("No DB entry with given path: '%s'", path)
	} else if err != nil {
		return false, err
	}

	// XXX/TODO Why aren't we doing this in SQL already?
	return public >= 1 || owner == uid, nil
}

func tryRollback(tx *sql.Tx, err error) error {
	if err2 := tx.Rollback(); err2 != nil {
		err = fmt.Errorf("%s, additionally, rollback failed: %s\n", err, err2)
	}
	return err
}

// NOTE: perhaps we could merge UpdateData() with AddData(),
// but I'm not sure it'd make things clearer.
func (db *DB) UpdateData(d *SetDataIn) error {
	db.Lock()
	defer db.Unlock()

	tx, err := db.Begin()
	if err != nil {
		return err
	}

	// NOTE: we're returning the File field so as to
	// recycle the path.
	err = tx.QueryRow(`
		UPDATE
			Data
		SET
			Name      = $1,
			Type      = $2,
			Descr     = $3,
			Formatter = $4,
			Fmt       = $5,
			FmtParams = $6,
			UrlInfo   = $7
		WHERE
			UserId    = $8
		AND Id        = $9
		RETURNING
			File`,
		d.Name, d.Type, d.Descr, "cat",
		d.Fmt, "", d.UrlInfo, d.UserId, d.Id,
	).Scan(&d.File)
	if err != nil {
		if isErrConstraintFk(err) {
			err = fmt.Errorf("Unknown UserId")
		}
		if isErrConstraintUniq(err) {
			err = fmt.Errorf("Seems there's already something named '%s'", d.Name)
		}
		return tryRollback(tx, err)
	}

	_, err = tx.Exec(`
		UPDATE
			Permission
		SET
			Public = $1
		WHERE
			DataId = $2
	`, d.Public, d.Id)
	if err != nil {
		return tryRollback(tx, err)
	}

	_, err = tx.Exec(`
		UPDATE
			DataLicense
		SET
			LicenseId = $1
		WHERE
			DataId    = $2
	`, d.LicenseId, d.Id)
	if err != nil {
		if isErrConstraintFk(err) {
			err = fmt.Errorf("Unknown LicenseId")
		}
		return tryRollback(tx, err)
	}

	if writeDataFile(d.File, d.Content); err != nil {
		return tryRollback(tx, err)
	}

	return tx.Commit()
}

func (db *DB) AddData(d *SetDataIn) error {
	db.Lock()
	defer db.Unlock()

	tx, err := db.Begin()
	if err != nil {
		return err
	}

	err = tx.QueryRow(`
		INSERT INTO
			Data (
				Name, UserId, Type, Descr, File, Formatter,
				Fmt, FmtParams, UrlInfo
			)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING Id`,
			d.Name, d.UserId, d.Type,
			d.Descr, d.File, "cat",
			d.Fmt, "", d.UrlInfo).Scan(&d.Id)

	if err != nil {
		if isErrConstraintFk(err) {
			err = fmt.Errorf("Unknown UserId")
		}
		if isErrConstraintUniq(err) {
			err = fmt.Errorf("Path '%s' already there"+
				" or there's something named '%s'", d.File, d.Name)
		}
		return tryRollback(tx, err)
	}

	pub := 0
	if d.Public {
		pub = 1
	}

	// NOTE: _.LastInsertId() is a thing for some DB
	_, err = tx.Exec(`
		INSERT INTO
			Permission (DataId, Public)
		VALUES
			($1, $2)
	`, d.Id, pub)
	if err != nil {
		return tryRollback(tx, err)
	}

	_, err = tx.Exec(`
		INSERT INTO
			DataLicense (DataId, LicenseId)
		VALUES
			($1, $2)
	`, d.Id, d.LicenseId)
	if err != nil {
		if isErrConstraintFk(err) {
			err = fmt.Errorf("Unknown LicenseId")
		}
		return tryRollback(tx, err)
	}

	if writeDataFile(d.File, d.Content); err != nil {
		return tryRollback(tx, err)
	}

	return tx.Commit()
}

// Grab all books, publics or owned by said user
func (db *DB) GetBooks(uid auth.UserId) ([]Book, error) {
	db.Lock()
	defer db.Unlock()

	// XXX clumsy, but other options aren't much better anyway.
	orderby := ""
	if testing.Testing() {
		orderby = "ORDER BY Data.Id"
	}

	rows, err := db.Query(`
		SELECT
			Name, Descr, File, UrlInfo, UserId
		FROM
			Data, Permission
		WHERE
			Data.Id = Permission.DataId
		AND Data.Type = 'book'
		AND (Data.UserId = $1 OR Permission.Public == 1)
	`+orderby, uid)

	// NOTE: sql.ErrNoRows seems to only arises after a .Scan():
	// it's useless to check for it here.
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	xs := []Book{}

	for rows.Next() {
		var x Book
		var owner auth.UserId
		if err := rows.Scan(&x.Name, &x.Descr, &x.File, &x.UrlInfo, &owner); err != nil {
			return nil, err
		}
		x.Owned = owner == uid
		xs = append(xs, x)
	}
	return xs, rows.Err()
}

// This is to build about: we want to retrieve all (public) data
// for user zhongmu: this is the main data used to make the site
// work, that for which we usually have Resources, will have
// automatic updates, etc.
func (db *DB) GetAbouts(zmid auth.UserId) ([]About, error) {
	db.Lock()
	defer db.Unlock()

	// XXX clumsy, but other options aren't much better anyway.
	orderby := ""
	if testing.Testing() {
		orderby = "ORDER BY Data.Id"
	}

	rows, err := db.Query(`
		SELECT
			Data.Type, Data.Name, Data.UrlInfo, License.Name, License.URL
		FROM
			Data, License, DataLicense
		WHERE
			DataLicense.DataId    = Data.Id
		AND DataLicense.LicenseId = License.Id
		AND Data.UserId           = $1
	`+orderby, zmid)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	xs := []About{}

	for rows.Next() {
		var x About
		if err := rows.Scan(&x.Type, &x.Name, &x.UrlInfo, &x.License, &x.UrlLicense); err != nil {
			return nil, err
		}
		xs = append(xs, x)
	}
	return xs, rows.Err()
}

func (db *DB) GetMetas(uid auth.UserId, ms []string) ([]Metas, error) {
	db.Lock()
	defer db.Unlock()

	// NOTE: All this works fine with an empty ms

	// ys is to create a list of $2, $3, etc.
	// zs is because db.Query() requires an []any
	ys := make([]string, len(ms))
	zs := make([]any, 1+len(ms))
	zs[0] = uid
	for i, v := range ms {
		ys[i] = "$"+strconv.Itoa(i+2)
		zs[i+1] = v
	}

	// XXX clumsy, but other options aren't much better anyway.
	orderby := ""
	if testing.Testing() {
		orderby = "ORDER BY Data.Id"
	}

	// NOTE: again, mind the fact that our $1, $2, etc.
	// are, as far as SQLite is concerned, equivalent to
	// generic ?, so the order we use our variables
	// matters.
	rows, err := db.Query(`
		SELECT
			Type, Name, Fmt, File
		FROM
			Data, Permission
		WHERE
			Permission.DataId = Data.Id
		AND (
			   Permission.Public = 1
			OR (?1 > 0 AND Data.UserId = ?1)
		)
		AND Name in (`+strings.Join(ys, ", ")+`)
	`+orderby, zs...)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	xs := []Metas{}

	for rows.Next() {
		var x Metas
		if err := rows.Scan(&x.Type, &x.Name, &x.Fmt, &x.File); err != nil {
			return nil, err
		}
		xs = append(xs, x)
	}
	return xs, rows.Err()
}

// TODO: eventually, rename? GetOwnedBy()
func (db *DB) GetDataOf(uid auth.UserId) ([]Data, error) {
	db.Lock()
	defer db.Unlock()

	// XXX clumsy, but other options aren't much better anyway.
	orderby := ""
	if testing.Testing() {
		orderby = "ORDER BY Data.Id"
	}

	rows, err := db.Query(`
		SELECT
			Data.Id, Data.Name, Data.Type, Data.Descr, Data.File,
			Data.Fmt, Data.UrlInfo, Permission.Public, License.Id,
			License.Name
		FROM
			Data, License, DataLicense, Permission
		WHERE
			DataLicense.DataId    = Data.Id
		AND DataLicense.LicenseId = License.Id
		AND Permission.DataId     = Data.Id
		AND Data.UserId           = $1
	`+orderby, uid)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	xs := []Data{}

	for rows.Next() {
		var x Data
		if err := rows.Scan(
			&x.Id, &x.Name, &x.Type, &x.Descr, &x.File, &x.Fmt,
			&x.UrlInfo, &x.Public, &x.LicenseId, &x.LicenseName,
		); err != nil {
			return nil, err
		}
		xs = append(xs, x)
	}

	return xs, rows.Err()
}

func (db *DB) GetLicenses() ([]License, error) {
	db.Lock()
	defer db.Unlock()

	// XXX clumsy, but other options aren't much better anyway.
	orderby := ""
	if testing.Testing() {
		orderby = "ORDER BY Id"
	}

	rows, err := db.Query(`
		SELECT
			Id, Name
		FROM
			License
	`+orderby)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	xs := []License{}

	for rows.Next() {
		var x License
		if err := rows.Scan(&x.Id, &x.Name); err != nil {
			return nil, err
		}
		xs = append(xs, x)
	}
	return xs, rows.Err()
}
