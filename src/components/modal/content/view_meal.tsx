import { useAppSelector } from "@/redux/hook";
import { select_meal } from "@/redux/slices/select_meal";
import React from "react";

const View_meal_modal: React.FC = (props) => {
    const _select_meal = useAppSelector(select_meal);

    return (
        <div className="view_meal__container">
            {_select_meal.ingredients.length >= 1 ? (
                <>
                    <div className="view_meal__title">
                        <span>{_select_meal.name} </span>
                    </div>
                    <div>
                        <div className="view_meal_ingredients__title">
                            <span>Ingredients</span>
                        </div>
                        <ul>
                            {_select_meal.ingredients.map(
                                (
                                    ingredient: { ingredient: string },
                                    key: number
                                ) => (
                                    <li key={key}>{ingredient.ingredient}</li>
                                )
                            )}
                        </ul>
                    </div>
                </>
            ) : null}
        </div>
    );
};

export default View_meal_modal;
