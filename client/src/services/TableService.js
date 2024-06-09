import { keccak256 } from 'js-sha3';

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


export function generateCard() {
    let numbers = [];
    let occurrences = {};
    let number = 0;
    const FIRST_COL   = [0, 5, 10, 14, 19];
    const SECOND_COL  = [1, 6, 11, 15, 20];
    const THIRD_COL   = [2, 7, 16, 21];
    const FOURTH_COL  = [3, 8, 12, 17, 22];
    const FIFTH_COL   = [4, 9, 13, 18, 23];
    let min, max;
    for (let i = 0; i < 24; i++) {
        if (FIRST_COL.includes(i)) {
            min = 1;
            max = 15;
        } else if (SECOND_COL.includes(i)) {
            min = 16;
            max = 30;
        } else if (THIRD_COL.includes(i)) {
            min = 31;
            max = 45;
        } else if (FOURTH_COL.includes(i)) {
            min = 46;
            max = 60;
        } else if (FIFTH_COL.includes(i)) {
            min = 61;
            max = 75;
        }
        number = getRandom(min, max);
        while (occurrences[number]) {
            number = getRandom(min, max);
        }
        occurrences[number] = true;
        numbers.push(number);
    }
    return numbers;
}

export function getMatrix(table) {
    let matrix = [];
    let row;
    for (let i = 0, j = 0; i < table.length; i++) {
        if (j === 0 || j % 5 === 0) {
            if (j && j % 5 === 0) matrix.push(row);
            row = [];
        }
        if (i === 12) {
            row.push("🆓");
            j++;
        }
        row.push(table[i]);

        j++;
    }
    matrix.push(row);
    return matrix;
}

export function generateMerkleTree(table) {
    console.log(table)
    let merkleTree = [];

    // Calc the leaves' hashes + salt
    let tmp = [];
    for (const element of table) {
        // tmp.push(keccak256((element.toString() + Math.floor(Math.random() * 10)).toString()));
        tmp.push(keccak256(element.toString()).toString());
    }
    merkleTree.push(tmp);

    // Now lets calc the merkle tree
    while (tmp.length > 1) {
        const nextLevel = [];
        for (let j = 0; j < tmp.length; j += 2) {
            if (tmp[j + 1])
                nextLevel.push(keccak256((tmp[j] + tmp[j + 1])));
            else
                nextLevel.push(keccak256((tmp[j] + tmp[j]))); // if the level has an odd number of elements, doubles the last element
        }
        tmp = nextLevel;
        merkleTree.push(nextLevel);
    }
    return merkleTree;
}

export const generateMerkleProof = (card, result, contract) => {
    console.log(card)
    console.log(result)
    const proofs = []
    const merkleTree = generateMerkleTree(card);
    console.log(merkleTree)
    const leaves = merkleTree[0];
    for (let i = 0; i < result.length; i++) {
        if (!result[i]) {
            continue;
        }
        const elementHash = keccak256(card[i].toString()).toString('hex');
        const index = leaves.indexOf(elementHash);

        // if (index === -1) {
        //     throw new Error('Element not found in the table');
        // }

        let proof = [];
        let currentIndex = index;
        proof.push(card[i].toString());
        proof.push(i.toString());

        for (let level = 0; level < merkleTree.length - 1; level++) {
            const currentLevel = merkleTree[level];
            const isRightNode = currentIndex % 2 === 1;
            const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;

            if (siblingIndex < currentLevel.length) {
                proof.push(currentLevel[siblingIndex]);
            }

            currentIndex = Math.floor(currentIndex / 2);
        }
        if (index > 15) {
            let last = proof.pop()
            proof.push(merkleTree[merkleTree.length - 3][merkleTree[merkleTree.length - 3].length - 1])
            proof.push(last)
        }
        proofs.push(proof);
    }
    console.log(`MERKLE PROOF IS VALID: ${proofs.every(element => verifyMerkleProof(element[0], element[1],  merkleTree[merkleTree.length - 1][0], element.slice(2)))}`);
    return proofs;
    // console.log(proofs)
    // for (let p of proofs) {
    //     console.log(`Verify ${p[0]} - ${p.slice(2)} - ${merkleTree[merkleTree.length - 1][0]} ` + verifyMerkleProof(p[0], p[1],  merkleTree[merkleTree.length - 1][0], p.slice(2)));
    // }
}

function verifyMerkleProof(element, index, root, proof) {
    let hash = keccak256(element.toString()).toString('hex');
    for (const element of proof) {
        if (index % 2 === 0) {
            hash = keccak256(hash + element).toString('hex');
        } else {
            hash = keccak256(element + hash).toString('hex');
        }

        // Move to the parent node
        index = Math.floor(index / 2);
    }
    return hash === root;
}
