// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MyToken.sol";
import "./SafeMath.sol";
import "hardhat/console.sol";
import "./LPTokenCPAMM.sol";

// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CPAMM {
    using SafeMath for uint; // import SafeMath library for handling integer operations

    address public token1; // the first token address in the transaction pool
    address public token2; // The second token address in the transaction pool
    LPTokenCPAMM public LPtokenCPAMM;
    uint public LPtotalSupply; // total supply of LP tokens
    uint256 public reserve1;
    uint256 public reserve2;

    uint public product;

    mapping(address => uint) public LPbalanceOf; // record the number of LP tokens held by each address

    event Mint(address indexed sender, uint amount1, uint amount2); // event triggered when liquidity is added
    event Burn(
        address indexed sender,
        uint amount1,
        uint amount2,
        address indexed to
    ); // Event triggered when liquidity is withdrawn

    constructor(address _token1, address _token2) {
        token1 = _token1; // initialize the first token address in the transaction pool
        token2 = _token2; // initialize the second token address in the transaction pool
        LPtokenCPAMM = new LPTokenCPAMM("LPCP Token", "LPCP");
    }

    function getReserves() public view returns (uint256, uint256) {
        return (reserve1, reserve2);
    }

    function addLiquidity(
        uint256 _amount1,
        uint256 _amount2
    ) public /**onlyOwner */ {
        require(
            _amount1 >= 0 && _amount2 >= 0,
            "Amounts must be greater than 0"
        );
        require(
            _amount1 <= MyToken(token1).balanceOf(msg.sender) &&
                _amount2 <= MyToken(token2).balanceOf(msg.sender),
            "Amounts must be greater than your balance"
        );
        if (reserve1 == 0 && reserve2 == 0) {
            require(
                MyToken(token1).transferFrom(
                    msg.sender,
                    address(this),
                    _amount1
                ) &&
                    MyToken(token2).transferFrom(
                        msg.sender,
                        address(this),
                        _amount2
                    ),
                "Transfer failed"
            );
            reserve1 = _amount1;
            reserve2 = _amount2;
        } else {
            //Continue to add new liquidity based on the existing pool
            //@TODO It still needs to be implemented here, including addLiquidity immediately after deploying in js, it is best to change it to a form where the front end can input the quantity by itself.
            require(
                MyToken(token1).transferFrom(
                    msg.sender,
                    address(this),
                    _amount1
                ) &&
                    MyToken(token2).transferFrom(
                        msg.sender,
                        address(this),
                        _amount2
                    ),
                "Transfer failed"
            );
            reserve1 += _amount1;
            reserve2 += _amount2;
        }
        // product = SafeMath.mul(
        // SafeMath.div(reserve1, 1000000000000000000),
        // SafeMath.div(reserve2, 1000000000000000000)
        // );
        uint liquidity = calculateLiquidity(_amount1, _amount2); // Calculate the corresponding amount of LP tokens
        require(liquidity > 0, "Invalid liquidity amount"); // Check if the calculated amount of LP tokens is valid

        require(
            LPtokenCPAMM.mint(msg.sender, liquidity),
            "LPTokenCPAMM Mint false!"
        );
        emit Mint(msg.sender, _amount1, _amount2); // Trigger the event of adding liquidity

        product = SafeMath.mul(reserve1, reserve2).div(1000000000000000000);
    }

    function getExchangeRate(
        address fromToken,
        address toToken,
        uint256 amount
    ) public view returns (uint256) {
        uint256 fromReserve;
        uint256 toReserve;
        if (fromToken == token1 && toToken == token2) {
            fromReserve = reserve1;
            toReserve = reserve2;
        } else if (fromToken == token2 && toToken == token1) {
            fromReserve = reserve2;
            toReserve = reserve1;
        } else {
            revert("Invalid tokens");
        }

        uint result = toReserve.sub(
            (product.mul(10 ** 18)).div((fromReserve.add(amount)))
        );
        return result;
    }

    function swap(
        address _from,
        address _to,
        uint256 _fromAmount,
        uint256 _toAmount
    ) public {
        require(_from != _to, "Same tokens");
        require(
            _fromAmount > 0 && _toAmount > 0,
            "Amounts must be greater than 0"
        );

        uint256 amountIn;
        uint256 amountOut;
        amountIn = _fromAmount;
        amountOut = _toAmount;

        console.log("MyToken(_to).approve(msg.sender, amountOut)");
        require(
            MyToken(_from).transferFrom(msg.sender, address(this), amountIn),
            "Transfer failed"
        );
        console.log(
            "MyToken(_from).transferFrom(msg.sender, address(this), amountIn) failed"
        );

        require(
            MyToken(_to).transfer(msg.sender, amountOut),
            "Transfer failed"
        );
        console.log(
            "MyToken(_to).transferFrom(address(this), msg.sender, amountOut) failed"
        );

        if (_from == token1 && _to == token2) {
            reserve1 += amountIn;
            reserve2 -= amountOut;
        } else {
            reserve2 += amountIn;
            reserve1 -= amountOut;
        }
    }

    function removeLiquidity(uint256 amount) external {
        uint liquidity = LPtokenCPAMM.balanceOf(msg.sender); // Get the number of LP tokens held by the liquidity provider in the transaction pool
        require(liquidity >= amount, "Insufficient liquidity"); // Check if the amount of LP tokens is sufficient
        uint amount1 = calculateTokenAmount(amount, token1); // Calculate the first amount of tokens that liquidity providers can withdraw
        uint amount2 = calculateTokenAmount(amount, token2); // Calculate the amount of the second token that the liquidity provider can withdraw
        require(amount1 > 0 && amount2 > 0, "Invalid token amount"); // check if the calculated token amount is valid

        LPtokenCPAMM.burn(msg.sender, amount);
        // LPbalanceOf[msg.sender] = 0; // Reduce the number of LP tokens held by liquidity providers in the trading pool
        // LPtotalSupply = LPtotalSupply.sub(amount); // Decrease the total supply of LP tokens
        MyToken(token1).transfer(msg.sender, amount1); // Transfer the first token that the liquidity provider can withdraw to the specified address
        MyToken(token2).transfer(msg.sender, amount2); // Transfer the second token that the liquidity provider can withdraw to the specified address
        reserve1 -= amount1;
        reserve2 -= amount2;
        emit Burn(msg.sender, amount1, amount2, msg.sender); // Trigger the event of extracting liquidity
    }

    function sqrt(uint256 y) public pure returns (uint256) {
        //When using this function, the parameter y passed in must have been converted according to the Ethereum counting standard, that is, there are 18 digits after the decimal point
        uint256 z = y.mul(10 ** 18).add(1).div(2);
        uint256 w = y.mul(10 ** 18);
        while (z < w) {
            w = z;
            z = y.mul(10 ** 18).div(z).add(z).div(2);
        }
        return w;
    }

    function calculateLiquidity(
        uint amount1,
        uint amount2
    ) public view returns (uint) {
        uint balance1 = MyToken(token1).balanceOf(address(this)); // Get the balance of the first token in the transaction pool
        uint balance2 = MyToken(token2).balanceOf(address(this)); // Get the second token balance in the transaction pool
        uint liquidity; // Initialize the amount of LP tokens

        if (LPtokenCPAMM.totalSupply() == 0) {
            // If there are no LP tokens in the transaction pool, calculate the number of LP tokens directly according to the number of tokens provided
            liquidity = sqrt(amount1.mul(amount2).div(10 ** 18));
        } else {
            // Otherwise, calculate the number of newly added LP tokens according to the token balance in the current transaction pool and the number of LP tokens
            uint amountRatio = (amount1.mul(1e18).div(balance1)) <
                (amount2.mul(1e18).div(balance2))
                ? (amount1.mul(1e18).div(balance1))
                : (amount2.mul(1e18).div(balance2)); // Calculate the ratio of the amount of tokens provided. amountRatio = min(amount1 / balance1, amount2 / balance2) * 1e18
            liquidity = amountRatio.mul(LPtokenCPAMM.totalSupply()).div(1e18); // Calculate the amount of newly added LP tokens. Liquidity = amountRatio * LPtotalSupply / 1e18
        }
        return liquidity; // Return the calculated amount of LP tokens
    }

    function calculateTokenAmount(
        uint liquidity,
        address token
    ) public view returns (uint) {
        require(token == token1 || token == token2, "Invalid token address"); // Check if the token address is valid
        if (liquidity == 0) {
            // If the amount of LP tokens is 0, the amount of tokens withdrawn is also 0
            return 0;
        }
        uint balance = MyToken(token).balanceOf(address(this)); // Get the balance of the specified token in the transaction pool
        return liquidity.mul(balance).div(LPtokenCPAMM.totalSupply()); // Calculate the amount of tokens that liquidity providers can withdraw
    }

    function getLPTokenAddress() public view returns (address) {
        return address(LPtokenCPAMM);
    }
}
