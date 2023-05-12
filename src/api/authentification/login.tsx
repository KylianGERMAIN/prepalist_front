import { Dispatch, SetStateAction } from "react";
import { NextRouter, useRouter } from "next/router";
import { asignError } from "./register";
import { customFetch } from "../custom_fetch";

export function login(
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
        .fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/v1/login`)
        .then((response: any) => {
            if (!response.detail) {
                localStorage.setItem("access_token", response.access_token);
                localStorage.setItem("refresh_token", response.refresh_token);
                router.push("/home");
            } else {
                asignError(response, setError);
            }
        })
        .catch((error: any) =>
            asignError({ detail: "Error fill in the form correctly" }, setError)
        );
}
