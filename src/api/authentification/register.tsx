import { Dispatch, SetStateAction } from "react";
import { NextRouter, useRouter } from "next/router";

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

    fetch(process.env.NEXT_PUBLIC_URL_API + "/register", requestOptions)
        .then(async (response) => {
            if (response.status != 201) {
                response.json().then((json) => {
                    asignError(json, setError);
                });
            } else {
                response.json().then((json) => {
                    localStorage.setItem("access_token", json.access_token);
                    localStorage.setItem("refresh_token", json.refresh_token);
                    router.push("/home");
                });
            }
        })
        .catch((error) => console.log("error", error));
}
