import { useAppSelector } from "@/redux/hook";
import { selectMeal } from "@/redux/slices/SelectMeal";
import React from "react";

const View_meal_modal: React.FC = (props) => {
    const select_meal = useAppSelector(selectMeal);

    return (
        <div className="view_meal__container">
            {select_meal.ingredients.length >= 1 ? (
                <>
                    <div className="view_meal__title">
                        <span>{select_meal.name} </span>
                    </div>
                    <div>
                        <div className="view_meal_ingredients__title">
                            <span>Ingredients</span>
                        </div>
                        <ul>
                            {select_meal.ingredients.map(
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
