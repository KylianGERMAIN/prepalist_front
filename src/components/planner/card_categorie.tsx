import { MdLunchDining, MdDinnerDining } from "react-icons/md";

interface Icard_category {
    name_category: string;
}

const Card_category: React.FC<Icard_category> = (props) => {
    if (props.name_category == "Déjeuner")
        return (
            <div className="card_categorie_lunch__container">
                <MdLunchDining size={"19px"} color="#5686E1" />
                <span>{props.name_category}</span>
            </div>
        );
    else
        return (
            <div className="card_categorie_dinner__container">
                <MdDinnerDining size={"19px"} color="#EE7353" />
                <span>{props.name_category}</span>
            </div>
        );
};

export default Card_category;
