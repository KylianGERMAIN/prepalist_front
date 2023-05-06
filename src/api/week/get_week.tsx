import { Dispatch, SetStateAction } from "react";
import { NextRouter, useRouter } from "next/router";

export interface IDay {
    date: string;
    lunch: { name: string; id: string };
    dinner: { name: string; id: string };
}

export function get_week(
    router: NextRouter,
    setMy_week: Dispatch<SetStateAction<IDay[]>>
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

    fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/v1/week`, requestOptions)
        .then(async (response) => {
            if (response.status != 200) {
                response.json().then((json) => {
                    if (json.detail == "Invalid token") {
                        localStorage.removeItem("access_token");
                        router.push("/login");
                    }
                });
            } else {
                response.json().then((json) => {
                    var week: IDay[] = json.date;
                    setMy_week(week);
                    return week;
                });
            }
        })
        .catch((error) => console.log(error));
}
