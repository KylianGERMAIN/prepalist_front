import { Dispatch, SetStateAction } from "react";
import { NextRouter, useRouter } from "next/router";

export interface IMeal {
    id: string;
    name: string;
    ingredients: { ingredient: string }[];
    created_at?: string;
}

export function get_meals(
    router: NextRouter,
    setMeal: Dispatch<SetStateAction<IMeal[]>>
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

    fetch("http://127.0.0.1:8000/meals", requestOptions)
        .then(async (response) => {
            if (response.status != 200) {
                response.json().then((json) => {
                    if (json.detail == "Invalid token") {
                        localStorage.removeItem("access_token");
                        router.push("/login");
                    }
                });
            } else {
                response.json().then((json) => {
                    var meals: IMeal[] = [];
                    for (let i = 0; i < json.length; i++) {
                        meals.push({
                            id: json[i]._id,
                            name: json[i].name,
                            ingredients: json[i].ingredients,
                            created_at: json[i].created_at
                                ? json[i].created_at
                                : "none",
                        });
                    }
                    setMeal(meals);
                });
            }
        })
        .catch((error) => console.log(error));
}

export function get_meals_count(
    router: NextRouter,
    setCountMeal: Dispatch<SetStateAction<number>>
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

    fetch("http://127.0.0.1:8000/meals", requestOptions)
        .then(async (response) => {
            if (response.status != 200) {
                response.json().then((json) => {
                    if (json.detail == "Invalid token") {
                        localStorage.removeItem("access_token");
                        router.push("/login");
                    }
                });
            } else {
                response.json().then((json) => {
                    setCountMeal(json.length);
                    return json.length;
                });
            }
        })
        .catch((error) => console.log(error));
}
