import { Dispatch, SetStateAction } from "react";
import { NextRouter } from "next/router";
import { customFetch } from "../custom_fetch";
import { Imeal } from "@/redux/slices/select_meal";

export function update_meal(
    meal: Imeal,
    set_modal: Dispatch<SetStateAction<boolean>>,
    set_list_meal: Dispatch<SetStateAction<Imeal[]>>,
    router: NextRouter,
    list_meal: Imeal[]
) {
    var myHeaders = new Headers();
    const access_token = localStorage.getItem("access_token") || "";
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Access-Control-Allow-Origin", "http://localhost:8000");
    myHeaders.append("Access-Control-Allow-Credentials", "true");
    myHeaders.append("Authorization", "Bearer " + access_token);

    var new_ingredients = [];
    for (var key in meal.ingredients) {
        if (meal.ingredients[key].ingredient != "")
            new_ingredients.push({
                ingredient: meal.ingredients[key].ingredient,
            });
    }
    meal = {
        ...meal,
        ingredients: new_ingredients,
    };

    var requestOptions = {
        method: "PUT",
        headers: myHeaders,
        body: JSON.stringify(meal),
    };

    let custom_fetch = new customFetch(requestOptions, router);
    custom_fetch
        .fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/v1/meal/${meal.id}`)
        .then((response: any) => {
            if (!response.detail) {
                let index = list_meal.findIndex((m) => m.id === meal.id);
                let newArr = [...list_meal];
                newArr[index] = meal;
                set_list_meal(newArr);
                set_modal(false);
            }
        })
        .catch((error: any) => console.log(error));
}
