import { Routes, Route } from 'react-router-dom';

import './App.css';

import { init, useConnectWallet } from "@web3-onboard/react";
import injectedModule from "@web3-onboard/injected-wallets";
// import { ethers } from "ethers";

import Home from "./components/Home/Home";
import Navbar from './components/NavBar/NavBar';
import Footer from './components/Footer/Footer';
import Elections from './components/Elections/Elections';
import PageNotFound from './components/PageNotFound/PageNotFound';

const rpcUrl = `http://127.0.0.1:8545`;

const injected = injectedModule();

// initialize Onboard
init({
    connect: {
        autoConnectLastWallet: true,
    },
    wallets: [injected],
    chains: [
        {
            id: "0x539",
            token: "ETH",
            label: "Custom RPC"
            ,
            rpcUrl,
        },
    ],
    accountCenter: {
        desktop: {
            enabled: false
        },
        mobile: {
            enabled: false
        }
    },
});


function App() {
    const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();

    function handleConnect() {
        connect();
    }

    function handleDisconnect() {
        if (!wallet) {
            return;
        }

        disconnect(wallet).catch((error) => {
            console.log(error);
        });
    }

    return (
        <div className="App">
            <Navbar onDisconnect={handleDisconnect} />
            <div className="main-content">
                <Routes>
                    <Route path="/" 
                        element={
                            <Home 
                                wallet={wallet} 
                                handleDisconnect={handleDisconnect} 
                                connecting={connecting} 
                                connect={connect} 
                            />
                        } 
                    />
                    <Route path="/elections" element={<Elections />} />
                    <Route path="*" element={<PageNotFound />} />
                </Routes>
            </div>
            <Footer />
        </div>
    );
}

export default App;
