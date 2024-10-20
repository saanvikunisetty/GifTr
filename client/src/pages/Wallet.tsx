import { SetStateAction, useEffect, useState } from 'react';
import Card from '@/Card';
import './../styles/Wallet.css';
import { useCurrentAccount } from '@mysten/dapp-kit';

function Wallet() {
    const [cards, setCards] = useState([<p>Loading...</p>]);
    const [type, setType] = useState('');
    const [value, setValue] = useState(0);
    const [desired, setDesired] = useState('');
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
                for (var i = 0; i < json.length; i++) {
                    const card = json[i];
                    list.push(
                        <Card type={card.type} value={card.value} />
                    )
                }
                setCards(list);
            });
    }, []);

    return (
        <div id="wallet">
            <h1>My Wallet</h1>
            <div id="card-container">
                {cards}
            </div>
            <br />
            <h2>Add Card:</h2>
            <form className="add-card">
                <h3>Enter Card Type:</h3>
                <input type="radio" name="type" onClick={() => setType('Amazon')}/>
                <label>Amazon</label><br/>
                <input type="radio" name="type" onClick={() => setType('AMC')}/>
                <label>AMC</label><br/>
                <input type="radio" name="type" onClick={() => setType('Target')}/>
                <label>Target</label><br/>
                <input type="radio" name="type" onClick={() => setType('H&M')}/>
                <label>H&M</label>
            </form>
            <form id="add-card-value" className="add-card">
                <h3>Enter Value:</h3>
                <input type="radio" name="value" onClick={() => setValue(25)}/>
                <label>$25</label><br/>
                <input type="radio" name="value" onClick={() => setValue(50)}/>
                <label>$50</label><br/>
                <input type="radio" name="value" onClick={() => setValue(100)}/>
                <label>$100</label><br/>
            </form>
            <form className="add-card">
                <h3>Enter Desired Card:</h3>
                <input type="radio" name="desired" onClick={() => setDesired('Amazon')}/>
                <label>Amazon</label><br/>
                <input type="radio" name="desired" onClick={() => setDesired('AMC')}/>
                <label>AMC</label><br/>
                <input type="radio" name="desired" onClick={() => setDesired('Target')}/>
                <label>Target</label><br/>
                <input type="radio" name="desired" onClick={() => setDesired('H&M')}/>
                <label>H&M</label>
            </form>
            <br />
            <button id="add-card-button" onClick={() => {
                if (type != null && value != null && desired != null) {
                    alert('hi');
                    fetch('http://localhost:3000/api/cards/add', {
                        method: 'post',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            type: type,
                            value: value,
                            owner: account?.label,
                            desired: desired,
                        })
                    })
                        .then(response => response.json())
                        .then(json => {
                            alert(JSON.stringify(json));
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
                const type_buttons = document.getElementsByName('type');
                for (var i = 0; i < type_buttons.length; i++) {
                    const button = type_buttons[i] as HTMLInputElement;
                    button.checked = false;
                }
                const value_buttons = document.getElementsByName('value');
                for (var i = 0; i < value_buttons.length; i++) {
                    const button = value_buttons[i] as HTMLInputElement;
                    button.checked = false;
                }
                const desired_buttons = document.getElementsByName('desired');
                for (var i = 0; i < desired_buttons.length; i++) {
                    const button = desired_buttons[i] as HTMLInputElement;
                    button.checked = false;
                }
                setType('');
                setValue(0);
            }}>Add Card</button>
        </div>
    );
}

export default Wallet;