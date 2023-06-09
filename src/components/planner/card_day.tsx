import { get_meal } from "@/api/meal/get_meal";
import { useAppDispatch } from "@/redux/hook";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction } from "react";
import CardCategory from "./card_categorie";
import {
    Imeal,
    reset_select_meal,
    set_actual_meal,
} from "@/redux/slices/select_meal";
import { Iday } from "@/redux/slices/week";

interface ICardDay {
    day: Iday;
    day_of_week: string;
    set_meal_view_modal: Dispatch<SetStateAction<boolean>>;
}

const Card_day: React.FC<ICardDay> = (props) => {
    var date = new Date(props.day.date.split(" ")[0]);
    var french_date = date.toLocaleDateString("fr-FR");
    const dispatch = useAppDispatch();
    const router = useRouter();

    const _set_actual_meal = (meal: Imeal) => {
        let new_meal = { ...meal, ingredients: [] };
        dispatch(set_actual_meal(new_meal));
    };
    return (
        <div className="card-day__container">
            <div className="card-day__col">
                <h2 className="day_of_week__text">{props.day_of_week}</h2>
                <div
                    className="meal__container"
                    onClick={() => {
                        dispatch(reset_select_meal());
                        _set_actual_meal(props.day.lunch as Imeal);
                        props.set_meal_view_modal(true);
                        dispatch(
                            get_meal(
                                router,
                                props.day.lunch.id,
                                props.day.lunch.serving
                            )
                        );
                    }}
                >
                    <span className="date__text">{french_date}</span>
                    <CardCategory name_category="Déjeuner" />
                    <span className="name_meal__text">
                        {props.day.lunch.name}
                    </span>
                </div>
                <div
                    className="meal__container"
                    onClick={() => {
                        dispatch(reset_select_meal());
                        _set_actual_meal(props.day.dinner as Imeal);
                        props.set_meal_view_modal(true);
                        dispatch(
                            get_meal(
                                router,
                                props.day.dinner.id,
                                props.day.lunch.serving
                            )
                        );
                    }}
                >
                    <span className="date__text">{french_date}</span>
                    <CardCategory name_category="Diner" />
                    <span className="name_meal__text">
                        {props.day.dinner.name}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Card_day;
