// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

/*
    Based on:
    https://github.com/beefyfinance/beefy-contracts/blob/master/contracts/BIFI/infra/BeefyRewardPool.sol
    https://solidity-by-example.org/defi/staking-rewards/
*/

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract StakingPool is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20Metadata;
    using SafeERC20 for IERC20;

    IERC20Metadata public immutable stakedToken;
    uint256 public duration;
    uint256 public totalSupply;
    uint256 public periodFinish;
    uint256 public rewardRate;
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;
    mapping(address => uint) public balanceOf;

    event RewardAdded(uint256 reward);
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);

    constructor(address _stakedToken, uint _duration) {
        stakedToken = IERC20Metadata(_stakedToken);
        duration = _duration;
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = lastTimeRewardApplicable();
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    function lastTimeRewardApplicable() public view returns (uint256) {
        return Math.min(block.timestamp, periodFinish);
    }

    function rewardPerToken() public view returns (uint256) {
        if (totalSupply == 0) {
            return rewardPerTokenStored;
        }
        return
            rewardPerTokenStored.add(
                lastTimeRewardApplicable()
                    .sub(lastUpdateTime)
                    .mul(rewardRate)
                    .mul(10 ** stakedToken.decimals())
                    .div(totalSupply)
            );
    }

    function earned(address account) public view returns (uint256) {
        return
            balanceOf[account]
                .mul(rewardPerToken().sub(userRewardPerTokenPaid[account]))
                .div(10 ** stakedToken.decimals())
                .add(rewards[account]);
    }

    function stake(uint256 amount) public updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");
        stakedToken.safeTransferFrom(msg.sender, address(this), amount);
        balanceOf[msg.sender] += amount;
        totalSupply += amount;
        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) public updateReward(msg.sender) {
        require(amount > 0, "Cannot withdraw 0");
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        stakedToken.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    function exit() external {
        require(balanceOf[msg.sender] > 0, "Nothing to withdraw");
        withdraw(balanceOf[msg.sender]);
        getReward();
    }

    function getReward() public updateReward(msg.sender) returns (uint reward) {
        reward = earned(msg.sender);
        require(reward > 0, "Nothing to harvest");
        rewards[msg.sender] = 0;
        stakedToken.safeTransfer(msg.sender, reward);
        emit RewardPaid(msg.sender, reward);
    }

    function compound() external {
        stake(getReward());
    }

    function setRewardsDuration(uint _duration) external onlyOwner {
        require(periodFinish < block.timestamp, "reward duration not finished");
        duration = _duration;
    }

    function notifyRewardAmount(
        uint256 reward
    ) external onlyOwner updateReward(address(0)) {
        require(reward > 0, "reward = 0");
        stakedToken.safeTransferFrom(msg.sender, address(this), reward);
        if (block.timestamp >= periodFinish) {
            rewardRate = reward.div(duration);
        } else {
            uint256 remaining = periodFinish.sub(block.timestamp);
            uint256 leftover = remaining.mul(rewardRate);
            rewardRate = reward.add(leftover).div(duration);
        }
        require(
            rewardRate * duration <=
                stakedToken.balanceOf(address(this)) - totalSupply,
            "reward amount > balance"
        );
        lastUpdateTime = block.timestamp;
        periodFinish = block.timestamp.add(duration);
        emit RewardAdded(reward);
    }

    function inCaseTokensGetStuck(address _token) external onlyOwner {
        require(_token != address(stakedToken), "!staked");
        require(_token != address(stakedToken), "!reward");
        uint256 amount = IERC20(_token).balanceOf(address(this));
        IERC20(_token).safeTransfer(msg.sender, amount);
    }
}
