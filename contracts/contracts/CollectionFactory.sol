// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "./Collection.sol";

contract CollectionFactory {
    mapping(address => address[]) public createdCollections;

    event CollectionCreated(address _address, address user);

    function createCollection(
        string calldata name,
        string calldata symbol,
        uint16 maxUserLimit,
        uint16 maxSupply,
        uint256 tokenPrice,
        string calldata baseMetdataURI
    ) external payable {
        Collection collection = new Collection(
            name,
            symbol,
            maxUserLimit,
            maxSupply,
            tokenPrice,
            baseMetdataURI
        );
        collection.transferOwnership(msg.sender);
        address collectionAddress = address(collection);
        createdCollections[msg.sender].push(collectionAddress);
        emit CollectionCreated(collectionAddress, msg.sender);
    }

    function getUserCollections(address user)
        external
        view
        returns (address[] memory collections)
    {
        collections = createdCollections[user];
    }
}
