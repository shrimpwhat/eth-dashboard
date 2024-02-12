# Web3 dashboard
![1](https://github.com/shrimpwhat/eth-dashboard/assets/49585211/ada586af-b6d6-4754-a6f2-181dcfd9abb5)
![2](https://github.com/shrimpwhat/eth-dashboard/assets/49585211/91acbccb-26e0-41bf-aa5b-eff7393e5884)


Here you can:

1. Mint your own ERC721A nft
2. Create a collection of ERC721A nfts and get a minting page for it
3. Setup a staking contract for your nfts that will reward stakers with your ERC20 token
4. Mint your own ERC20 token
5. Setup a staking pool for your ERC20 token

## Deploy

App has 2 folders: [contracts](/contracts), which has source code of smart-contracts to deploy on blockchan, and [frontend](/frontend).
Firstly, you have to deploy smart-contracts.
1. Go to /contracts folder and run `npm install`
2. Create `.env ` file with rpc url, deployer private key, and Etherscan API key, see example in `.env.example`
3. Deploy contracts with `npx hardhat run scripts/file_name`. You have to deploy 4 contracts and save addresses: `deployCollectionFactory.ts`, `deployERC20Factory.ts`, `deployERC20StakingFactory.ts`, `deployNftMinter.ts`
4. Then go to /frontend and run `npm install`
5. Create `.env` file with addresses of deployed contracts and [Pinata](https://www.pinata.cloud/) key to store images on IPFS, see `.env.example`
6. Start app with `npm run dev`
