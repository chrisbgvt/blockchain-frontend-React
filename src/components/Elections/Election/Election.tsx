import React, { useEffect, ChangeEvent, FormEvent, useState } from "react";
import "./Election.css";
import { useWallets } from "@web3-onboard/react";

import { ethers } from "ethers";
import { getContract, useElectionContract, handleError } from "../../../helpers";

interface ConnectedWallet {
    accounts: { address: string }[];
}

interface ElectionProps {
    nameElection: string;
    endDate: any;
    winnerName: string;
}

const Election: React.FC<ElectionProps> = ({ nameElection, endDate, winnerName }) => {
    const connectedWallets = useWallets();
    const [selectedValue, setSelectedValue] = useState("");
    const [message, setMessage] = useState<string>("");
    const { contracts, loading, electionId } = useElectionContract(connectedWallets);
    const onlyNames = nameElection.split(',').filter(item => isNaN(Number(item))).join(',');
    const [...names] = onlyNames.split(',');
    const [gasCost, setGasCost] = useState<string>("0");

    useEffect(() => {
        
    }, []);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedValue(e.target.value);
    };

    const handleVote = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
			const promises = contracts.map(async (x, index) => {
                x?.estimateGas.vote(selectedValue, 1).then((_gasCost) => {
                    console.log(_gasCost.toString());
                    setGasCost(_gasCost.toString());
                });
				return await x?.vote(selectedValue, 1);
			});
			const results = await Promise.all(promises);
		} catch (error) {
            setMessage(handleError(error));
		}
    };

    const showMessage = (message: string) => {
		// setMessage(message);
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
                {message && <p>{message}</p>}
                {Date.now() > endDate ? <p>Winner: {winnerName}</p> : <button type="submit">Vote</button>}
            </form>
        </div>
    );
};

export default Election;
