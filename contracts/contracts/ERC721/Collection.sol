// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Collection is ERC721A, Ownable {
    uint256 public MAX_USER_LIMIT;
    uint256 public MAX_SUPPLY;
    uint256 public TOKEN_PRICE;
    string private baseURI;

    constructor(
        string memory name,
        string memory symbol,
        uint256 _MAX_USER_LIMIT,
        uint256 _MAX_SUPPLY,
        uint256 _TOKEN_PRICE,
        string memory baseMetdataURI
    ) ERC721A(name, symbol) {
        MAX_USER_LIMIT = _MAX_USER_LIMIT;
        MAX_SUPPLY = _MAX_SUPPLY;
        TOKEN_PRICE = _TOKEN_PRICE;
        baseURI = baseMetdataURI;
    }

    modifier callerIsUser() {
        require(tx.origin == msg.sender, "The caller is another contract");
        _;
    }

    function numberMinted(address user) external view returns (uint) {
        return _numberMinted(user);
    }

    function withdraw() external payable onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function totalMinted() external view returns (uint) {
        return _totalMinted();
    }

    function mint(uint256 amount) external payable callerIsUser {
        require(
            _numberMinted(msg.sender) + amount <= MAX_USER_LIMIT,
            "Exceded max mint limit"
        );
        require(msg.value >= TOKEN_PRICE * amount, "Not enough ETH sent");
        require(_totalMinted() + amount <= MAX_SUPPLY, "Reached max supply");
        _safeMint(msg.sender, amount);
    }
}
