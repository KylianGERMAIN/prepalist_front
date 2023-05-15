import { get_meals } from "@/api/meal/get_meals";
import router from "next/router";
import React, { use, useEffect } from "react";

interface PropsModal {
    meal: { name: ""; id: "" };
    router: any;
}

export default function View_meal_modal({ meal }: PropsModal) {
    useEffect(() => {
        // get_meals(router, meal);
    }, [router]);

    return (
        <div className="view_meal__container">
            <div className="view_meal__title">
                <span>{meal.name}</span>
            </div>
            <div>
                <div className="view_meal_ingredients__title">
                    <span>Ingredients</span>
                </div>
                <ul>
                    <li>lol</li>
                    <li>lol</li>
                    <li>lol</li>
                    <li>lol</li>
                </ul>
            </div>
        </div>
    );
}
