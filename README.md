# Vote électronique transparent (Proposition 2)

Application de vote pour l'élection d'un délégué : liste blanche d'adresses, période de vote, un seul vote par adresse, résultats publics en temps réel.

## Architecture

```
 Organisateur (owner)            Votant
        |                          |
        | autoriser([...])         | voter(id)
        v                          v
   +-------------------  MetaMask  -------------------+
   |            Front-end (HTML + ethers.js)           |
   +---------------------------+-----------------------+
                               |
                               v
                  Smart Contract Vote.sol
        (owner, titre, debut, fin, candidats,
         estAutorise, hasVoted, voix, VoteEmis)
                               |
                         Blockchain (Hardhat local / Sepolia)
```

## Smart contract (Vote.sol)
- `constructor(titre, candidats, debut, fin)` : crée le scrutin (min. 2 candidats, fin > début).
- `autoriser(address[])` : liste blanche, réservé à l'owner (`onlyOwner`).
- `voter(candidateId)` : `require` sur période (`block.timestamp`), éligibilité, double vote, candidat valide.
- `getResultats()` : noms + voix. `event VoteEmis(address indexed votant, uint candidateId)` à chaque vote.
- Solidity 0.8 : protection native contre l'overflow.

## Lancer le projet
```
npm install
npx hardhat test            # 10 tests unitaires
npx hardhat node            # terminal 1 : blockchain locale
npm run deploy              # terminal 2 : déploie + écrit frontend/config.js
cd frontend && npx serve .  # ouvre http://localhost:3000
```
Dans MetaMask : ajouter le réseau `http://127.0.0.1:8545` (chain id 31337) et importer une clé de compte de test affichée par `hardhat node`. Les 5 premiers comptes sont autorisés.

Pour Sepolia : décommenter `sepolia` dans `hardhat.config.js`, définir `SEPOLIA_RPC` et `PRIVATE_KEY`, puis `npx hardhat run scripts/deploy.js --network sepolia`.


