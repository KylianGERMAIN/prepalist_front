import { NextRouter } from "next/router";
import { customFetch } from "../custom_fetch";
import { set_generate_week } from "@/redux/slices/generate_week";
import { Iweek } from "@/redux/slices/week";

export const generate_my_week = (router: NextRouter) => {
    return (
        dispatch: (arg0: {
            payload: Iweek;
            type: "generate_week/set_generate_week";
        }) => void
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
            .fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/v1/week/generate`)
            .then(async (response) => {
                if (!response.detail) {
                    dispatch(set_generate_week({ week: response }));
                }
            })
            .catch((error) => console.log(error));
    };
};
