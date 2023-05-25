import { Dispatch, SetStateAction } from "react";
import { NextRouter } from "next/router";
import { customFetch } from "../custom_fetch";

export interface IDay {
    date: string;
    lunch: { name: string; id: string; serving?: number };
    dinner: { name: string; id: string; serving?: number };
}

export function get_week(
    router: NextRouter,
    setMy_week: Dispatch<SetStateAction<IDay[]>>
) {
    const access_token = localStorage.getItem("access_token") || "";
    var myHeaders = new Headers();
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
        .fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/v1/week`)
        .then((response: { detail: any; date: IDay[] }) => {
            if (!response.detail) {
                var week: IDay[] = response.date;
                setMy_week(week);
            }
        })
        .catch((error: any) => console.log(error));
}
