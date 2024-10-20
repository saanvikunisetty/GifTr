import { useEffect, useState } from "react";
import Card from "@/Card";
import './../styles/Market.css';
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useNavigate } from "react-router-dom";

function Market() {
    const [cards, setCards] = useState([<p>There Are No Possible Trades.</p>]);
    const [id, setId] = useState([-1]);
    const [owned, setOwned] = useState([<option value="">Select</option>]);
    const account = useCurrentAccount();
    const navigate = useNavigate();

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
                const idList = [];
                for (var i = 0; i < json.length; i++) {
                    const card = json[i];
                    idList.push(card.code);
                    list.push(
                        <option value={card.code}>{card.type}: ${card.value}</option>
                    );
                }
                setOwned(list);
                setId(idList);
            });
    }, []);

    return (
        <div id="market">
            <h1>The Market</h1>
            <h3>Select a Card to Trade:</h3>
            <select name="cards" id="owned-cards" onChange={e => {
                const dropdown = document.getElementById('owned-cards') as HTMLSelectElement;
                const value = dropdown.selectedIndex != 0 ? id[dropdown.selectedIndex - 1] : -1;
                if (value != -1) {
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
                                    <div className="hover" onClick={() => {
                                        fetch('http://localhost:3000/api/cards/trade', {
                                            method: 'post',
                                            headers: {'Content-Type': 'application/json'},
                                            body: JSON.stringify({
                                                sendingId: value,
                                                receivingId: card.code
                                            })
                                        });
                                        navigate('/wallet');
                                    }}>
                                        <Card type={card.type} value={card.value} />
                                    </div> 
                                )
                            }
                            if (list.length === 0) {
                                list.push(<p>There Are No Possible Trades.</p>);
                            }
                            setCards(list);
                        });
                } else {
                    setCards([<p>There Are No Possible Trades.</p>]);
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