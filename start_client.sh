#!/bin/bash
export CLIENT_ENV=developement # It can be developement or production
export SERVICE_HOST=192.168.5.12
export SERVICE_PORT=7545

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
