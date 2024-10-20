import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDisconnectWallet, useCurrentAccount } from "@mysten/dapp-kit";
import Logo from "./../images/Logo.png";
import "./../styles/Layout.css";

function Layout() {

    const location = useLocation();
    const navigate = useNavigate();
    const { mutate: disconnect } = useDisconnectWallet();
    const account = useCurrentAccount();

    return (
        <>
            { 
                (location.pathname.substring(1).toUpperCase() == "MARKET" || 
                location.pathname.substring(1).toUpperCase() == "WALLET") &&
                <>
                    <div id="navbar">
                        <img id="logo" src={Logo} alt=""/>
                        <button className="link" onClick={() => {navigate("/market")}}>Market</button>
                        <button className="link" onClick={() => {navigate("/wallet")}}>Wallet</button>
                        <button id="logout" onClick={() => {
                            disconnect();
                            navigate("/login");
                        }}>Log Out</button>
                    </div>
                    <div id="navbar-space" />
                    { account && <p id="account">Account: {account.address}</p>}
                </>
            }
            <Outlet />
            <p id="footer">Made With ♥️ During CalHacks 11.0</p>
        </>
    );
}

export default Layout;