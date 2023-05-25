import { Dispatch, SetStateAction } from "react";
import { NextRouter } from "next/router";
import { customFetch } from "../custom_fetch";
import { IMeal } from "@/redux/slices/SelectMeal";

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

    let custom_fetch = new customFetch(requestOptions, router);
    custom_fetch
        .fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/v1/meal/${id}`)
        .then((response: any) => {
            if (!response.detail) {
                setMeal(listMeal.filter((item) => item.id !== id));
            }
        })
        .catch((error: any) => console.log(error));
}
