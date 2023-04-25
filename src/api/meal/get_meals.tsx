import { Dispatch, SetStateAction } from "react";
import { NextRouter, useRouter } from "next/router";

export function get_meals(router: NextRouter) {
    var myHeaders = new Headers();
    const access_token = localStorage.getItem("access_token") || "";
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Access-Control-Allow-Origin", "http://localhost:8000");
    myHeaders.append("Access-Control-Allow-Credentials", "true");
    myHeaders.append("Authorization", "Bearer " + access_token);

    var requestOptions = {
        method: "GET",
        headers: myHeaders,
    };

    fetch("http://127.0.0.1:8000/login", requestOptions)
        .then(async (response) => {
            console.log(response);
            if (response.status != 200) {
                response.json().then((json) => {
                    console.log(json);
                    if (json.detail == "Invalid token") {
                        localStorage.removeItem("access_token");
                        router.push("/login");
                    }
                });
            } else {
                response.json().then((json) => {});
            }
        })
        .catch((error) => console.log(error));
}
