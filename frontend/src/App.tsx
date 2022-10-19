import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Wallet from "./utils/components/Wallet";
import IndexPage from "./utils/pages/IndexPage";
import NftMintPage from "./utils/pages/NftMenu";
import { ToastContainer } from "react-toastify";
import CollectionPage from "./utils/pages/CollectionPage";
import TokenCreationPage from "./utils/pages/TokenCreationPage";

function App() {
  return (
    <Router>
      <header></header>
      <main className="flex h-screen relative">
        <div className="bg-purple-200 w-40 fixed h-full md:w-60 p-5">
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
                <Link to="/token/create">ERC20</Link>
              </li>
              <li className="my-5">
                <Link to="">Swap</Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="w-full pl-40 md:pl-60">
          <div className="w-full h-full p-5">
            <ToastContainer />
            <Routes>
              <Route path="/" element={<IndexPage />} />
              <Route path="nft">
                <Route path="" element={<NftMintPage />} />
                <Route
                  path="collection/:address"
                  element={<CollectionPage />}
                />
              </Route>
              <Route path="token">
                <Route path="create" element={<TokenCreationPage />} />
              </Route>
            </Routes>
          </div>
        </div>
      </main>
      <footer></footer>
    </Router>
  );
}

export default App;
