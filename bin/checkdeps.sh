#!/bin/sh

# Check that dependencies (executables) are installed
# Fails (exit 1) if not.

set -e

# Basics
which node      > /dev/null
which tsc       > /dev/null
which gzip      > /dev/null

# NOTE: jq/curl/git are actually only used for updating data files
which jq        > /dev/null
which git       > /dev/null
which curl      > /dev/null

# Used for dev website.
which python3   > /dev/null
