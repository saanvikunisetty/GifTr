import { useState } from 'react';
import './../styles/Wallet.css';

function Wallet() {
    const [cards, setCards] = useState(<p>Loading...</p>);
    const [type, setType] = useState('');
    const [value, setValue] = useState(0);

    // fetch cards, push to array of Card component, use setCards to change state

    return (
        <div id="wallet">
            <h1>My Wallet</h1>
            {cards}
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
            <br />
            <br />
            <button id="add-card-button" onClick={() => {
                // add card
                // refresh cards with setCards
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
                setType('');
                setValue(0);
            }}>Add Card</button>
        </div>
    );
}

export default Wallet;