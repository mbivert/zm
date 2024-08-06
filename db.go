package main

import (
	"database/sql"
	"errors"
	"fmt"
	"sync"
	"strconv"
	"strings"
	_ "github.com/mattn/go-sqlite3"

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
// this should be moore than enough.
func (db *DB) CanGet(uid auth.UserId, path string) (bool, error) {
	db.Lock()
	defer db.Unlock()

	// XXX this shouldn't happen anymore, but that's
	// probably handled too lightly upstream.
	if strings.HasPrefix(path, "/") {
//		panic(path)
		path = path[1:]
	}

	fmt.Println(path)

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

	if err != nil {
		return false, err
	}

	return public >= 1 || owner == uid, nil
}

// TODO: s/AddData/SetData/? (see how it mixes with edit maybe)
func (db *DB) AddData(d *DataSetIn) error {
	db.Lock()
	defer db.Unlock()

	var did int64

	err := db.QueryRow(`
		INSERT INTO
			Data (
				Name, UserId, Type, Descr, File, Formatter,
				Fmt, FmtParams, UrlInfo
			)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING Id`,
			d.Name, d.UserId, d.Type,
			d.Descr, d.File, "cat",
			d.Fmt, "", d.UrlInfo).Scan(&did)

	if err != nil {
		return err
	}

	pub := 0
	if d.Public {
		pub = 1
	}

	// NOTE: _.LastInsertId() is a thing for some DB
	_, err = db.Exec(`
		INSERT INTO
			Permission (DataId, Public)
		VALUES
			($1, $2)
	`, did, pub)
	if err != nil {
		return nil
	}

	_, err = db.Exec(`
		INSERT INTO
			DataLicense (DataId, LicenseId)
		VALUES
			($1, $2)
	`, did, d.LicenseId)

	return err
}

// Grab all books, publics or owned by said user
func (db *DB) GetBooks(uid auth.UserId) ([]Book, error) {
	db.Lock()
	defer db.Unlock()

	rows, err := db.Query(`
		SELECT
			Name, Descr, File, UrlInfo, UserId
		FROM
			Data, Permission
		WHERE
			Data.Id = Permission.DataId
		AND Data.Type = 'book'
		AND (Data.UserId = $1 OR Permission.Public >= 1)
	`, uid)
	if err != nil {
		return nil, err
	}
	// Should never happen in normal circumstances
	if errors.Is(err, sql.ErrNoRows) {
		return []Book{}, nil
	}
	defer rows.Close()

	var bs []Book

	for rows.Next() {
		var b Book
		var owner auth.UserId
		if err := rows.Scan(&b.Name, &b.Descr, &b.File, &b.UrlInfo, &owner); err != nil {
			return nil, err
		}
		b.Owned = owner == uid
		bs = append(bs, b)
	}
	return bs, rows.Err()
}

// This is to build about: we want to retrieve all (public) data
// for user zhongmu: this is the main data used to make the site
// work, that for which we usually have Resources, will have
// automatic updates, etc.
func (db *DB) GetAbouts() ([]AboutData, error) {
	db.Lock()
	defer db.Unlock()

	// XXX/TODO: hardcoding zhongmu's UserId
	rows, err := db.Query(`
		SELECT
			Data.Type, Data.Name, Data.UrlInfo, License.Name, License.URL
		FROM
			Data, License, DataLicense
		WHERE
			DataLicense.DataId    = Data.Id
		AND DataLicense.LicenseId = License.Id
		AND Data.UserId           = 1
	`)
	// Should never happen in normal circumstances
	if errors.Is(err, sql.ErrNoRows) {
		return []AboutData{}, nil
	}
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var xs []AboutData

	for rows.Next() {
		var x AboutData
		if err := rows.Scan(&x.Type, &x.Name, &x.UrlInfo, &x.License, &x.UrlLicense); err != nil {
			return nil, err
		}
		xs = append(xs, x)
	}
	return xs, rows.Err()
}

func (db *DB) GetMetas(ms []string) ([]Metas, error) {
	db.Lock()
	defer db.Unlock()

	// XXX/TODO: when testing, see if the SQL is solid enough
	// for not to be guarded as such.
	if len(ms) == 0 {
		return []Metas{}, nil
	}

	// ys is to create a list of $1, $2, etc.
	// zs is because db.Query() requires an []any
	ys := make([]string, len(ms))
	zs := make([]any, len(ms))
	for i, v := range ms {
		ys[i] = "$"+strconv.Itoa(i+1)
		zs[i] = v
	}

	// XXX/TODO: hardcoding zhongmu's UserId
	rows, err := db.Query(`
		SELECT
			Type, Name, Fmt, File
		FROM
			Data
		WHERE
			Name in (`+strings.Join(ys, ", ")+`)
	`, zs...)
	if errors.Is(err, sql.ErrNoRows) {
		return []Metas{}, nil
	}
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var xs []Metas

	for rows.Next() {
		var x Metas
		if err := rows.Scan(&x.Type, &x.Name, &x.Fmt, &x.File); err != nil {
			return nil, err
		}
		xs = append(xs, x)
	}
	return xs, rows.Err()
}

func (db *DB) GetDataOf(uid auth.UserId) ([]Data, error) {
	db.Lock()
	defer db.Unlock()

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
	`, uid)

	// Assume no data, but it could be because the uid is rotten
	if errors.Is(err, sql.ErrNoRows) {
		return []Data{}, nil
	}
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var xs []Data

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

	fmt.Println(xs, rows.Err(), uid)
	return xs, rows.Err()
}

func (db *DB) GetLicenses() ([]License, error) {
	db.Lock()
	defer db.Unlock()

	rows, err := db.Query(`
		SELECT
			Id, Name
		FROM
			License
	`)
	if err != nil {
		return nil, err
	}
	// Should never happen in normal circumstances
	if errors.Is(err, sql.ErrNoRows) {
		return []License{}, nil
	}
	defer rows.Close()

	var xs []License

	for rows.Next() {
		var x License
		if err := rows.Scan(&x.Id, &x.Name); err != nil {
			return nil, err
		}
		xs = append(xs, x)
	}
	return xs, rows.Err()
}
