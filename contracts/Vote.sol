// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Vote - Système de vote électronique transparent
/// @notice Un scrutin avec liste blanche, période de vote et un seul vote par adresse.
contract Vote {
    address public owner;
    string public titre;
    uint256 public debut;
    uint256 public fin;

    string[] private candidats;
    mapping(uint256 => uint256) public voix;          // candidatId => nombre de voix
    mapping(address => bool) public estAutorise;      // liste blanche
    mapping(address => bool) public hasVoted;         // a déjà voté

    event VoteEmis(address indexed votant, uint256 candidateId);
    event VotantAutorise(address indexed votant);

    modifier onlyOwner() {
        require(msg.sender == owner, "Reserve a l'organisateur");
        _;
    }

    constructor(
        string memory _titre,
        string[] memory _candidats,
        uint256 _debut,
        uint256 _fin
    ) {
        require(_candidats.length >= 2, "Au moins 2 candidats");
        require(_fin > _debut, "Periode invalide");
        owner = msg.sender;
        titre = _titre;
        candidats = _candidats;
        debut = _debut;
        fin = _fin;
    }

    /// @notice Ajoute des adresses à la liste blanche (organisateur uniquement).
    function autoriser(address[] calldata votants) external onlyOwner {
        for (uint256 i = 0; i < votants.length; i++) {
            estAutorise[votants[i]] = true;
            emit VotantAutorise(votants[i]);
        }
    }

    /// @notice Vote pour un candidat.
    function voter(uint256 candidateId) external {
        require(block.timestamp >= debut, "Vote pas encore ouvert");
        require(block.timestamp <= fin, "Vote termine");
        require(estAutorise[msg.sender], "Adresse non autorisee");
        require(!hasVoted[msg.sender], "Deja vote");
        require(candidateId < candidats.length, "Candidat inexistant");

        hasVoted[msg.sender] = true;
        voix[candidateId] += 1; // Solidity 0.8 : protection contre l'overflow
        emit VoteEmis(msg.sender, candidateId);
    }

    function nombreCandidats() external view returns (uint256) {
        return candidats.length;
    }

    function getCandidat(uint256 id) external view returns (string memory) {
        require(id < candidats.length, "Candidat inexistant");
        return candidats[id];
    }

    function getResultats() external view returns (string[] memory noms, uint256[] memory totaux) {
        noms = candidats;
        totaux = new uint256[](candidats.length);
        for (uint256 i = 0; i < candidats.length; i++) {
            totaux[i] = voix[i];
        }
    }
}
