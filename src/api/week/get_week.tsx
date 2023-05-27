import { NextRouter } from "next/router";
import { customFetch } from "../custom_fetch";
import { Iday, Iweek, set_week } from "@/redux/slices/week";

export function get_week(router: NextRouter) {
    return (
        dispatch: (arg0: { payload: Iweek; type: "week/set_week" }) => void
    ) => {
        const access_token = localStorage.getItem("access_token") || "";
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append(
            "Access-Control-Allow-Origin",
            "http://localhost:8000"
        );
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
                    dispatch(set_week({ week: response.date }));
                }
            })
            .catch((error: any) => console.log(error));
    };
}
