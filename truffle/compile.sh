#!/bin/bash
rm build/contracts/Bingo.json
truffle migrate && cp build/contracts/Bingo.json ../client/src/contracts/Bingo.json