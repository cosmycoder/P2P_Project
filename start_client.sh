#!/bin/bash
npm install
source .env
cd truffle
./compile.sh
cd ../client
npm install
if [[ "$CLIENT_ENV" == "production" ]]
then
    npm run build
    serve -s build -l 80
else
    npm start
fi
