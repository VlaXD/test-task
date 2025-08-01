#!/bin/sh
if [ "$HUSKY_INIT" != false ]; then
    git config core.hooksPath app/.husky && chmod +x .husky/pre-commit
fi