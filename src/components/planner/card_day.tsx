import { get_meal_perso } from "@/api/meal/get_meal";
import { IDay } from "@/api/week/get_week";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction } from "react";
import CardCategory from "./card_categorie";
import {
    selectMeal,
    IMeal,
    setActualMeal,
    resetSelectMeal,
} from "@/redux/slices/SelectMeal";

interface ICardDay {
    day: IDay;
    day_of_week: string;
    setMealViewModal: Dispatch<SetStateAction<boolean>>;
}

const Card_Day: React.FC<ICardDay> = (props) => {
    var date = new Date(props.day.date.split(" ")[0]);
    var french_date = date.toLocaleDateString("fr-FR");
    const dispatch = useAppDispatch();
    const select_meal = useAppSelector(selectMeal);
    const router = useRouter();

    const _setActualMeal = (meal: IMeal) => {
        let new_meal = { ...meal, ingredients: [] };
        dispatch(setActualMeal(new_meal));
    };
    return (
        <div className="card-day__container">
            <div className="card-day__col">
                <h2 className="day_of_week__text">{props.day_of_week}</h2>
                <div
                    className="meal__container"
                    onClick={() => {
                        dispatch(resetSelectMeal(select_meal));
                        _setActualMeal(props.day.lunch as IMeal);
                        props.setMealViewModal(true);
                        dispatch(get_meal_perso(router, props.day.lunch.id));
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
                        dispatch(resetSelectMeal(select_meal));
                        _setActualMeal(props.day.dinner as IMeal);
                        props.setMealViewModal(true);
                        dispatch(get_meal_perso(router, props.day.dinner.id));
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

export default Card_Day;