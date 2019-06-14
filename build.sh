#!/bin/bash

npm run build
zip -r bundle.zip build/*
zip -r bundle.zip config/*
zip -r bundle.zip src/*
zip bundle.zip .babelrc
zip bundle.zip package.json
zip bundle.zip package-lock.json
zip bundle.zip README.md
zip bundle.zip tsconfig.json
zip bundle.zip manifest.json
