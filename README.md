# Notes

## Ganache
Before deploying the contract or starting the GUI, start `ganache` or `ganache-cli` with the commands:

```bash
mkdir -p ganache_data
ganache-cli -p 7545 -h 0.0.0.0 --db ./ganache_data -l 100000000000 -i 1337 --accounts 5 -e 10000 --seed 69420
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


## Client

Inside the `client` folder you can find the code of the GUI.
To run the GUI:

```bash
cd client
npm start
```
## Truffle

Inside truffle, instead, you can find the code to deploy the smart contract.
To deploy the contract:

```bash
cd truffle
./compile.sh
```