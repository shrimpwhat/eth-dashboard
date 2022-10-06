// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "./NftStaking.sol";

contract NftStakingFactory {
    mapping(address => address[]) createdStakingContracts;

    event ContractCreated(address contractAddress, address creatorAddress);

    function createStakingContract(
        address _nftCollection,
        address _rewardsToken,
        uint _rewardsPerHour
    ) external {
        NftStaking stakingContract = new NftStaking(
            _nftCollection,
            _rewardsToken,
            _rewardsPerHour
        );
        address contractAddress = address(stakingContract);
        createdStakingContracts[msg.sender].push(contractAddress);
        emit ContractCreated(contractAddress, msg.sender);
    }

    function getUserContracts(address _address)
        external
        view
        returns (address[] memory contracts)
    {
        contracts = createdStakingContracts[_address];
    }
}
