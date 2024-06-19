#!/bin/bash
npm install
source .env
cd truffle
./compile.sh
cd ../client
npm install
if [[ "$CLIENT_ENV" == "development" ]]
then
    npm start
else
    npm run build
    serve -s build -l 80
fi
