import { Dispatch, SetStateAction } from "react";
import { NextRouter, useRouter } from "next/router";

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

    fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/v1/list`, requestOptions)
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
                    setList(json.ingredients);
                });
            }
        })
        .catch((error) => console.log(error));
}
