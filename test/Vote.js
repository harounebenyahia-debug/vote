const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Vote", function () {
  let vote, owner, a, b, c, debut, fin;

  beforeEach(async () => {
    [owner, a, b, c] = await ethers.getSigners();
    const now = await time.latest();
    debut = now + 100;
    fin = now + 1000;
    const Vote = await ethers.getContractFactory("Vote");
    vote = await Vote.deploy("Delegue 2026", ["Alice", "Bob"], debut, fin);
    await vote.autoriser([a.address, b.address]);
  });

  it("initialise le scrutin", async () => {
    expect(await vote.titre()).to.equal("Delegue 2026");
    expect(await vote.nombreCandidats()).to.equal(2);
    expect(await vote.owner()).to.equal(owner.address);
  });

  it("refuse un deploiement avec moins de 2 candidats", async () => {
    const V = await ethers.getContractFactory("Vote");
    await expect(V.deploy("x", ["Seul"], debut, fin)).to.be.revertedWith("Au moins 2 candidats");
  });

  it("seul l'owner peut autoriser", async () => {
    await expect(vote.connect(a).autoriser([c.address])).to.be.revertedWith("Reserve a l'organisateur");
  });

  it("refuse de voter avant l'ouverture", async () => {
    await expect(vote.connect(a).voter(0)).to.be.revertedWith("Vote pas encore ouvert");
  });

  it("accepte un vote valide et emet l'evenement", async () => {
    await time.increaseTo(debut + 1);
    await expect(vote.connect(a).voter(1)).to.emit(vote, "VoteEmis").withArgs(a.address, 1);
    expect(await vote.voix(1)).to.equal(1);
    expect(await vote.hasVoted(a.address)).to.equal(true);
  });

  it("refuse le double vote", async () => {
    await time.increaseTo(debut + 1);
    await vote.connect(a).voter(0);
    await expect(vote.connect(a).voter(0)).to.be.revertedWith("Deja vote");
  });

  it("refuse une adresse non autorisee", async () => {
    await time.increaseTo(debut + 1);
    await expect(vote.connect(c).voter(0)).to.be.revertedWith("Adresse non autorisee");
  });

  it("refuse un candidat inexistant", async () => {
    await time.increaseTo(debut + 1);
    await expect(vote.connect(a).voter(5)).to.be.revertedWith("Candidat inexistant");
  });

  it("refuse de voter apres la fin", async () => {
    await time.increaseTo(fin + 1);
    await expect(vote.connect(a).voter(0)).to.be.revertedWith("Vote termine");
  });

  it("retourne les resultats", async () => {
    await time.increaseTo(debut + 1);
    await vote.connect(a).voter(0);
    await vote.connect(b).voter(0);
    const [noms, totaux] = await vote.getResultats();
    expect(noms).to.deep.equal(["Alice", "Bob"]);
    expect(totaux.map(Number)).to.deep.equal([2, 0]);
  });
});
