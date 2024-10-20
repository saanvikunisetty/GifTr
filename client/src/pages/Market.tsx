import { useEffect, useState } from "react";
import Card from "@/Card";
import './../styles/Market.css';
import { useCurrentAccount } from "@mysten/dapp-kit";

function Market() {
    const [cards, setCards] = useState([<p>There Are No Possible Trades.</p>]);
    const [owned, setOwned] = useState([<option value="">Select</option>]);
    const account = useCurrentAccount();

    useEffect(() => {
        fetch('http://localhost:3000/api/cards/get', {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                user: account?.label
            })
        })
            .then(response => response.json())
            .then(json => {
                const list = [];
                list.push(
                    <option value="">Select</option>
                );
                for (var i = 0; i < json.length; i++) {
                    const card = json[i];
                    list.push(
                        <option value={card.id}>{card.type}: ${card.value}</option>
                    )
                }
                setOwned(list);
            });
    }, []);

    return (
        <div id="market">
            <h1>The Market</h1>
            <h3>Select a Card to Trade:</h3>
            <select name="cards" id="owned-cards" onChange={e => {
                const value = e.target.value;
                if (value != "") {
                    // fetch cards, push to array of Card component with trade onClick, use setCards to change state 
                    fetch('http://localhost:3000/api/cards/search', {
                        method: 'post',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            id: value
                        })
                    })
                        .then(response => response.json())
                        .then(json => {
                            const list = [];
                            for (var i = 0; i < json.length; i++) {
                                const card = json[i];
                                list.push(
                                    <Card type={card.type} value={card.value} />
                                )
                            }
                            setCards(list);
                        });
                }
            }}>
                { owned }
            </select>
            <br />
            <br />
            <div id="card-container">
                {cards}
            </div>
        </div>
    );
}

export default Market;