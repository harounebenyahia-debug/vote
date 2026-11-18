require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    localhost: { url: "http://127.0.0.1:8545" },
    // Pour Sepolia, décommenter et définir SEPOLIA_RPC et PRIVATE_KEY :
    // sepolia: { url: process.env.SEPOLIA_RPC, accounts: [process.env.PRIVATE_KEY] },
  },
};
