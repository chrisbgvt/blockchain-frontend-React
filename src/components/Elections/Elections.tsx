import React, { useEffect, useState } from "react";
// import "./SendForm.css";
import { useWallets } from "@web3-onboard/react";

import { ethers } from "ethers";
import { getContract, useElectionContract, handleError } from "../../helpers";
import Election from "./Election/Election";

interface ConnectedWallet {
	accounts: { address: string }[];
}

const Elections: React.FC = () => {
	const connectedWallets = useWallets();
	const { contracts, loading, electionId } = useElectionContract(connectedWallets);

	// const [electionId, setElectionId] = useState<number>(0);
	const [electionss, setElections] = useState<any[]>([]);
	const [message, setMessage] = useState<string | null>(null);

	useEffect(() => {
		if (loading == false) {
			fetchProposalData();
		}

	}, [contracts, loading, electionId]);


	const fetchProposalData = async () => {
		try {
			const promises = contracts.map(async (x, index) => {
				const proposalCount = await x?.getProposalCount();
				const proposals = [];
				for (let i = 0; i < proposalCount; i++) {
					const proposal = await x?.proposals(i);
					proposals.push(proposal);
				}
				const endDate = await x?.endDate();
				let winnerName = '';
				try {
					winnerName = await x?.winnerName();
				} catch (error) {
					winnerName = handleError(error);
				}
	
				return { proposals, endDate, winnerName };
			});
			const results = await Promise.all(promises);
			setElections(results);
		} catch (error) {
			setMessage(handleError(error));
		}
	};

	const showMessage = (message: string) => {
		setMessage(message);
		setTimeout(() => {
			setMessage(null);
		}, 1000 * 3);
	}

	return (
		<div className="form-wrapper">
			{electionss.length > 0 
				? electionss.map((x, index) => <Election key={index} nameElection={x.proposals.toString()} endDate={x.endDate.toNumber()} winnerName={x.winnerName.toString()} /> )
				: <h2>No elections yet</h2>
			}
			{message && <p>{message}</p>}
		</div>
	);
};

export default Elections;
