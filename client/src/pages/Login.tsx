import { ConnectModal, useCurrentAccount } from "@mysten/dapp-kit";
import './../styles/Login.css'
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();
    const currentAccount = useCurrentAccount();

    if (currentAccount) {
        navigate('/market');
    }

    return (
        <>
            <h1 id="login-title">Welcome to Giftr</h1>
            <h2 id="login-subtitle">The Decentralized Gift Card Marketplace</h2>
            <ConnectModal
                trigger={
                    <button id="connect" disabled={!!currentAccount}> Connect to Sui Wallet</button>
                }
            />
        </>
    );
}

export default Login;