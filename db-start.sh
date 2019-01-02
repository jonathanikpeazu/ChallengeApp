#!/usr/bin/env bash

# Get mongo data path
source ./.env;
echo "Mongo data path is set to ${MONGO_LOCAL_DATA_PATH}"

mkdir -p ${MONGO_LOCAL_DATA_PATH}

mongod --nojournal --dbpath $MONGO_LOCAL_DATA_PATH
