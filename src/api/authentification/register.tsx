import { Dispatch, SetStateAction } from "react";
import { NextRouter } from "next/router";
import { customFetch } from "../custom_fetch";

export function asignError(
    response: { detail: string },
    setError: Dispatch<SetStateAction<string>>
) {
    if (response.detail) setError(response.detail);
}

export function register(
    username: string,
    email: string,
    password: string,
    setError: Dispatch<SetStateAction<string>>,
    router: NextRouter
) {
    setError("");
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Access-Control-Allow-Origin", "http://localhost:8000");
    myHeaders.append("Access-Control-Allow-Credentials", "true");

    var raw = JSON.stringify({
        username: username,
        email: email,
        password: password,
    });

    var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
    };

    let custom_fetch = new customFetch(requestOptions, router);
    custom_fetch
        .fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/v1/register`)
        .then((response: any) => {
            if (!response.detail) {
                localStorage.setItem("access_token", response.access_token);
                localStorage.setItem("refresh_token", response.refresh_token);
                router.push("/home");
            } else {
                asignError(response, setError);
            }
        })
        .catch((error: any) => console.log(error));
}
