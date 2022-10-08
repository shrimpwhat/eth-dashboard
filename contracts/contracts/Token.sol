// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20, Ownable {
    constructor(string memory _name, string memory _symbol)
        ERC20(_name, _symbol)
    {}

    function mint(uint _amount) external onlyOwner {
        _mint(msg.sender, _amount);
    }

    function mintTo(address _address, uint _amount) external onlyOwner {
        _mint(_address, _amount);
    }

    function burn(uint _amount) external {
        _burn(msg.sender, _amount);
    }
}
