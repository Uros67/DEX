// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;


import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../contracts/interfaces/iDEX.sol";

/**
 * @title Contract implemented for constant product AMM decentralized exchange
 * @author Uros Djordjevic
 */

contract DEX is iDEX{
    /**
     * @notice Interface for ERC20 token
     */
    IERC20 token;
    /**
     * @notice Total amount of this contract ETH
     */
    uint256 public totalEthLiquidity;
    /**
     * @notice From address get amount of deposited ETH
     * @dev Key is type of address and value is type of uint256
     */
    mapping(address => uint256) public ethLiquidity;

    /**
     * @notice From address get amount of deposited tokens
     * @dev Key is type of address and value is type of uint256
     */
    mapping(address => uint256) public tokenLiquidity;


    /**
     * @param _tokenAddress Address of ERC20 token
     */
    constructor(address _tokenAddress) {
        token = IERC20(_tokenAddress);
    }

    receive() external payable {}

    /**
     * @notice Function to initialize liquidity pool
     * @param tokens Amount of tokens deposited to pool
     */
    function init(uint256 tokens) external payable {
        require(totalEthLiquidity == 0, "Dex: init- already has liquidity");
        totalEthLiquidity = address(this).balance;
        ethLiquidity[msg.sender] = totalEthLiquidity;
        require(
            token.transferFrom(msg.sender, address(this), tokens),
            "DEX: init- transfer did not transact"
        );
        tokenLiquidity[msg.sender] = tokens;
        emit InitializedLiquidityPool( totalEthLiquidity, tokens);
    }

/**
 * @notice Function to get amount of token from exchange
 * @param inputAmountToChange Amount of asset we want to exchange
 * @param inputReserve Total amount of token 1 in liquidity pool
 * @param outputReserve  Total amount of token 2 in liquidity pool
 * @return Amount of token 2
 */
    function price(
        uint256 inputAmountToChange,
        uint256 inputReserve,
        uint256 outputReserve
    ) private pure returns (uint256) {
        uint256 amountToChangeWithFee = inputAmountToChange * 997;
        uint256 numerator = amountToChangeWithFee * outputReserve;
        uint256 denominator = inputReserve * 1000 + amountToChangeWithFee;
        return numerator / denominator;
    }
    
/**
 * @notice Function to exchange ETH to ERC20 token
 */
    function ethToToken() external payable {
        uint256 tokenReserve = token.balanceOf(address(this));
        uint256 ethReserveWithoutInputAmount = address(this).balance -
            msg.value;
        uint256 tokenBought = price(
            msg.value,
            ethReserveWithoutInputAmount,
            tokenReserve
        );
        require(
            token.transfer(msg.sender, tokenBought),
            "Token is not transfered"
        );
        totalEthLiquidity = address(this).balance;
        emit EthToTokenExchanged(msg.value, tokenBought);
    }

/**
 * @notice Function to exchange ERC20 token to ETH
 * @param tokenAmount Amount of ERC20 token to exchange
 */
    function tokenToEth(uint256 tokenAmount) external{
        uint256 tokenReserve = token.balanceOf(address(this));
        uint256 ethBought = price(
            tokenAmount,
            tokenReserve,
            address(this).balance
        );
        token.transfer(address(this), tokenAmount);
        (bool sent, ) = payable(msg.sender).call{value: ethBought}("");
        require(sent, "ETH is not sent");
        totalEthLiquidity = address(this).balance;
        require(
            token.transferFrom(msg.sender, address(this), tokenAmount),
            "Token is not transfered"
        );
        emit TokenToEthExchanged(tokenAmount, ethBought);
    }

/**
 * @notice Function to deposit collateral
 */
    function deposit() external payable {
        uint256 ethReserves = address(this).balance - msg.value;
        uint256 tokenReserve = token.balanceOf(address(this));
        uint256 tokenAmount = ((msg.value * tokenReserve) / ethReserves);
        // uint256 liquidityMinted = (msg.value * totalEthLiquidity) / ethReserves;
        uint256 liquidityMinted = msg.value;
        ethLiquidity[msg.sender] += liquidityMinted;
        totalEthLiquidity += liquidityMinted;
        require(
            token.transferFrom(msg.sender, address(this), tokenAmount),
            "Token is not transfered"
        );
        tokenLiquidity[msg.sender] += tokenAmount;
        emit DepositedToLP(liquidityMinted, tokenAmount);
        
    }

/**
 * @notice Function to withdraw deposited assets from liquidity pool
 * @param amount Amount of asset to withdraw

 */
    function withdraw(uint256 amount) external{
        uint256 ethReserves = address(this).balance;
        uint256 tokenReserve = token.balanceOf(address(this));
        uint256 ethAmount = (amount * ethReserves) / totalEthLiquidity;
        uint256 tokenAmount = (amount * tokenReserve) / totalEthLiquidity;
        ethLiquidity[msg.sender] -= ethAmount;
        totalEthLiquidity -= ethAmount;
        (bool sent, ) = payable(msg.sender).call{value: ethAmount}("");
        require(sent, "ETH is not sent");
        require(
            token.transfer(msg.sender, tokenAmount),
            "Token is not transfered"
        );
        tokenLiquidity[msg.sender] -= tokenAmount;
        emit WithdrawnFromLP(ethAmount, tokenAmount);
        
    }

/**
 * @return Total amount of ETH
 */
    function getLiquidity() external view returns (uint256) {
        return totalEthLiquidity;
    }

/**
 * @return Address of ERC20 token
 */
    function getTokenAddress() external view returns (IERC20) {
        return token;
    }
}
