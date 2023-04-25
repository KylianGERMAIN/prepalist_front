import { Dispatch, SetStateAction } from "react";
import { NextRouter, useRouter } from "next/router";
import { asignError } from "./register";

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

    fetch("http://127.0.0.1:8000/login", requestOptions)
        .then(async (response) => {
            console.log(response);
            if (response.status != 200) {
                response.json().then((json) => {
                    asignError(json, setError);
                });
            } else {
                response.json().then((json) => {
                    console.log(json);
                    localStorage.setItem("access_token", json.access_token);
                    localStorage.setItem("refresh_token", json.refresh_token);
                    router.push("/home");
                });
            }
        })
        .catch((error) =>
            asignError({ detail: "Error fill in the form correctly" }, setError)
        );
}
