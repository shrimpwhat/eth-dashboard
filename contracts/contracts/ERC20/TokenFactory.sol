// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "./Token.sol";

contract TokenFactory {
    mapping(address => address[]) createdTokens;

    event TokenCreated(address tokenAddress, address creatorAddress);

    function createToken(
        string calldata _name,
        string calldata _symbol,
        uint _initialAmount
    ) external {
        Token token = new Token(_name, _symbol, _initialAmount);
        address tokenAddress = address(token);
        createdTokens[msg.sender].push(tokenAddress);
        token.transferOwnership(msg.sender);
        emit TokenCreated(tokenAddress, msg.sender);
    }

    function getUserTokens(address _address)
        external
        view
        returns (address[] memory tokens)
    {
        tokens = createdTokens[_address];
    }
}
