import { Dispatch, SetStateAction } from "react";
import { NextRouter } from "next/router";
import { customFetch } from "../custom_fetch";
import { Imeal } from "@/redux/slices/select_meal";

export function get_meals(
    router: NextRouter,
    set_meal: Dispatch<SetStateAction<Imeal[]>>
) {
    var myHeaders = new Headers();
    const access_token = localStorage.getItem("access_token") || "";
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Access-Control-Allow-Origin", "http://localhost:8000");
    myHeaders.append("Access-Control-Allow-Credentials", "true");
    myHeaders.append("Authorization", "Bearer " + access_token);

    var requestOptions = {
        method: "GET",
        headers: myHeaders,
    };

    let custom_fetch = new customFetch(requestOptions, router);
    custom_fetch
        .fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/v1/meals`)
        .then((response: any) => {
            if (!response.detail) {
                var meals: Imeal[] = [];
                for (let i = 0; i < response.length; i++) {
                    meals.push({
                        id: response[i]._id,
                        name: response[i].name,
                        ingredients: response[i].ingredients,
                        created_at: response[i].created_at
                            ? response[i].created_at
                            : "none",
                        servings: 0,
                    });
                }

                set_meal(meals);
            }
        })
        .catch((error: any) => console.log("error"));
}

export function get_meals_with_empty_meal(
    router: NextRouter,
    set_meal: Dispatch<SetStateAction<Imeal[]>>
) {
    var myHeaders = new Headers();
    const access_token = localStorage.getItem("access_token") || "";
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Access-Control-Allow-Origin", "http://localhost:8000");
    myHeaders.append("Access-Control-Allow-Credentials", "true");
    myHeaders.append("Authorization", "Bearer " + access_token);

    var requestOptions = {
        method: "GET",
        headers: myHeaders,
    };

    let custom_fetch = new customFetch(requestOptions, router);
    custom_fetch
        .fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/v1/meals`)
        .then((response: any) => {
            if (!response.detail) {
                var meals: any[] = [{ value: "", label: "Rien", id: "" }];
                for (let i = 0; i < response.length; i++) {
                    meals.push({
                        value: response[i].name,
                        label: response[i].name,
                        id: response[i]._id,
                    });
                }

                set_meal(meals);
            }
        })
        .catch((error: any) => console.log(error));
}

export function get_meals_count(
    router: NextRouter,
    set_count_meal: Dispatch<SetStateAction<number>>
) {
    var myHeaders = new Headers();
    const access_token = localStorage.getItem("access_token") || "";
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Access-Control-Allow-Origin", "http://localhost:8000");
    myHeaders.append("Access-Control-Allow-Credentials", "true");
    myHeaders.append("Authorization", "Bearer " + access_token);

    var requestOptions = {
        method: "GET",
        headers: myHeaders,
    };

    let custom_fetch = new customFetch(requestOptions, router);
    custom_fetch
        .fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/v1/meals`)
        .then((response: { detail: any; length: SetStateAction<number> }) => {
            if (!response.detail) {
                set_count_meal(response.length);
            }
        })
        .catch((error: any) => console.log(error));
}
