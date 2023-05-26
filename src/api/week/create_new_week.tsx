import { Dispatch, SetStateAction } from "react";
import { NextRouter } from "next/router";
import { customFetch } from "../custom_fetch";
import { Iday, Iweek } from "@/redux/slices/week";

export async function create_my_week(
    router: NextRouter,
    set_my_week: Dispatch<SetStateAction<Iday[]>>,
    _week: Iweek,
    set_modal: Dispatch<SetStateAction<boolean>>
) {
    const access_token = localStorage.getItem("access_token") || "";
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Access-Control-Allow-Origin", "http://localhost:8000");
    myHeaders.append("Access-Control-Allow-Credentials", "true");
    myHeaders.append("Authorization", "Bearer " + access_token);

    var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(_week),
    };
    let custom_fetch = new customFetch(requestOptions, router);
    custom_fetch
        .fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/v1/week`)
        .then((response) => {
            if (!response.detail) {
                var week: any = response;
                set_my_week(week.week);
                set_modal(false);
            }
        })
        .catch((error) => console.log(error));
}
