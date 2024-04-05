// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;


import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title Contract that creates a ROS ERC20 token
 * @author Uros Djordjevic
 */

contract Roses is ERC20{
    constructor() ERC20("roses", "ROS"){
        _mint(msg.sender, 1000*10**18);
    }
}
