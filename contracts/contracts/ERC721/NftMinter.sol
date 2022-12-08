// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NftMinter is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private tokenId;

    constructor() ERC721("Web3Dashboard", "wNFT") {}

    function mint(string calldata metadataURI) external {
        uint newTokenId = tokenId.current();
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, metadataURI);
        tokenId.increment();
    }

    function burn(uint _tokenId) external {
        _burn(_tokenId);
    }
}
