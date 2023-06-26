import React, { useEffect, useState, FC } from "react";
import { Link } from 'react-router-dom';

import "./Navbar.css";
import { useConnectWallet, useWallets } from "@web3-onboard/react";

import { formatEthAddress } from "../../helpers";

interface NavbarProps {
  onDisconnect: () => void;
}

const Navbar: FC<NavbarProps> = ({ onDisconnect }) => {
  const [{ wallet }] = useConnectWallet();
  const connectedWallets = useWallets();

  const [usrAddress, setUsrAddress] = useState<string | null>(null);

  useEffect(() => {
    if (
      connectedWallets &&
      connectedWallets.length > 0 &&
      connectedWallets[0].accounts.length > 0
    ) {
      setUsrAddress(connectedWallets[0].accounts[0].address);
    } else {
      setUsrAddress(null);
    }
  }, [connectedWallets]);

  return (
    <div className="navbar">
      <Link className='navbar-label' to="/">Voting App</Link>
      <div className="navbar-left">
        <Link className='navbar-label' to="/elections">Elections</Link>
      </div>
      {wallet && (
        <>
          <p className="navbar-label" style={{ margin: "10px" }}>
            {usrAddress && formatEthAddress(usrAddress)}
          </p>
          <div className="navbar-right">
            <button className="disconnect-button" onClick={onDisconnect}>
              Disconnect
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Navbar;