import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import "./SendForm.css";
import { useWallets } from "@web3-onboard/react";

import { ethers } from "ethers";
import { getContract, handleError } from "../../helpers";

interface ConnectedWallet {
    accounts: { address: string }[];
}

const SendForm: React.FC = () => {
    const connectedWallets = useWallets();

    const [sendTo, setSendTo] = useState<string>("");
    const [amount, setAmount] = useState<number>(0);
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
        if (!connectedWallets || !sendTo || !amount) return;
        const contract = getContract(connectedWallets);

        contract.estimateGas.transfer(sendTo, amount).then((_gasCost) => {
            console.log(_gasCost.toString());
            setGasCost(_gasCost.toString());
        });
    }, [connectedWallets, sendTo, amount]);

    const handleSendToChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSendTo(e.target.value);
    };

    const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
        setAmount(Number(e.target.value));
    };

    const handleSend = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const contract = getContract(connectedWallets);
        contract
            .transfer(sendTo, amount)
            .then((res: any) => {
                return res.wait();
            })
            .then((res: any) => {
                if (res.status === 1) {
                    showMessage("Success!");
                }

                if (res.status === 0) {
                    showMessage("Failed!");
                }
            })
            .catch((err: any) => {
                showMessage(err.message);
            });
    };

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
                <h3>Transfer to:</h3>
                <div className="form-group">
                    <label htmlFor="sendTo">Send to:</label>
                    <input
                        type="text"
                        id="sendTo"
                        placeholder="Contract address"
                        value={sendTo}
                        onChange={handleSendToChange}
                        pattern="^0x[a-z0-9]*$"
                        title="Contract address"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="amount">Amount:</label>
                    <input
                        type="number"
                        id="amount"
                        placeholder="Amount to"
                        value={amount}
                        onChange={handleAmountChange}
                        min="1"
                        max="1"
                        required
                    />
                </div>
                <label>Network Fee: {gasCost} WEI</label>

                <button type="submit">Send</button>
                {message && <p>{message}</p>}
            </form>
        </div>
    );
};

export default SendForm;