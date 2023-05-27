import { Dispatch, SetStateAction } from "react";
import { NextRouter } from "next/router";
import { customFetch } from "../custom_fetch";
import { Imeal, set_actual_meal } from "@/redux/slices/select_meal";

export const get_meal = (router: NextRouter, id: string) => {
    return (
        dispatch: (arg0: {
            payload: Imeal;
            type: "select_meal/set_actual_meal";
        }) => void
    ) => {
        var myHeaders = new Headers();
        const access_token = localStorage.getItem("access_token") || "";
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
            .fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/v1/meal/${id}`)
            .then((response: any) => {
                if (!response.detail) {
                    dispatch(set_actual_meal(response));
                }
            })
            .catch((error: any) => console.log(error));
    };
};
