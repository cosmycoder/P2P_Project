#!/bin/bash
source .env
cd truffle
./compile.sh
cd ../client
if [[ "$CLIENT_ENV" == "production" ]]
then
    npm run build
    serve -s build -l 80
else
    npm start
fi
