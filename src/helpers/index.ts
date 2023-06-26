import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useWallets } from "@web3-onboard/react";

import { ELECTION_FACTORY_ABI, ELECTION_FACTORY_ADDRESS, ELECTION_ABI } from "../constants";

export function formatEthAddress(address: string): string {
    if (!address || address.length < 8) {
        return "";
    }

    const firstFive = address.slice(0, 5);
    const lastThree = address.slice(-3);

    return `${firstFive}...${lastThree}`;
}

export function getContract(connectedWallets: any[]): ethers.Contract {
    const injectedProvider = connectedWallets[0].provider;
    const provider = new ethers.providers.Web3Provider(injectedProvider);
    const signer = provider.getSigner();
    return new ethers.Contract(ELECTION_FACTORY_ADDRESS, ELECTION_FACTORY_ABI, signer);
}

export function useElectionContract(connectedWallets: any[]): {
    contracts: (ethers.Contract | null)[];
    loading: boolean;
    electionId: number;
    // elections: string;
} {
    const [electionId, setElectionId] = useState<number>(0);
    const [elections, setElections] = useState<string[]>([]);
    const [contracts, setContracts] = useState<(ethers.Contract | null)[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                const contract = getContract(connectedWallets);
                const electionId = await contract.electionId();

                const electionsPromises = Array.from({ length: electionId }, (_, index) =>
                    contract.elections(index)
                );
                const elections = await Promise.all(electionsPromises);

                if (connectedWallets.length > 0) {
                    const injectedProvider = connectedWallets[0].provider;
                    const provider = new ethers.providers.Web3Provider(injectedProvider);
                    const signer = provider.getSigner();

                    const contracts = elections.map(x =>
                        new ethers.Contract(x, ELECTION_ABI, signer)
                    );

                    setContracts(contracts);
                }
            } catch (error) {
                console.error('Error fetching contracts:', error);
            }
        };

        fetchContracts().then(() => setLoading(false));
    }, [connectedWallets]);

    return { contracts, loading, electionId };
}

export function handleError(error: any) {
    const errorMessage = (error as Error).toString();
    const regex = /reverted with reason string '(.*?)'/;
    const match = errorMessage.match(regex);
    const extractedMessage = match ? match[1] : errorMessage;
    return extractedMessage;
}