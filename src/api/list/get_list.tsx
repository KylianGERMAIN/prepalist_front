import { Dispatch, SetStateAction } from "react";
import { NextRouter } from "next/router";
import { customFetch } from "../custom_fetch";

export interface IIngredient {
    ingredient: string;
}

export function get_list(
    router: NextRouter,
    setList: Dispatch<SetStateAction<IIngredient[]>>
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
        .fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/v1/list`)
        .then((response: any) => {
            if (!response.detail) {
                setList(response.ingredients);
            }
        })
        .catch((error: any) => console.log(error));
}
