import React, { useEffect, ChangeEvent, FormEvent, useState } from "react";
// import "./SendForm.css";
import { useWallets } from "@web3-onboard/react";

import { ethers } from "ethers";
import { getContract, handleError } from "../../helpers";

interface ConnectedWallet {
    accounts: { address: string }[];
}

const SendForm: React.FC = () => {
    const connectedWallets = useWallets();

    const [names, setNames] = useState<string[]>([]);
    const [start, setStart] = useState<string>("");
    const [end, setEnd] = useState<string>("");
    const [startTimestamp, setstartTimestamp] = useState<number>(0);
    const [endTimestamp, setendTimestamp] = useState<number>(0);
    const [message, setMessage] = useState<string | null>(null);
    const [balance, setBalance] = useState<string>("0");
    const [gasCost, setGasCost] = useState<string>("0");

    useEffect(() => {
        if (
            connectedWallets &&
            connectedWallets.length > 0 &&
            connectedWallets[0].accounts.length > 0
        ) {
            const contract = getContract(connectedWallets);

            contract
                .balanceOf(connectedWallets[0].accounts[0].address)
                .then((res: any) => {
                    setBalance(ethers.utils.formatUnits(res, 18));
                })
                .catch((err: any) => {
                    setMessage(handleError(err));
                });
        }
    }, [connectedWallets]);

    useEffect(() => {
        if (!connectedWallets || !names || !start || !end) {
            return
        }
        const contract = getContract(connectedWallets);

        contract.estimateGas.createElection(names, startTimestamp, endTimestamp, {value: ethers.utils.parseEther("0.1")}).then((_gasCost) => {
            console.log(_gasCost.toString());
            setGasCost(_gasCost.toString());
        });
    }, [connectedWallets, names, start, end]);

    const handleNamesChange = (e: ChangeEvent<HTMLInputElement>) => {
        const namesArray = e.target.value.split(',').map(name => name.trim());
        setNames(namesArray);
    };

    const handleStartChange = (e: ChangeEvent<HTMLInputElement>) => {
        const exactDateTimestamp = new Date(e.target.value).getTime();
        setStart(e.target.value);
        setstartTimestamp(exactDateTimestamp);
    };

    const handleEndChange = (e: ChangeEvent<HTMLInputElement>) => {
        const exactDateTimestamp = new Date(e.target.value).getTime();
        setEnd(e.target.value);
        setendTimestamp(exactDateTimestamp);
    };

    const handleSend = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const contract = getContract(connectedWallets);
        try {
            const transaction = await contract.createElection(names, startTimestamp, endTimestamp, {
                value: ethers.utils.parseEther("0.1") // Add this line to send the desired value in ether
            });

            contract.on('CreatedToken', (electionId, votingAddress) => {
                // Handle the event data
                console.log('Event emitted:', electionId, votingAddress);
            });

            const receipt = await transaction.wait();
            if (receipt.status === 1) {
                showMessage("Success! To vote transfer tokens from creator account to voting account!");
            } else {
                showMessage("Failed!");
            }
        } catch (err: any) {
            showMessage(err.message);
        }
    };

    const nextDay = () => {
        const currentDate = new Date();
        const nextDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
        const nextDateFormatted = `${nextDate.getFullYear()}-${(nextDate.getMonth() + 1).toString().padStart(2, '0')}-${nextDate.getDate().toString().padStart(2, '0')}`;
        return nextDateFormatted;
    }

    const showMessage = (message: string) => {
        setMessage(message);
        setTimeout(() => {
            setMessage(null);
        }, 1000 * 3);
    }

    return (
        <div className="form-wrapper">
            <p>Balance: {balance} MTK</p>
            <form className="send-form" onSubmit={handleSend}>
                <h3>Create Election:</h3>
                <div className="form-group">
                    <label htmlFor="names">Election participants:</label>
                    <input
                        type="text"
                        id="names"
                        placeholder="Example - Laptop,PC,Console"
                        value={names}
                        onChange={handleNamesChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="start">Start Date:</label>
                    <input
                        type="date"
                        id="start"
                        placeholder="Start Date"
                        value={start}
                        onChange={handleStartChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="end">End Date:</label>
                    <input
                        type="date"
                        id="end"
                        placeholder="End Date"
                        value={end}
                        onChange={handleEndChange}
                        required
                        min={nextDay()}
                    />
                </div>
                <label>Network Fee: {gasCost} WEI</label>

                <button type="submit">Create</button>
                {message && <p>{message}</p>}
            </form>
        </div>
    );
};

export default SendForm;