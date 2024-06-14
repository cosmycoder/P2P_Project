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
\hypersetup{linkcolor=black}

\pagebreak
\renewcommand{\contentsname}{Indice}
\tableofcontents
\pagebreak
\pagenumbering{arabic}
\setcounter{page}{1}

# Introduzione

L'applicazione sviluppata come progetto finale del corso di Peer To Peer & Blockchains si chiama BingoEth e si tratta di un'implementazione del bingo 75 (la versione americana del bingo) realizzata in React/javascript per la parte di front-end e in Solidity per la parte di smart contract.

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
