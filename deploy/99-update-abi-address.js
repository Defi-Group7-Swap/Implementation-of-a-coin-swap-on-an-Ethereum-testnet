const { ethers, network } = require("hardhat");
const address = require("./01-deploy-CAMM");
const fs = require("fs");

const ADDRESSES_FILE = "./constants/ContractAddress.json";
const ABI_FILE = "./constants/ContractABI.json";

module.exports = async function () {
  console.log("Updating abi and address...");
  updateContractAddress();
  updateAbi();
};
async function updateAbi() {
  const MyToken = await ethers.getContract("MyToken");
  const Curve = await ethers.getContract("CurveAMM");
  const CPAMM = await ethers.getContract("CPAMM");
  const CPAMMname = "CPAMMABI";
  const CurveName = "CurveABI";
  const TokenName = "MyTokenABI";
  const CurrentABI = JSON.parse(fs.readFileSync(ABI_FILE, "utf8"));

  CurrentABI[CurveName] = [
    Curve.interface.format(ethers.utils.FormatTypes.json),
  ];

  CurrentABI[CPAMMname] = [
    CPAMM.interface.format(ethers.utils.FormatTypes.json),
  ];

  CurrentABI[TokenName] = [
    MyToken.interface.format(ethers.utils.FormatTypes.json),
  ];

  fs.writeFileSync(
    ABI_FILE,
    JSON.stringify(CurrentABI)
      .replace(/":"/g, '":')
      .replace(/\\/g, "")
      .replace(/]\"/g, "]")
      .replace(/\["\[/g, "[[")
  );
}

async function updateContractAddress() {
  const Curve = await ethers.getContract("CurveAMM");
  const CPAMM = await ethers.getContract("CPAMM");
  const CPAMMname = "CPAMM";
  const CurveName = "Curve";
  const Token1Name = "MyToken1";
  const Token2Name = "MyToken2";
  const currentAddresses = JSON.parse(fs.readFileSync(ADDRESSES_FILE, "utf8"));
  // 31337: address
  currentAddresses[CurveName] = Curve.address;
  currentAddresses[CPAMMname] = CPAMM.address;
  currentAddresses[Token1Name] = address.token1Address;
  currentAddresses[Token2Name] = address.token2Address;

  fs.writeFileSync(ADDRESSES_FILE, JSON.stringify(currentAddresses));
}

module.exports.tags = ["all", "update", "deploy"];
