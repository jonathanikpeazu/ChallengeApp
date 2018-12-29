source ./.env;

mongod --repair --dbpath $MONGO_LOCAL_DATA_PATH;
bash ./db-start.sh;
