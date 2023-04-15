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

### Remark

Addresses already deployed on the sepolia：

CPAMM https://sepolia.etherscan.io/address/0x2e5ef464bbdccddad5c927e0fc507ed3e329035e#code

CurveAMM https://sepolia.etherscan.io/address/0xdbf6c2c44556a30a0b427db1f69f1a08b1a43fb4#code

ALPHA token (ALPHA) https://sepolia.etherscan.io/address/0x0dbab031db3c3f33b241fdd721c483e3807d40b3#code

BETA coin (BETA) https://sepolia.etherscan.io/address/0xf5d0306e60066f04a524795d6c63f39d4fcb8b31#code

CurveAMM.sol 's curve formula refers to https://github.com/mrWojackETH/StableSwapAMM/blob/main/contracts/StableSwap.sol
