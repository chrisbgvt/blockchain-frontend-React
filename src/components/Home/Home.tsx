import ChainModal from "../ChainModal/ChainModal";
import SendForm from '../SendForm/SendForm';
import CreateElection from '../CreateElection/CreateElection';

interface HomeProps {
    wallet: any;
    handleDisconnect: any;
    connecting: any;
    connect: any;
}

const Home: React.FC<HomeProps> = ({wallet, handleDisconnect, connecting, connect}) => {

    return (
        <div>
            {wallet 
                ? 
                <>
                    <ChainModal onDisconnect={handleDisconnect} />
                    <SendForm />
                    <CreateElection />
                </>
                : 
                <>
                    <ChainModal onDisconnect={handleDisconnect} />
                    <button
                        className="disconnect-button"
                        disabled={connecting}
                        onClick={() => connect()}
                    >
                        {connecting ? "connecting" : "connect"}
                    </button>
                </>
            }
        </div>
    );
}

export default Home;
