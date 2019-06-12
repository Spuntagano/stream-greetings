#!/bin/bash

npm install --prod
zip -r IncomingRequest.zip node_modules/*
zip IncomingRequest.zip index.js
zip IncomingRequest.zip patch.js
zip IncomingRequest.zip priv_key.js
rm -rf node_modules