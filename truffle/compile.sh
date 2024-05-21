#!/bin/bash
rm build/contracts/Bingo.json
mkdir -p ../client/src/contracts
truffle migrate && cp build/contracts/Bingo.json ../client/src/contracts/Bingo.json
