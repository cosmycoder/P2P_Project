# Notes

## Ganache
Before deploying the contract or starting the GUI, start `ganache` or `ganache-cli` with the commands:

```bash
ganache-cli -p 7545 -h 0.0.0.0 -l 100000000000 -i 1337 --accounts 10 -e 10000 --seed 69420
```
A brief description of the command:
- `-p` port
- `-h` bind address
- `--db` specify a folder where to store all the transactions, otherwise they won't be saved
- `-l`  set the block gas limit
- `-i` network id
- `--accounts` the number of accounts to create
- `-e` starting eth balance of each account
- `--seed` specify the seed to generate the same private key each time

Then connect the ganache network to your Metamask account.

However, it is recommended to use the provided docker image to run the project (see (this section)[#docker])

## Client

Inside the `client` folder you can find the code of the GUI.
To run the GUI:

```bash
cd client
npm start
```

You can create a `.env` file containing your custom ganache instance (defaults to `ws://127.0.0.1` if not specified):

```bash
# inside client/.env

REACT_APP_CHAIN_URL='ws(s)://you_chain_url:port'
```

## Truffle

Inside truffle, instead, you can find the code to deploy the smart contract.
To deploy the contract:

```bash
cd truffle
./compile.sh
```

You can create a `.env` file containing your custom ganache instance (defaults to `ws://127.0.0.1` if not specified):

```bash
# inside truffle/.env

REACT_APP_CHAIN_URL='ws(s)://you_chain_url:port'
```

# Docker

To start the project with docker, edit the .env file inside the root of the project:

```bash
export CLIENT_ENV=developement
```

Here's a recap of all the `.env` files you can setup (it is not mandatory, de defaults values are enough to start the app locally):

```bash
BingoEth/
├── client/
│   └── .env <- REACT_APP_CHAIN_URL='...'
├── truffle/
│   └── .env <- CHIAN='...'
└── .env <- export CLIENT_ENV=...
```


Finally:

```bash
docker compose up
```

Now you can access the app at http://localhost:3000 (developement) or http://localhost:80 (production).
