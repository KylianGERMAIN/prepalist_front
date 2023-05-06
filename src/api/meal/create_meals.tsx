import { Dispatch, SetStateAction } from "react";
import { NextRouter, useRouter } from "next/router";
import { IMeal } from "./get_meals";
import { asignError } from "../authentification/register";

export function create_meals(
    meal: IMeal,
    setModal: Dispatch<SetStateAction<boolean>>,
    setMeal: Dispatch<SetStateAction<IMeal[]>>,
    router: NextRouter,
    setError: Dispatch<SetStateAction<string>>
) {
    var myHeaders = new Headers();
    const access_token = localStorage.getItem("access_token") || "";
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Access-Control-Allow-Origin", "http://localhost:8000");
    myHeaders.append("Access-Control-Allow-Credentials", "true");
    myHeaders.append("Authorization", "Bearer " + access_token);

    var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(meal),
    };

    fetch(process.env.NEXT_PUBLIC_URL_API + "/meal", requestOptions)
        .then(async (response) => {
            if (response.status != 201) {
                response.json().then((json) => {
                    asignError(json, setError);
                    if (json.detail == "Invalid token") {
                        localStorage.removeItem("access_token");
                        router.push("/login");
                    }
                });
            } else {
                response.json().then((json) => {
                    setMeal((meal) => [...meal, json]);
                    setModal(false);
                });
            }
        })
        .catch((error) => console.log(error));
}
