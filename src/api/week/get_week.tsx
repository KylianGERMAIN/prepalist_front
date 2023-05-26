import { Dispatch, SetStateAction } from "react";
import { NextRouter } from "next/router";
import { customFetch } from "../custom_fetch";
import { Iday } from "@/redux/slices/week";

export function get_week(
    router: NextRouter,
    set_my_week: Dispatch<SetStateAction<Iday[]>>
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
        .then((response: { detail: any; date: Iday[] }) => {
            if (!response.detail) {
                var week: Iday[] = response.date;
                set_my_week(week);
            }
        })
        .catch((error: any) => console.log(error));
}
