import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Wallet from "./Wallet";
import Title from "./utils/components/Title";
import NftMintPage from "./NftMenu";
import { ToastContainer } from "react-toastify";
import CollectionPage from "./CollectionPage";

function IndexPage() {
  return (
    <Router>
      <div className="flex h-screen relative">
        <header>
          <div className="bg-purple-200 w-40 fixed h-full lg:w-60 p-5">
            <Wallet />
            <nav>
              <ul className="list-none">
                <li className="mb-5">
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/nft">Mint NFT</Link>
                </li>
                <li className="my-5">
                  <Link to="">NFT staking</Link>
                </li>
                <li>
                  <Link to="">Create token</Link>
                </li>
                <li className="my-5">
                  <Link to="">Swap</Link>
                </li>
                <li>
                  <Link to="">Token staking</Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>
        <main className="w-full pl-40 lg:pl-60">
          <div className="w-full h-full p-5">
            <ToastContainer />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="nft">
                <Route path="" element={<NftMintPage />} />
                <Route
                  path="collection/:address"
                  element={<CollectionPage />}
                />
              </Route>
            </Routes>
          </div>
        </main>
        <footer></footer>
      </div>
    </Router>
  );
}

const Index = () => {
  return (
    <div>
      <Title text="Home" />
      <div className="text-2xl">
        <h2>Welcome to the Ethereum Dashboard! Here you can:</h2>
        <ul className="list-disc list-inside ml-5 my-5">
          <li>Mint your own NFT and even setup staking for it;</li>
          <li>
            Create your own ERC-20 token, add a liquidity to pool for swaps and
            setup staking contract too.
          </li>
        </ul>
        <h2>Connect wallet and start creating!</h2>
      </div>
    </div>
  );
};

export default IndexPage;
