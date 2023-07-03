import React, { useEffect, ChangeEvent, FormEvent, useState } from "react";
import "./Election.css";
import { useWallets } from "@web3-onboard/react";

import { ethers } from "ethers";
import { getContract, useElectionContract, handleError } from "../../../helpers";

interface ConnectedWallet {
    accounts: { address: string }[];
}

interface ElectionProps {
    contract: any;
    nameElection: string;
    endDate: any;
    winnerName: string;
}

const Election: React.FC<ElectionProps> = ({ contract, nameElection, endDate, winnerName }) => {
    const connectedWallets = useWallets();
    const [selectedValue, setSelectedValue] = useState("");
    const [message, setMessage] = useState<string>("");
    const onlyNames = nameElection.split(',').filter(item => isNaN(Number(item))).join(',');
    const [...names] = onlyNames.split(',');
    const [gasCost, setGasCost] = useState<string>("0");

    useEffect(() => {
        
    }, [connectedWallets]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedValue(e.target.value);
    };

    const handleVote = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            contract.estimateGas.vote(selectedValue, 1).then((_gasCost: string) => {
                // console.log(_gasCost.toString());
                setGasCost(_gasCost.toString());
            });
            await contract.vote(selectedValue, 1);
            showMessage("Success!");
		} catch (error) {
            showMessage(handleError(error));
		}
    };

    const showMessage = (message: string) => {
		setMessage(message);
		setTimeout(() => {
			setMessage("");
		}, 1000 * 3);
	}
    
    return (
        <div className="card">
            <form onSubmit={handleVote}>
                {names.map((x, index) => {
                    return (
                        <div className="card-body" key={index}>
                            <input type="radio" id={`${x}-${index}`} name="radioGroup" value={index} onChange={handleChange} />
                            <label htmlFor={`${x}-${index}`}>{x}</label>
                        </div>
                    );
                })}
                <label>Network Fee: {gasCost} WEI</label>
                {Date.now() > endDate ? <p>Winner: {winnerName}</p> : <button type="submit">Vote</button>}
                {message && <p>{message}</p>}
            </form>
        </div>
    );
};

export default Election;
