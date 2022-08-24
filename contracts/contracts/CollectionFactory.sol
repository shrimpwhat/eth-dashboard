// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "./Collection.sol";

contract CollectionFactory {
    mapping(address => address[]) public createdCollections;

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
    }

    function getUserCollections(address user)
        external
        view
        returns (address[] memory collections)
    {
        collections = createdCollections[user];
    }

    function getLastCollection(address user)
        external
        view
        returns (address collection)
    {
        address[] memory collections = createdCollections[user];
        require(collections.length > 0, "No collections");
        collection = collections[collections.length - 1];
    }
}
