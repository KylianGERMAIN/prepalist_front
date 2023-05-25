import { get_meal_perso } from "@/api/meal/get_meal";
import { IDay } from "@/api/week/get_week";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import {
    selectMeal,
    IMeal,
    setActualMeal,
    resetSelectMeal,
} from "@/redux/slices/SelectMeal";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction } from "react";
import { MdLunchDining, MdDinnerDining } from "react-icons/md";

export function CardCategorie({ name_category }: { name_category: string }) {
    if (name_category == "Déjeuner")
        return (
            <div className="card_categorie_lunch__container">
                <MdLunchDining size={"19px"} color="#5686E1" />
                <span>{name_category}</span>
            </div>
        );
    else
        return (
            <div className="card_categorie_dinner__container">
                <MdDinnerDining size={"19px"} color="#EE7353" />
                <span>{name_category}</span>
            </div>
        );
}

export function Card_Day({
    day,
    day_of_week,
    setMealViewModal,
}: {
    day: IDay;
    day_of_week: string;
    setMealViewModal: Dispatch<SetStateAction<boolean>>;
}) {
    var date = new Date(day.date.split(" ")[0]);
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
                <h2 className="day_of_week__text">{day_of_week}</h2>
                <div
                    className="meal__container"
                    onClick={async (e) => {
                        dispatch(resetSelectMeal(select_meal));
                        _setActualMeal(day.lunch as IMeal);
                        setMealViewModal(true);
                        dispatch(get_meal_perso(router, day.lunch.id));
                    }}
                >
                    <span className="date__text">{french_date}</span>
                    <CardCategorie name_category="Déjeuner" />
                    <span className="name_meal__text">{day.lunch.name}</span>
                </div>
                <div
                    className="meal__container"
                    onClick={async (e) => {
                        dispatch(resetSelectMeal(select_meal));
                        _setActualMeal(day.dinner as IMeal);
                        setMealViewModal(true);
                        dispatch(get_meal_perso(router, day.dinner.id));
                    }}
                >
                    <span className="date__text">{french_date}</span>
                    <CardCategorie name_category="Diner" />
                    <span className="name_meal__text">{day.dinner.name}</span>
                </div>
            </div>
        </div>
    );
}
