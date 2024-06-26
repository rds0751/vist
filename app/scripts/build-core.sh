#!/bin/bash

cd ./../core

yarn build

rsync -rcv ./dist/ ./../app/node_modules/vistawallet-core/dist/

cd ./../app
