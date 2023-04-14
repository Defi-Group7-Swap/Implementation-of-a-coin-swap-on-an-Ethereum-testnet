# Implementation-of-a-coin-swap-on-an-Ethereum-testnet

## Environment Configuration:

Install yarn:

```
npm install -g yarn
```

Install hardhat:

```
yarn add hardhat
```

Install dependencies:

```
yarn add --dev @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers @nomiclabs/hardhat-etherscan @nomiclabs/hardhat-waffle chai ethereum-waffle hardhat hardhat-contract-sizer hardhat-deploy hardhat-gas-reporter prettier prettier-plugin-solidity solhint solidity-coverage dotenv
```

Fix bug:

```
yarn add ethers@5.7.2
```

## Instructions:

### 1. To deploy on the local network

first enter the command

```
yarn hardhat node
```

in the command line, and then deploy the project files on the local LAN server.

Next, connect Metamask to the local network, import the private key of the hardhat account into Metamask, and open it through the browser.

### 2. To deploy on the test net

first fill in your private key, node key, and Etherscan API key in the `.env` file; then enter the command

```
yarn hardhat deploy --network sepolia
```

in the command line, and deploy the project files on any server. Finally, connect Metamask to the sepolia network and open it through the browser.
