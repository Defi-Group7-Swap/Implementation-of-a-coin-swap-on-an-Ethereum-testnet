const { network, ethers } = require("hardhat");
const { verify } = require("../utils/verify");
// var token1Address, token2Address;
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts(); /* Token 1*/

  const token1_name = "ALPHA token";
  const token1_symbol = "ALPHA";
  const token1_initialSupply = 1100;

  const args1 = [
    token1_name,
    token1_symbol,
    ethers.utils.parseEther(token1_initialSupply.toString()),
  ]; /* Token 1*/

  const token2_name = "BETA coin";
  const token2_symbol = "BETA";
  const token2_initialSupply = 900;

  const args2 = [
    token2_name,
    token2_symbol,
    ethers.utils.parseEther(token2_initialSupply.toString()),
  ]; /* Token 2*/

  const token1 = await deploy("MyToken", {
    from: deployer,
    args: args1,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  const token2 = await deploy("MyToken", {
    from: deployer,
    args: args2,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  console.log("token1's address:", token1.address);
  console.log("token2's address:", token2.address);

  const args3 = [token1.address, token2.address];

  const CurveAMM = await deploy("CurveAMM", {
    from: deployer,
    args: args3,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  console.log("CurveAMM's address:", CurveAMM.address);

  const CPAMM = await deploy("CPAMM", {
    from: deployer,
    args: args3,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  console.log("CPAMM's address:", CPAMM.address);

  // Verify the deployment
  const developmentChains = ["hardhat", "localhost"];

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verification started...");
    log("Verifying MyToken1...");
    await verify(token1.address, args1);

    log("Verifying MyToken1...");
    await verify(token2.address, args2);

    log("Verifying CPAMM...");
    await verify(CPAMM.address, args3);

    log("Verifying CurveAMM...");

    await verify(CurveAMM.address, args3);

    log(`Verifying Finished!`);
    log("----------------------------------------------------");
  }

  const token1Contract = await ethers.getContractAt(
    "MyToken",
    token1.address,
    deployer
  );
  const token2Contract = await ethers.getContractAt(
    "MyToken",
    token2.address,
    deployer
  );
  const curveAMMContract = await ethers.getContract("CurveAMM", deployer);
  const cpammContract = await ethers.getContract("CPAMM", deployer);

  await token1Contract.approve(
    cpammContract.address,
    ethers.utils.parseEther("600")
  );

  await token2Contract.approve(
    cpammContract.address,
    ethers.utils.parseEther("400")
  );
  await token1Contract.approve(
    curveAMMContract.address,
    ethers.utils.parseEther("500")
  );

  await token2Contract.approve(
    curveAMMContract.address,
    ethers.utils.parseEther("500")
  );
  await cpammContract.addLiquidity(
    ethers.utils.parseEther("600"),
    ethers.utils.parseEther("400")
  );
  await curveAMMContract.addLiquidity(
    ethers.utils.parseEther("500"),
    ethers.utils.parseEther("500")
  );

  module.exports.token1Address = token1.address;
  module.exports.token2Address = token2.address;
};

module.exports.tags = ["all", "deploy"];
