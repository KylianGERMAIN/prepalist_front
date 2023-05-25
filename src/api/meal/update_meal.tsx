import { Dispatch, SetStateAction } from "react";
import { NextRouter } from "next/router";
import { customFetch } from "../custom_fetch";
import { IMeal } from "@/redux/slices/SelectMeal";

export function update_meal(
    meal: IMeal,
    setModal: Dispatch<SetStateAction<boolean>>,
    setMeal: Dispatch<SetStateAction<IMeal[]>>,
    router: NextRouter,
    setError: Dispatch<SetStateAction<string>>,
    listMeal: IMeal[]
) {
    var myHeaders = new Headers();
    const access_token = localStorage.getItem("access_token") || "";
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Access-Control-Allow-Origin", "http://localhost:8000");
    myHeaders.append("Access-Control-Allow-Credentials", "true");
    myHeaders.append("Authorization", "Bearer " + access_token);

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
                let index = listMeal.findIndex((m) => m.id === meal.id);
                let newArr = [...listMeal];
                newArr[index] = meal;
                setMeal(newArr);
                setModal(false);
            }
        })
        .catch((error: any) => console.log(error));
}
