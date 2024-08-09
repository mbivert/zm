package main

/*
 * Configuration related code.
 */

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/mbivert/auth"
)

type Config struct {
	Version string      `json:"version"`
	Root    string      `json:"root"`

	// SQL Id of the zhongmu user, owner of various
	// "public" files.
	ZmId    auth.UserId `json:"zmid"`
}

func loadConf(fn string, conf *Config) error {
	xs, err := os.ReadFile(fn)
	if err != nil {
		return fmt.Errorf("Cannot read '%s': %s", fn, err)
	}

	if err := json.Unmarshal(xs, conf); err != nil {
		return fmt.Errorf("Error while parsing '%s': %s", fn, err)
	}

	if conf.ZmId == 0 {
		conf.ZmId = 1
	}
	return nil
}
