#!/bin/bash

npm install --prod
zip -r GetUserInfos.zip node_modules/*
zip GetUserInfos.zip index.js