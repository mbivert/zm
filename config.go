package main

/*
 * Configuration related code.
 */

import (
	"encoding/json"
	"fmt"
	"os"
)

type Config struct {
	Version string `json:"version"`
	Root    string `json:"root"`
}

func loadConf(fn string, conf *Config) error {
	xs, err := os.ReadFile(fn)
	if err != nil {
		return fmt.Errorf("Cannot read '%s': %s", fn, err)
	}

	if err := json.Unmarshal(xs, conf); err != nil {
		return fmt.Errorf("Error while parsing '%s': %s", fn, err)
	}
	return nil
}
