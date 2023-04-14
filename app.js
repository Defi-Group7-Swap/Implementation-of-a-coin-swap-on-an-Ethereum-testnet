import { ethers } from "./ethers-5.6.esm.min.js";
import { /*CurveAMMabi, ERC20_ABI,*/ LPToken_ABI } from "./constants.js";
import abi from "./constants/ContractABI.json" assert { type: "json" };
import contractAddress from "./constants/ContractAddress.json" assert { type: "json" };

// Operations to be performed after the page is loaded
window.addEventListener("load", async () => {
  const connectButton = document.getElementById("connectButton");

  // If the user's browser has MetaMask or another wallet that supports Web3 installed, use ethers.js to connect to the user's wallet
  if (window.ethereum) {
    window.provider = new ethers.providers.Web3Provider(window.ethereum);
    try {
      // await window.ethereum.enable();
      if ((await ethereum.request({ method: "eth_accounts" })).length) {
        const accounts = (
          await ethereum.request({ method: "eth_accounts" })
        ).toString();
        connectButton.innerHTML = `<image src="./images/MetaMask-Fox.png" id="Fox" width="20px" style="flex: none;margin-right:5px;margin-left:20px;"/> ${accounts.slice(
          0,
          6
        )}...${accounts.slice(-4)}`;
        connectButton.style =
          "width:200px; background-color: powderblue; color: white;display: flex;align-items: center;text-align:center;";
      }
    } catch (error) {
      console.error("Not Connected!");
    }
  } else if (window.web3) {
    window.provider = new ethers.providers.Web3Provider(
      window.web3.currentProvider
    );
  } else {
    console.error("No web3 provider detected");
  }

  // Define constants such as the liquidity pool and the contract address of the token
  const cpammAddress = contractAddress["CPAMM"];
  const curveAddress = contractAddress["Curve"];

  const token1Address = contractAddress["MyToken1"];
  const token2Address = contractAddress["MyToken2"];

  console.log('abi["CurveABI"][0]', abi["MyTokenABI"][0]);
  const CURVE_ABI = abi["CurveABI"][0];
  const ERC20_ABI = abi["MyTokenABI"][0];
  const CPAMM_ABI = abi["CPAMMABI"][0];

  // Get some DOM elements
  const poolSelect = document.getElementById("pool");
  const fromSelect = document.getElementById("from");
  const toSelect = document.getElementById("to");
  const exchangeRate = document.getElementById("exchangeRate");
  const fromAmountInput = document.getElementById("fromAmount");
  const toAmountInput = document.getElementById("toAmount");
  const swapButton = document.getElementById("swapButton");
  const message = document.getElementById("message");
  const LPTokenmessage = document.getElementById("LPTokenmessage");
  const faucet = document.getElementById("faucet");
  const LPTokenAddress = document.getElementById("LPTokenAddress");
  const addLiquidityToken1Input = document.getElementById("addLiquidityToken1");
  const addLiquidityToken2Input = document.getElementById("addLiquidityToken2");
  const addLiquidity = document.getElementById("addLiquidity");
  const removeLiquidityTokenInput = document.getElementById(
    "removeLiquidityToken"
  );
  const removeLiquidity = document.getElementById("removeLiquidity");
  const update = document.getElementById("update");
  const container = document.getElementById("container");
  const selectbody = document.getElementById("iselect-body");
  const pool = document.getElementById("pool");

  let poolContract;
  let token1Contract;
  let token2Contract;
  let LPtokenAddress;
  let token1Symbol, token2Symbol;

  let previousAccount = (await window.provider.listAccounts())[0];
  setInterval(async () => {
    const currentAccount = (await window.provider.listAccounts())[0];
    if (currentAccount !== previousAccount) {
      console.log("Account changed:", currentAccount);
      const event = new Event("click");
      update.dispatchEvent(event);
      previousAccount = currentAccount;
      connectButton.dispatchEvent(event);
    }
  }, 1000); // Check whether the current account changes every second. If the current account changes, it will be updated

  async function init() {
    // This is where you do what you need to do after the page loads

    const poolType = poolSelect.value;
    console.log("poolType", poolSelect.value);
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    if (poolType === "0") {
      poolContract = new ethers.Contract(
        cpammAddress,
        CPAMM_ABI,
        provider.getSigner()
      );
      container.style =
        "height: 100%; width: 100%; background-image: url('./images/pink.png');";
      selectbody.style = "background: #fbf0f0;";
      addLiquidity.addEventListener("mouseover", function () {
        addLiquidity.style.transition = "0.3s";
        addLiquidity.style.backgroundColor = "pink";
      });
      addLiquidity.addEventListener("mouseout", function () {
        addLiquidity.style.backgroundColor = "powderblue";
      });
      removeLiquidity.addEventListener("mouseover", function () {
        removeLiquidity.style.transition = "0.3s";
        removeLiquidity.style.backgroundColor = "pink";
      });
      removeLiquidity.addEventListener("mouseout", function () {
        removeLiquidity.style.backgroundColor = "powderblue";
      });
      swapButton.addEventListener("mouseover", function () {
        swapButton.style.transition = "0.3s";
        swapButton.style.backgroundColor = "pink";
      });
      swapButton.addEventListener("mouseout", function () {
        swapButton.style.backgroundColor = "powderblue";
      });
      pool.style =
        "background: url('./images/arrow-down-pink.png') no-repeat scroll right center transparent; background-size: 1.99rem 1.99rem;";
    } else if (poolType === "1") {
      poolContract = new ethers.Contract(
        curveAddress,
        CURVE_ABI,
        provider.getSigner()
      );
      container.style =
        "height: 100%; width: 100%; background-image: url('./images/green.png');";
      selectbody.style = "background: #92d2956e;";
      addLiquidity.addEventListener("mouseover", function () {
        addLiquidity.style.transition = "0.3s";
        addLiquidity.style.backgroundColor = "#BDD57D";
      });
      addLiquidity.addEventListener("mouseout", function () {
        addLiquidity.style.backgroundColor = "powderblue";
      });
      removeLiquidity.addEventListener("mouseover", function () {
        removeLiquidity.style.transition = "0.3s";
        removeLiquidity.style.backgroundColor = "#BDD57D";
      });
      removeLiquidity.addEventListener("mouseout", function () {
        removeLiquidity.style.backgroundColor = "powderblue";
      });
      swapButton.addEventListener("mouseover", function () {
        swapButton.style.transition = "0.3s";
        swapButton.style.backgroundColor = "#BDD57D";
      });
      swapButton.addEventListener("mouseout", function () {
        swapButton.style.backgroundColor = "powderblue";
      });
      pool.style =
        "background: url('./images/arrow-down-green.png') no-repeat scroll right center transparent; background-size: 1.99rem 1.99rem;";
    }
    token1Contract = new ethers.Contract(
      token1Address,
      ERC20_ABI,
      provider.getSigner()
    );
    token2Contract = new ethers.Contract(
      token2Address,
      ERC20_ABI,
      provider.getSigner()
    );
    [token1Symbol, token2Symbol] = await Promise.all([
      token1Contract.symbol(),
      token2Contract.symbol(),
    ]);
    fromSelect.innerHTML = `<option value="${token1Address}">${token1Symbol}</option><option value="${token2Address}">${token2Symbol}</option>`;
    toSelect.innerHTML = `<option value="${token1Address}">${token1Symbol}</option><option value="${token2Address}">${token2Symbol}</option>`;
    addLiquidityToken1Input.placeholder = `${token1Symbol}`;
    addLiquidityToken2Input.placeholder = `${token2Symbol}`;

    //After each change of pool, from is still preferred as the first currency, and the currency types of from and to are never the same
    if (fromSelect.options[fromSelect.selectedIndex].text == token1Symbol) {
      toSelect.options[fromSelect.selectedIndex + 1].selected = true;
    } else {
      toSelect.options[fromSelect.selectedIndex - 1].selected = true;
    }

    const event = new Event("change");
    fromSelect.dispatchEvent(event);
    const event1 = new Event("click");
    update.dispatchEvent(event1);
  }
  init();

  // Update the tokens available in the token selection box when the user changes the liquidity pool
  poolSelect.addEventListener("change", async () => {
    LPTokenmessage.innerHTML = "";
    message.innerHTML = "";
    const poolType = poolSelect.value;
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    if (poolType === "0") {
      poolContract = new ethers.Contract(
        cpammAddress,
        CPAMM_ABI,
        provider.getSigner()
      );
      container.style =
        "height: 100%; width: 100%; background-image: url('./images/pink.png');";
      selectbody.style = "background: #fbf0f0;";
      addLiquidity.addEventListener("mouseover", function () {
        addLiquidity.style.transition = "0.3s";
        addLiquidity.style.backgroundColor = "pink";
      });
      addLiquidity.addEventListener("mouseout", function () {
        addLiquidity.style.backgroundColor = "powderblue";
      });
      removeLiquidity.addEventListener("mouseover", function () {
        removeLiquidity.style.transition = "0.3s";
        removeLiquidity.style.backgroundColor = "pink";
      });
      removeLiquidity.addEventListener("mouseout", function () {
        removeLiquidity.style.backgroundColor = "powderblue";
      });
      swapButton.addEventListener("mouseover", function () {
        swapButton.style.transition = "0.3s";
        swapButton.style.backgroundColor = "pink";
      });
      swapButton.addEventListener("mouseout", function () {
        swapButton.style.backgroundColor = "powderblue";
      });
      pool.style =
        "background: url('./images/arrow-down-pink.png') no-repeat scroll right center transparent; background-size: 1.99rem 1.99rem;";
    } else if (poolType === "1") {
      poolContract = new ethers.Contract(
        curveAddress,
        CURVE_ABI,
        provider.getSigner()
      );
      container.style =
        "height: 100%; width: 100%; background-image: url('./images/green.png');";
      selectbody.style = "background: #92d2956e;";
      addLiquidity.addEventListener("mouseover", function () {
        addLiquidity.style.transition = "0.3s";
        addLiquidity.style.backgroundColor = "#BDD57D";
      });
      addLiquidity.addEventListener("mouseout", function () {
        addLiquidity.style.backgroundColor = "powderblue";
      });
      removeLiquidity.addEventListener("mouseover", function () {
        removeLiquidity.style.transition = "0.3s";
        removeLiquidity.style.backgroundColor = "#BDD57D";
      });
      removeLiquidity.addEventListener("mouseout", function () {
        removeLiquidity.style.backgroundColor = "powderblue";
      });
      swapButton.addEventListener("mouseover", function () {
        swapButton.style.transition = "0.3s";
        swapButton.style.backgroundColor = "#BDD57D";
      });
      swapButton.addEventListener("mouseout", function () {
        swapButton.style.backgroundColor = "powderblue";
      });
      pool.style =
        "background: url('./images/arrow-down-green.png') no-repeat scroll right center transparent; background-size: 1.99rem 1.99rem;";
    }
    token1Contract = new ethers.Contract(
      token1Address,
      ERC20_ABI,
      provider.getSigner()
    );
    token2Contract = new ethers.Contract(
      token2Address,
      ERC20_ABI,
      provider.getSigner()
    );
    const [token1Symbol, token2Symbol] = await Promise.all([
      token1Contract.symbol(),
      token2Contract.symbol(),
    ]);
    fromSelect.innerHTML = `<option value="${token1Address}">${token1Symbol}</option><option value="${token2Address}">${token2Symbol}</option>`;
    toSelect.innerHTML = `<option value="${token1Address}">${token1Symbol}</option><option value="${token2Address}">${token2Symbol}</option>`;
    addLiquidityToken1Input.placeholder = `${token1Symbol}`;
    addLiquidityToken2Input.placeholder = `${token2Symbol}`;

    //After each change of pool, from is still preferred as the first currency, and the currency types of from and to are never the same
    if (fromSelect.options[fromSelect.selectedIndex].text == token1Symbol) {
      toSelect.options[fromSelect.selectedIndex + 1].selected = true;
    } else {
      toSelect.options[fromSelect.selectedIndex - 1].selected = true;
    }

    const event = new Event("change");
    fromSelect.dispatchEvent(event);
    const event1 = new Event("click");
    update.dispatchEvent(event1);
  });

  // When the user changes the tokens to be exchanged, the amount of tokens after exchange is calculated according to the current exchange ratio and displayed on the page
  fromSelect.addEventListener("change", async () => {
    //Ensure that the currency types of from and to are never the same
    if (fromSelect.options[fromSelect.selectedIndex].text == token1Symbol) {
      toSelect.options[fromSelect.selectedIndex + 1].selected = true;
    } else {
      toSelect.options[fromSelect.selectedIndex - 1].selected = true;
    }
    const fromAddress = fromSelect.value; //The value is already the contract address
    const toAddress = toSelect.value;

    //For each currency type change from and to, the input event is still triggered automatically, thus achieving the effect of real-time currency conversion
    if (fromAmountInput.value.trim() !== "") {
      const event = new Event("input");
      fromAmountInput.dispatchEvent(event);
    }

    const [fromDecimals, toDecimals] = await Promise.all([
      token1Contract.decimals(),
      token2Contract.decimals(),
    ]);

    const fromAmountWei = ethers.utils.parseUnits("1", fromDecimals);
    console.log(
      `fromAddress is ${fromAddress},toAddress is ${toAddress},fromAmountWei is ${fromAmountWei}`
    );

    const toAmountWei = await poolContract.getExchangeRate(
      fromAddress,
      toAddress,
      fromAmountWei
    );
    console.log(`toAmountWei is ${toAmountWei}`);
    const toAmount = ethers.utils.formatUnits(toAmountWei, toDecimals);

    exchangeRate.innerHTML = `<p style="font-weight: bold;">Current Exchange Rate<p> 1 ${
      fromSelect.options[fromSelect.selectedIndex].text
    } = ${toAmount} ${toSelect.options[toSelect.selectedIndex].text}`;
  });

  // When the user changes the tokens to be exchanged, the amount of tokens after exchange is calculated according to the current exchange ratio and displayed on the page
  toSelect.addEventListener("change", async () => {
    //Ensure that the currency types of from and to are never the same
    if (toSelect.options[toSelect.selectedIndex].text == token1Symbol) {
      fromSelect.options[toSelect.selectedIndex + 1].selected = true;
    } else {
      fromSelect.options[toSelect.selectedIndex - 1].selected = true;
    }
    const fromAddress = fromSelect.value;
    const toAddress = toSelect.value;
    //For each currency type change from and to, the input event is still triggered automatically, thus achieving the effect of real-time currency conversion
    if (fromAmountInput.value.trim() !== "") {
      const event = new Event("input");
      fromAmountInput.dispatchEvent(event);
    }

    const [fromDecimals, toDecimals] = await Promise.all([
      token1Contract.decimals(),
      token2Contract.decimals(),
    ]);

    const fromAmountWei = ethers.utils.parseUnits("1", fromDecimals);

    const toAmountWei = await poolContract.getExchangeRate(
      fromAddress,
      toAddress,
      fromAmountWei
    );
    // const toAmount = ethers.utils.formatUnits(toAmountWei, toDecimals);
    const toAmount = ethers.utils.formatUnits(toAmountWei, toDecimals);

    exchangeRate.innerHTML = `<p style="font-weight: bold;">Current Exchange Rate<p> 1 ${
      fromSelect.options[fromSelect.selectedIndex].text
    } = ${toAmount} ${toSelect.options[toSelect.selectedIndex].text}`;
  });

  // When the user enters the exchange amount, the amount of tokens after exchange is calculated according to the current exchange ratio and displayed on the page
  fromAmountInput.addEventListener("input", async () => {
    const fromAddress = fromSelect.value;
    const toAddress = toSelect.value;
    if (fromAmountInput.value < 0) {
      fromAmountInput.value = 0;
      toAmountInput.value = 0;
    } else if (toAmountInput.value < 0) {
      fromAmountInput.value = 0;
      toAmountInput.value = 0;
    }
    const [fromDecimals, toDecimals] = await Promise.all([
      token1Contract.decimals(),
      token2Contract.decimals(),
    ]);
    const fromAmountWei = ethers.utils.parseUnits(
      fromAmountInput.value,
      fromDecimals
    );
    const toAmountWei = await poolContract.getExchangeRate(
      fromAddress,
      toAddress,
      fromAmountWei
    );
    const toAmount = ethers.utils.formatUnits(toAmountWei, toDecimals);
    // exchangeRate.innerHTML = `Current exchange rate: 1 ${
    //   fromSelect.options[fromSelect.selectedIndex].text
    // } = ${toAmount} ${toSelect.options[toSelect.selectedIndex].text}`;
    toAmountInput.value = toAmount;
  });

  // When the user enters the exchange amount, the number of tokens before the exchange is calculated according to the current exchange ratio and displayed on the page
  toAmountInput.addEventListener("input", async () => {
    const fromAddress = fromSelect.value;
    const toAddress = toSelect.value;
    const [fromDecimals, toDecimals] = await Promise.all([
      token1Contract.decimals(),
      token2Contract.decimals(),
    ]);
    const toAmountWei = ethers.utils.parseUnits(
      toAmountInput.value,
      toDecimals
    );
    const fromAmountWei = await poolContract.getExchangeRate(
      toAddress,
      fromAddress,
      toAmountWei
    );
    const fromAmount = ethers.utils.formatUnits(fromAmountWei, fromDecimals);

    fromAmountInput.value = fromAmount;
  });
  //Get LP Token Address
  LPTokenAddress.addEventListener("click", async () => {
    LPtokenAddress = await poolContract.getLPTokenAddress();

    try {
      LPTokenmessage.innerHTML = `<p style="font-weight: bold;">INFO</p> ${LPtokenAddress.toString()}`;
    } catch (error) {
      LPTokenmessage.innerHTML = `LPTokenAddress failed: ${error.message}`;
    }
  });
  addLiquidity.addEventListener("click", async () => {
    if (
      (addLiquidityToken1Input.value.trim() >= 0 &&
        addLiquidityToken2Input.value.trim() > 0 &&
        addLiquidityToken1Input.value.trim() !== "") ||
      (addLiquidityToken1Input.value.trim() > 0 &&
        addLiquidityToken2Input.value.trim() >= 0 &&
        addLiquidityToken2Input.value.trim() !== "")
    ) {
      await token1Contract.approve(
        poolContract.address,
        ethers.utils.parseEther(addLiquidityToken1Input.value)
      );

      await token2Contract.approve(
        poolContract.address,
        ethers.utils.parseEther(addLiquidityToken2Input.value)
      );
      const tx = await poolContract.addLiquidity(
        ethers.utils.parseEther(addLiquidityToken1Input.value),
        ethers.utils.parseEther(addLiquidityToken2Input.value)
      );
      await tx.wait(1);
      alert("addLiquidity !");
      const event = new Event("change");
      fromSelect.dispatchEvent(event);
      const event1 = new Event("click");
      update.dispatchEvent(event1);
    } else {
      alert("You have not entered the right addliquidity amount yet!");
    }
  });
  removeLiquidity.addEventListener("click", async () => {
    if (removeLiquidityTokenInput.value.trim() > 0) {
      const tx = await poolContract.removeLiquidity(
        ethers.utils.parseEther(removeLiquidityTokenInput.value)
      );
      await tx.wait(1);
      alert("removeLiquidity !");
      const event = new Event("change");
      fromSelect.dispatchEvent(event);
      const event1 = new Event("click");
      update.dispatchEvent(event1);
    } else {
      alert("You have not entered the right removeliquidity amount yet!");
    }
  });
  faucet.addEventListener("click", async () => {
    const tx1 = await token1Contract.faucet();
    const tx2 = await token2Contract.faucet();
    await tx1.wait(1);
    await tx2.wait(1);
    const event = new Event("click");
    update.dispatchEvent(event);
    alert(`Send you 10 ${token1Symbol} and 10 ${token2Symbol} !`);
  });
  connectButton.addEventListener("click", async () => {
    if (typeof window.ethereum !== "undefined") {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = (
        await ethereum.request({ method: "eth_accounts" })
      ).toString();
      connectButton.innerHTML = `<image src="./images/MetaMask-Fox.png" id="Fox" width="20px" style="flex: none;margin-right:5px;margin-left:20px;"/> ${accounts.slice(
        0,
        6
      )}...${accounts.slice(-4)}`;
      connectButton.style =
        "width:200px; background-color: powderblue; color: white;display: flex;align-items: center;text-align:center;";
    } else {
      connectButton.innerHTML = "Please connect your metamask!";
    }
  });
  //update all input's placehupdateolder
  update.addEventListener("click", async () => {
    if (fromSelect.options[fromSelect.selectedIndex].text == token1Symbol) {
      fromAmountInput.placeholder = `At most ${ethers.utils.formatEther(
        (
          await token1Contract.balanceOf(
            (
              await window.provider.listAccounts()
            )[0]
          )
        ).toString()
      )} ${token1Symbol}`;
    } else {
      fromAmountInput.placeholder = `At most ${ethers.utils.formatEther(
        (
          await token2Contract.balanceOf(
            (
              await window.provider.listAccounts()
            )[0]
          )
        ).toString()
      )} ${token2Symbol}`;
    }
    addLiquidityToken1Input.placeholder = `At most ${ethers.utils.formatEther(
      (
        await token1Contract.balanceOf(
          (
            await window.provider.listAccounts()
          )[0]
        )
      ).toString()
    )} ${token1Symbol}`;
    addLiquidityToken2Input.placeholder = `At most ${ethers.utils.formatEther(
      (
        await token2Contract.balanceOf(
          (
            await window.provider.listAccounts()
          )[0]
        )
      ).toString()
    )} ${token2Symbol}`;
    LPtokenAddress = await poolContract.getLPTokenAddress();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const LPTokenContract = new ethers.Contract(
      LPtokenAddress,
      LPToken_ABI,
      provider.getSigner()
    );
    removeLiquidityTokenInput.placeholder = `At most ${ethers.utils.formatEther(
      (
        await LPTokenContract.balanceOf(
          (
            await window.provider.listAccounts()
          )[0]
        )
      ).toString()
    )} LP token`;
  });

  // When the user clicks the exchange button, the exchange operation is performed
  swapButton.addEventListener("click", async () => {
    const fromAddress = fromSelect.value;
    const toAddress = toSelect.value;
    if (fromSelect.value.trim() > 0 && fromSelect.value.trim() > 0) {
      const fromAmount = ethers.utils.parseUnits(
        fromAmountInput.value,
        await token1Contract.decimals()
      );
      const toAmount = ethers.utils.parseUnits(
        toAmountInput.value,
        await token2Contract.decimals()
      );
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      if (fromAmount && toAmount) {
        try {
          // Use the user's signature for transactions
          // const signer = window.provider.getSigner();
          // const tx = await signer.sendTransaction(txObject);
          const fromContract = new ethers.Contract(
            fromAddress,
            ERC20_ABI,
            provider.getSigner()
          );
          const approvetx = await fromContract.approve(
            poolContract.address,
            fromAmount
          );
          await approvetx.wait(1);
          // await token2Contract.approve()
          const tx = await poolContract.swap(
            fromAddress,
            toAddress,
            fromAmount,
            toAmount
          );
          await tx.wait(1);
          message.innerHTML = `<p style="font-weight: bold;">INFO</p><p style="font-weight: bold;">Transaction Hash</p>${tx.hash}`;
        } catch (error) {
          message.innerHTML = `Swap failed: ${error.message}`;
        }
      } else {
        message.innerHTML = "Please enter both from and to amounts";
      }
      const event = new Event("change");
      fromSelect.dispatchEvent(event);
      const event1 = new Event("click");
      update.dispatchEvent(event1);
    } else {
      alert("Swap input number is false!");
    }
  });
});
