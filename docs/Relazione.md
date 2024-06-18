---
author:
	- "Leonardo Manneschi"
	- "Leonardo Scoppitto"
classoption: a4paper
documentclass: article
fontsize: 11pt
geometry: "left=2cm,right=2cm,top=2cm,bottom=2cm"
output:
	pdf_document:
		latex_engine: xelatex
title: BingoEth
subtitle: Relazione progetto P2P
header-includes: |
    \usepackage{dirtree}

---
\pagenumbering{gobble}
\hypersetup{linkcolor=cyan}

\pagebreak
\renewcommand{\contentsname}{Indice}
\tableofcontents
\pagebreak
\pagenumbering{arabic}
\setcounter{page}{1}

# Introduzione

L'applicazione sviluppata come progetto finale del corso di Peer To Peer & Blockchains si chiama BingoEth e si tratta di un'implementazione del bingo 75 (la versione americana del bingo) realizzata in React/javascript per la parte di front-end e in Solidity per la parte di smart contract.
È possibile consultare il repository

# Struttura del progetto

Il progetto è stato organizzato come segue:

\dirtree{%
.1 client $\rightarrow$ \small{Codice del client scritto in React}.
.1 docs $\rightarrow$ \small{Directory contenente la relazione del progetto}.
.1 truffle $\rightarrow$ \small{Root del progetto dello smart contract}.
.2 contracts.
.3 Bingo.sol $\rightarrow$ \small{Sorgente del contratto}.
.2 migrations.
.3 1\_deploy\_contract.js $\rightarrow$ \small{Script di deploy del contratto}.
.2 test $\rightarrow$ \small{Test del contratto}.
.1 Dockerfile/docker-compose.yml $\rightarrow$ \small{Container docker per il test e il deploy}.
}

```java
    function accuse (int256 _gameId) public {
        require(_gameId > 0, "Game id is negative!");
        require(gameList[_gameId].creator!=msg.sender, "Creator cannot accuse!");
        require(
            containsAddress(
                gameList[_gameId].joiners,
                msg.sender
            ), "Player not in that game!");
        require(gameList[_gameId].accusationTime == 0, "Accusation already made!");
        gameList[_gameId].accusationTime = block.timestamp;
        gameList[_gameId].accuser = msg.sender;
        emit ReceiveAccuse(_gameId, msg.sender);
    }
```

# Manuale utente

## Utilizzo istanza pubblica

Per rendere più fruibile l'utilizzo dell'applicazione sviluppata, è stato eseguito il deploy di **BingoEth** su un server privato insieme a un'istanza di Ganache, così da non dover configurare nulla se non la rete su Metamask. È possibile accedere al progetto all'url [https://bingoeth.alteregofiere.com/](https://bingoeth.alteregofiere.com/).

Gli account disponibili con le relative chiavi private sono:

```
Available Accounts
==================
(0) 0xC2F709C582CDe40CA38b108Fb0e639c14e108A8a (10000 ETH)
(1) 0x35301246031343A7d13507b19aa6d4fE40F6587c (10000 ETH)
(2) 0x97f4Ec285360456cb008B71B22cF1eFDd094e766 (10000 ETH)
(3) 0x0fac963Ae1E20De87294A627938da0f04d9eb78E (10000 ETH)
(4) 0x2b614F260BDD54FF6180543C9125A0e69679d04a (10000 ETH)
(5) 0x9307C2e5EB3e6935D6F35bFa13288BFc36aDd846 (10000 ETH)
(6) 0x7670F41114B30a6f06FD629707b193eCe545a59A (10000 ETH)
(7) 0x1923D74eAC7Fde59A9b08bAc5970350644cC2a90 (10000 ETH)
(8) 0xc0748B93286b8DC2D6C2736725413De61da4Bf56 (10000 ETH)
(9) 0xe50a5343693edd7F9c52ec66ff7358b5f18300B1 (10000 ETH)

Private Keys
==================
(0) 0x99409bd109959b84aae9234ce755a39a6df4c009a53c6a81ea0713d65bd80eb7
(1) 0x98d1ccd915ef23a2a088dfec9a47960f7de3b71d5f3c2aff53b7cb85e411adc5
(2) 0xe41c4f1aad19f7238246df7712f748c5cf4d6ac1c8a78e1b3aafb4a74e6ae39d
(3) 0x42941bc9871700dade0f40b607a8e0528fd9578dbefcf4abe6b4f4b2eea817b0
(4) 0x7a956b721714c8708ff22b25b193dae7efc7eaec77fe5b40c5c2944fc42feebe
(5) 0x9d19b8c0ad94ac66122485684d44bfa782dd84def2c2382b991f3632f3b9a294
(6) 0x8b93665547a073f7055c043ce4e6115a13e0900d18e23d206c9b0b17f8bf27e8
(7) 0x93c2d0ce2d1398fd5585c348a7befd000fecfebd0c9d5005550e820317ab0a47
(8) 0xd994441bc950b1d80191c8a0454a7b186a3562a8cf486390d4f740a713384d81
(9) 0x9f6e155cd2faf86bb96331732d9f5c6727fe0858773d7ad141f67425e7b1fe1b
```


## Esecuzione da sorgente

> *Nota: per l'utilizzo del progetto è consigliato avere docker (consultare [https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/)) installato sul proprio pc.*

Steps:

1. Clonare il repository da [https://github.com/leomanne/P2P_Project](https://github.com/leomanne/P2P_Project) o da [https://github.com/skiby7/BingoEth](https://github.com/skiby7/BingoEth) (il secondo repository è il mirror del primo) o scompattare l'archivio BingoEth.zip
2. Aprire il terminale/powershell e spostarsi dentro la directory del progetto
3. Eseguire il comando `docker compose up`

Eseguiti i passi indicati, inizierà il processo di build del container docker. Dopodiché si avvierà il container che compilerà il contratto, per poi avviare l'applicazione **BingoEth**.
Una volta terminato il processo di build, sarà possibile accedere all'applicazione tramite browser all'url [http://localhost:80](http://localhost:80).

Gli account configurati su ganache, esposto all'url [https://chain.alteregofiere.com](https://chain.alteregofiere.com) sono i medesimi indicati nella sezione precedente
