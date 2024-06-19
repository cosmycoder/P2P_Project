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

L'applicazione sviluppata come progetto finale del corso di Peer To Peer & Blockchains si chiama BingoEth e si tratta di un'implementazione del bingo (la versione più famosa del bingo, quella americana da 75 numeri) realizzata in React/javascript per la parte di front-end e in Solidity per la parte di smart contract. È possibile consultare il repository su [GitHub](https://github.com/leomanne/P2P_Project.git "leggi").

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
.1 Dockerfile/docker-compose.yml $\rightarrow$ \small{Container docker per il test e il deploy}.
}

# Funzionamento del progetto

## Lato front-end

Il front-end dell'applicazione BingoEth è sviluppato in React e consente agli utenti di interagire con il contratto smart su Ethereum per giocare a bingo. Le principali funzionalità del front-end includono:

- Creazione di una nuova partita scegliendo il numero massimo di giocatori e la cifra da scommettere.
- Partecipazione a una partita esistente facendo una join accettando o meno la cifra da scommettere.
- Visualizzazione dello stato del gioco in tempo reale.

![Home page](./immagini/homepage.png){ width=50% }

Appena entrati nella nostra Dapp vedremo una schermata di home (Figura 1), vediamo subito che possiamo fare due cose principali:

- unirci ad una partita casuale o specifica.
- creare una nuova partita.

### Creazione Game

![Creazione della stanza di gioco](./immagini/creazionegame.png){ width=50% }

Per creare la stanza (Figura 2) è necessario inserire il numero massimo di giocatori e l'importo della scommessa per partecipare. Questi due valori abbiamo deciso debbano essere (per semplicita) interi,  Una volta inseriti i dati il pulsante `Scommetti` si abiliterà e, premendolo, verrà chiamata la funzione del contratto `creategame` di cui parleremo nel prossimo capitolo.


Solo dopo aver premuto il pulsante scommetti ci verra mostrata la schermata di attesa (Figura 3), in cui attenderemo di aver raggiunto il numero totale di utenti che abbiamo scelto precedentemente.

