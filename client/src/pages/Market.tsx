import { useState } from "react";
import Card from "@/Card";
import './../styles/Market.css';

function Market() {
    const [cards, setCards] = useState([<p>There Are No Possible Trades.</p>]);
    const [owned, setOwned] = useState([<option value="">Select</option>]);

    // fetch owned, push to array of option

    return (
        <div id="market">
            <h1>The Market</h1>
            <h3>Select a Card to Trade:</h3>
            <select name="cards" id="owned-cards" onChange={e => {
                const value = e.target.value;
                if (value != "") {
                    // fetch cards, push to array of Card component with trade onClick, use setCards to change state 
                }
            }}>
                { owned }
            </select>
            <br />
            <br />
            { cards }
        </div>
    );
}

export default Market;