import { Dispatch, SetStateAction } from "react";
import { NextRouter, useRouter } from "next/router";
import { IMeal } from "./get_meals";

export function delete_meal(
    listMeal: IMeal[],
    id: string,
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
        method: "DELETE",
        headers: myHeaders,
    };

    fetch(process.env.NEXT_PUBLIC_URL_API + `/meal/${id}`, requestOptions)
        .then(async (response) => {
            if (response.status != 202) {
                response.json().then((json) => {
                    if (json.detail == "Invalid token") {
                        localStorage.removeItem("access_token");
                        router.push("/login");
                    }
                });
            } else {
                setMeal(listMeal.filter((item) => item.id !== id));
            }
        })
        .catch((error) => console.log(error));
}
