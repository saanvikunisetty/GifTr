import Amazon from './images/Amazon.png';
import AMC from './images/AMC.png';
import Target from './images/Target.png';
import HM from './images/HM.png';
import './styles/Card.css';

interface  CardProps {
    type: string,
    value: number
}

function Card(props: CardProps) {
    return (
        <div id="card">
            {
                props.type === "Amazon" &&
                <img id="card-image" src={Amazon} alt=""/>
            }
            {
                props.type === "AMC" &&
                <img id="card-image" src={AMC} alt=""/>
            }
            {
                props.type === "Target" &&
                <img id="card-image" src={Target} alt=""/>
            }
            {
                props.type === "H&M" &&
                <img id="card-image" src={HM} alt=""/>
            }
            <p id="card-title">{props.type}: ${props.value}</p>
        </div>
    );
}

export default Card;