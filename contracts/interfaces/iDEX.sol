// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface iDEX {
    event InitializedLiquidityPool(uint256 ethBalance, uint256 tokenBalance);
    event EthToTokenExchanged(uint256 ethToExchange, uint256 exchangedTokens);
    event TokenToEthExchanged(uint256 tokensToExchange, uint256 exchangedEth);
    event DepositedToLP(uint256 tokenAmount, uint256 ethAmount);
    event WithdrawnFromLP(uint256 ethAmount, uint256 tokenAmount);

    function init(uint256 tokens) external payable ;

    function ethToToken() external payable ;

    function tokenToEth(uint256 tokenAmount) external;

    function deposit() external payable;

    function withdraw(uint256 amount) external;

    function getLiquidity() external view returns (uint256) ;

    function getTokenAddress() external view returns (IERC20) ;
}