![Attesa dell'unione di altri player](./immagini/attesaCreator.png){ width=50% }


### Join delle stanze

Per eseguire i join delle stanze abbiamo due opzioni:

- scegliere una stanza random
- scegliere una stanza specifica, sapendo l'ID della stanza


Se cliccato il pulsante `Entra in una stanza` ci si aprira una schermata (Figura 4) in cui dobbiamo obbligatoriamente inserire un ID per selezionare la camera.


![Pagina di raccolta informazioni sui game](./immagini/selezionacamera.png){ width=50% }



Se l'ID selezionato risulta essere corretto e ci sono ancora posti disponibili allora apparira la schermata contenente (Figura 5):

- ID della stanza scelta
- Gli Eth da scommettere per poter unirsi alla camera
- Il numero di posti disponibili

![Pagina di scelta per la camera](./immagini/Fetchinfo.png){ width=50% }


A questo punto se viene cliccato il pulsante `Entra nella stanza` L'ETH scommesso verra prelevato e il numero dei giocatori verra aggiornato attraverso la chiamata di funzione del contratto `JoinGame` di cui parleremo nel prossimo capitolo.

Per il pulsante `Entra nella stanza randomica` invece la schermata rimane simile, viene solo rimosso il valore da inserire e viene chiesto solo di cliccare un pulsante per richiedere le informazioni per una stanza ancora disponibile casuale. La schermata di scelta per la camera rimane uguale invece (Figura 5).

### Fase di gioco

Una volta che tutti i giocatori sono entrati si avvia la partita e tutti i giocatori creano la propria tabella (parleremo meglio di questo argomento nel capitolo sulla sicurezza).

#### Lato Creatore della stanza


Come detto in precedenza solo il creatore delle stanze si prende carico della responsabilita di chiedere l'estrazione dei numeri al contratto. E come tale e' in una posizione di comando rispetto agli altri joiners. Vediamo la schermata di gioco (Figura 6):

![Schermata di gioco del creatore](./immagini/TabellaCreator.png){ width=50% }

Come si vede dall'immagine (Figura 6) abbiamo:

- La lista dei valori estratti da 1 a 75.
- la tabella contenente i numeri scelti CASUALMENTE lato client. abbiamo rimosso la possibilita di scelta dei numeri per evitare possibili problemi di imbrogli dai giocatori. Sara cura dei giocatori selezionare la casella corretta, come nel vero gioco.
- Un pulsante per estrarre i numeri, chiamando la funzione `ExtractNumber` del contratto.
- Un pulsante per fare submit della cartella quando si ha fatto bingo. Il pulsante rimane disabilitato fino a che non si ha selezionato almeno 5 caselle in fila per fare bingo.

#### Lato Joiner della stanza

![Schermata di gioco per i joiner](./immagini/TabellaJoiner.png){ width=50% }

Dato che solo il creatore del gioco può estrarre i numeri, abbiamo dato ai joiner della stanza la possibilità di denunciarlo se cerca di bloccare il gioco per far allontanare i giocatori. Per questo motivo, è stato aggiunto un pulsante `Denuncia`. Se premuto, questo pulsante rimuove il creatore dalla partita dopo un certo numero di secondi, terminando il gioco.

Altre possibili implementazioni avrebbero potuto includere una logica che trasformava chi denunciava nel nuovo creatore. Tuttavia, abbiamo optato per una soluzione più semplice. Se la denuncia viene confermata, il creatore dovrà estrarre un numero entro un certo limite di tempo. Se lo fa, il gioco prosegue normalmente; altrimenti, tutti i giocatori riceveranno indietro il proprio denaro, insieme a una percentuale dei soldi scommessi dal creatore del gioco.


![Schermata di denuncia per i joiner](./immagini/DenunciaJoiner.png){ width=50% }

## Lato smart contract

Lo smart contract è scritto in Solidity e gestisce la logica del gioco, inclusa la gestione dei numeri estratti, la verifica delle cartelle dei giocatori e la distribuzione dei premi. Il contratto include le seguenti funzionalità:

- Creazione di una nuova partita e gestione dell'unione dei players alle partite.
- Gestione dei numeri estratti per ogni partita.
- Verifica delle vincite.
- Distribuzione dei premi.

Sotto vediamo i codici per queste funzionalita:

### Funzione `createGame`

La funzione `createGame viene chiamata per avviare una nuova partita. Verifica i parametri di input come il numero massimo di giocatori consentiti e l'ammontare della scommessa. Successivamente, genera un ID univoco per la partita e inizializza un nuovo oggetto di gioco nella lista. Vengono impostati vari parametri, tra cui il creatore della partita, l'ammontare della scommessa, il merkle root delle carte del creatore, eccetera. Infine, aggiunge la partita alla lista dei giochi disponibili e emette un evento per segnalare la creazione della partita.

```java
function createGame(uint _maxJoiners, uint _betAmount, bytes32 _cardMerkleRoot)
public payable {
    // Requisiti di input
    require(_maxJoiners > 0, "Max joiners must be greater than 0");
    require(_betAmount > 0, "Bet amount must be greater than 0");
    require(msg.sender.balance/1 ether >= _betAmount,
        "Cannot bet more than you can afford!");
    require(msg.value == _betAmount*1 ether,
        "Please send exactly the amount you want to bet!");

    // Generazione dell'ID del gioco
    int256 gameId = getGameId();

    // Creazione di una nuova istanza di gioco
    Info storage newGame = gameList[gameId];

    // Inizializzazione dei parametri del gioco
    newGame.creator = msg.sender;
    newGame.joiners = new address ;
    newGame.maxJoiners = _maxJoiners;
    newGame.totalJoiners = 0;
    newGame.ethBalance = 0;
    newGame.betAmount = _betAmount;
    newGame.creatorMerkleRoot = _cardMerkleRoot;
    newGame.accusationTime = 0;
    newGame.accuser = address(0);

    // Inizializzazione del mapping per il merkle root del creatore
    newGame.joinerMerkleRoots[msg.sender] = 0;

    // Aggiunta del gioco alla lista dei giochi disponibili
    elencoGiochiDisponibili.push(gameId);

    // Aggiunta del valore del betAmount all'ethBalance del gioco
    newGame.ethBalance += _betAmount;

    // Emit dell'evento GameCreated
    emit GameCreated(
        gameId,
        newGame.maxJoiners,
        newGame.totalJoiners
    );
}
```

### Funzione `extractNumber`

La funzione `extractNumber` gestisce l'estrazione dei numeri nel gioco. Verifica se tutti i 75 numeri consentiti sono stati estratti. Genera un nuovo numero utilizzando una funzione per generare numeri casuali e controlla se è già stato estratto. Se il numero è un duplicato, ne genera uno nuovo fino a trovare un numero unico. Aggiunge quindi il numero estratto alla lista dei numeri estratti per il gioco corrispondente. Se viene specificato, resetta l'accusa e l'accusatore nel gioco. Infine, emette eventi per informare sul numero estratto o segnalare la fine del gioco se tutti i numeri sono stati estratti.

```java
function extractNumber(int256 _gameId,bool accused) public {
    // Controlla se tutti i numeri sono stati estratti
    require(gameList[_gameId].numbersExtracted.length <= 75,
        "All numbers have been extracted!");

    // Genera un nuovo numero per il gioco
    uint8 newNumber = getNewNumber(_gameId);
    int8 i = 1;

    // Controlla se il numero è già stato estratto,
        in tal caso genera un nuovo numero
    while (isExtracted(gameList[_gameId].numbersExtracted, newNumber)) {
        newNumber = getNewNumber(_gameId+i);
        i++;
    }

    // Aggiunge il nuovo numero alla lista dei numeri estratti per il gioco
    gameList[_gameId].numbersExtracted.push(newNumber);

    // Reset dell'accusa se il parametro accused è true
    if(accused){
        gameList[_gameId].accusationTime = 0;
        gameList[_gameId].accuser = address(0);
    }

    // Controlla se tutti i numeri sono stati estratti e emette eventi di conseguenza
    if(gameList[_gameId].numbersExtracted.length < 75){
        emit NumberExtracted(_gameId, newNumber, false);
    }else{
        emit GameEnded(_gameId, gameList[_gameId].creator,
            gameList[_gameId].ethBalance, WinningReasons.BINGO);
    }
}
```

# Principali decisioni

## Struttura dati

Per salvare tutte le informazioni sui dati riguardanti un game abbiamo scelto di optare per una struct, sotto il codice:

```java
struct Info {
        address creator;
        address[] joiners;
        uint maxJoiners;
        uint totalJoiners;
        uint ethBalance;
        uint betAmount;
        bytes32 creatorMerkleRoot;
        mapping(address => bytes32) joinerMerkleRoots;
        uint8[] numbersExtracted;
        uint accusationTime;
        address accuser;
    }
```

Qui possiamo vedere che ci salviamo l'address del creatore del game e di tutti i joiners, oltre che alle ovvie informazioni sul game come il tetto massimo di giocatori e il valore da scommettere in ethereum. Ci salviamo inoltre anche il MerkleRoot del creatore e di tutti i joiners attraverso un mapping.
Le ultime variabili sono utilizzate rispettivamente per il controllo sui numeri estratti e sull'accusa dei giocatori per il creatore del game che ha la responsabilita di estrarre i numeri del bingo.

## Vincoli

I seguenti vincoli sono stati implementati per garantire il corretto funzionamento del gioco:

- **Numero delle caselle**: Il numero delle caselle e' stato settato seguendo le regole base del bingo americano e quindi a 25 caselle totali.
- **La casella centrale**: La casella centrale e' una casella jolly e quindi valida di base.
- **Il creatore**: Il creatore si assume il ruolo di chiedere al contratto di estrarre i numeri.
- **Limite scommesse**:  I giocatori non possono scommettere piu di 1000 ETH.

## Uso di Merkle Tree

Abbiamo deciso di utilizzare un Merkle Tree per garantire l'integrità dei dati dei giocatori senza rivelare le informazioni sensibili durante la verifica delle vincite. Questo approccio consente una verifica efficiente e sicura delle cartelle di bingo.


### Generazione del Merkle Tree

Il codice per la generazione del Merkle Tree si trova nella funzione `generateMerkleTree`.

**Funzionalità:**
- La funzione prende in input una tabella (`table`), rappresentata come un array.
- Ogni elemento della tabella viene convertito in un hash utilizzando `utils.soliditySha3`.
- Gli hash risultanti costituiscono il livello delle foglie (`leaves`) del Merkle Tree.
- Viene quindi calcolato il Merkle Tree iterativamente, concatenando e hashando le coppie di nodi fino a raggiungere la radice del Merkle Tree.

```javascript
export function generateMerkleTree(table) {
    console.log(table);
    let merkleTree = [];

    // Calc the leaves' hashes + salt
    let tmp = [];
    for (const element of table) {
        tmp.push(utils.soliditySha3(element.toString()));
    }
    merkleTree.push(tmp);

    // Now lets calc the merkle tree
    while (tmp.length > 1) {
        const nextLevel = [];
        for (let j = 0; j < tmp.length; j += 2) {
            if (tmp[j + 1]) {
                nextLevel.push(utils.soliditySha3((tmp[j] + tmp[j + 1].slice(2))));
            } else {
                nextLevel.push(utils.soliditySha3((tmp[j] + tmp[j].slice(2)))); // if the level has an odd number of elements, doubles the last element
            }
        }
        tmp = nextLevel;
        merkleTree.push(nextLevel);
    }
    return merkleTree;
}
```


### Generazione  delle Merkle Proofs

Il codice per la generazione delle Merkle Proofs si trova nella funzione `generateMerkleProof`.

**Funzionamento:**
- La funzione prende in input una carta (`card`) e un array di risultati (`result`).
- Viene generato il Merkle Tree utilizzando la funzione `generateMerkleTree`.
- Per ogni elemento nella carta con risultato valido, viene generata una proof.
- La proof contiene gli hash dei nodi lungo il percorso dal nodo foglia alla radice del Merkle Tree.
- Le proofs vengono poi verificate utilizzando la funzione `verifyMerkleProof`.

```javascript
export const generateMerkleProof = (card, result) => {
    const proofs = [];
    const merkleTree = generateMerkleTree(card);
    console.log(merkleTree);
    const leaves = merkleTree[0];
    for (let i = 0; i < result.length; i++) {
        if (!result[i]) {
            continue;
        }
        const elementHash = utils.soliditySha3(card[i].toString());
        const index = leaves.indexOf(elementHash);

        let proof = [];
        let currentIndex = index;

        proof.push(stringToBytes32(card[i].toString()));
        proof.push(stringToBytes32(i.toString()));

        for (let level = 0; level < merkleTree.length - 1; level++) {
            const currentLevel = merkleTree[level];
            const isRightNode = currentIndex % 2 === 1;
            const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;

            if (siblingIndex < currentLevel.length) {
                proof.push(`${currentLevel[siblingIndex]}`);
            }

            currentIndex = Math.floor(currentIndex / 2);
        }
        if (index > 15) {
            let last = proof.pop();
            proof.push(`${merkleTree[merkleTree.length - 3][merkleTree[merkleTree.length - 3].length - 1]}`);
            proof.push(last);
        }
        proofs.push(proof);
    }
    console.log(`MERKLE PROOF IS VALID: ${proofs.every(element => verifyMerkleProof(bytes32ToString(element[0]), bytes32ToString(element[1]),  merkleTree[merkleTree.length - 1][0], element.slice(2)))}`);
    return proofs;
};
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

Gli account verranno configurati su un'istanza di ganache locale (`127.0.0.1:7545`).

# Valutazione del consumo di gas

- Il deploy del progetto si consuma una quantita di gas pari a 3653200 Gas
- La funzione CreateGame si consuma 179890 Gas
- La funzione JoinGame consuma 131088 Gas
- La sola funzione accuse consuma 67810 Gas
- La sola funzione di CheckAccuse consuma ~ 1300+(2500×n) Gas dove n = numero di joiners
- L'estrazione di un numero ~ 70705 Gas * un massimo di 75 numeri = massimo 5302875 Gas
- L'estrazione delle informazioni su un game ~ 36536 Gas
- Stima per la sottomissione di una board con SubmitBoard ~ 40181 Gas

## Valutazione di esempio con un gioco con un creatore e 3 joiners

Ipotiziamo che ci siano stati 37 numeri per aver raggiunto il termine del gioco e che ci siano state 6 accuse (ovviamente non andate a buon fine). Calcoliamo il costo complessivo:

Per calcolare il costo complessivo del consumo di gas considerando le operazioni specificate, ipotizziamo i seguenti dati:

- **Creatore del gioco**: 1
- **Joiners**: 3
- **Numeri estratti**: 37
- **Accuse**: 6

### Calcolo del consumo di gas:

1. **Deploy del progetto**: 3653200 gas

2. **Creazione di un gioco**:
   - 179890 gas

3. **JoinGame** per 3 joiners:
   - 131088 * 3 = 393264 gas

4. **Accuse** per 6 accuse:
   - 67810 * 6 = 406860 gas

5. **CheckAccuse** per 6 accuse e 3 joiners:
   - Ogni chiamata a `CheckAccuse` con 3 joiners:
     - 1300 + (2500 * 3) = 1300 + 7500 = 8800 gas
   - 8800 * 6 = 52800 gas

6. **Estrazione di numeri**:
   - Numero massimo di estrazioni: 37
   - 70705 * 37 = 2616085 gas

7. **Estrazione delle informazioni su un gioco**:
   - 36536 gas (assumiamo 1 chiamata)

8. **Sottomissione della board con SubmitBoard**:
   - 40181 gas (al caso pessimo)

### Totale del consumo di gas:

Gas totale = 3653200 + 179890 + 393264 + 406860 + 52800 + 2616085 + 36536 + 40181

### Calcolo:

Gas totale = 7949016 + 52800 + 2616085 + 36536 + 40181
Gas totale = 7949016 + 2716902 + 40181
Gas totale = 10656099 + 40181
Gas totale = 10696280 gas

Quindi, il costo complessivo del consumo di gas per le operazioni descritte, considerando un creatore del gioco e 3 joiners, con 37 numeri estratti e 6 accuse, è di circa 10,696,280 gas.


# Potenziali vulnerabilità

## Generazione di numeri casuali


## Limitazioni del gas


# Conclusioni



