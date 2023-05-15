import { get_meal } from "@/api/meal/get_meal";
import { IMeal } from "@/api/meal/get_meals";
import router from "next/router";
import React, { use, useEffect, useState } from "react";

interface PropsModal {
    meal: { name: ""; id: "" };
    router: any;
}

export default function View_meal_modal({ meal }: PropsModal) {
    const [listMeal, setMeal] = useState<IMeal>({
        id: "",
        name: "",
        ingredients: [],
    });

    useEffect(() => {
        if (meal.id) get_meal(router, setMeal, meal.id);
    }, [meal.id]);

    function CreateListIngredients(): any {
        var list = [];
        for (let i = 0; i < listMeal.ingredients.length; i++) {
            list.push(<li key={i}>{listMeal.ingredients[i].ingredient}</li>);
        }
        return <>{list}</>;
    }

    return (
        <div className="view_meal__container">
            {listMeal.ingredients.length >= 1 ? (
                <>
                    <div className="view_meal__title">
                        <span>{meal.name}</span>
                    </div>
                    <div>
                        <div className="view_meal_ingredients__title">
                            <span>Ingredients</span>
                        </div>
                        <ul>
                            <CreateListIngredients />
                        </ul>
                    </div>
                </>
            ) : null}
        </div>
    );
}
