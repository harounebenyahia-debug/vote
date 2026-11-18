const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  const signers = await ethers.getSigners();
  const now = Math.floor(Date.now() / 1000);
  const Vote = await ethers.getContractFactory("Vote");
  // Vote ouvert maintenant, pendant 7 jours
  const vote = await Vote.deploy("Election du delegue", ["Alice", "Bob", "Chaima"], now - 60, now + 7 * 24 * 3600);
  await vote.waitForDeployment();
  const addr = await vote.getAddress();
  // Autorise les 5 premiers comptes de test (le compte 0 est l'organisateur)
  await (await vote.autoriser(signers.slice(0, 5).map((s) => s.address))).wait();
  console.log("Vote deploye a :", addr);

  const artifact = JSON.parse(fs.readFileSync("artifacts/contracts/Vote.sol/Vote.json"));
  fs.writeFileSync(
    "frontend/config.js",
    `window.VOTE_CONFIG = ${JSON.stringify({ address: addr, abi: artifact.abi })};`
  );
  console.log("frontend/config.js ecrit.");
}

main().catch((e) => { console.error(e); process.exit(1); });
