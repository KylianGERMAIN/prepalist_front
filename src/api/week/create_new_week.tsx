import { Dispatch, SetStateAction } from "react";
import { NextRouter } from "next/router";
import { customFetch } from "../custom_fetch";
import { IDay } from "./get_week";

export async function create_my_week(
    router: NextRouter,
    set_my_week: Dispatch<SetStateAction<IDay[]>>,
    meal_lunch: any,
    meal_dinner: any,
    meal_serving: any,
    my_week: IDay[],
    set_modal: Dispatch<SetStateAction<boolean>>
) {
    const access_token = localStorage.getItem("access_token") || "";
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Access-Control-Allow-Origin", "http://localhost:8000");
    myHeaders.append("Access-Control-Allow-Credentials", "true");
    myHeaders.append("Authorization", "Bearer " + access_token);
    for (var i = 0; my_week.length > i; i++) {
        my_week[i].lunch.name = meal_lunch[i].value;
        my_week[i].dinner.name = meal_dinner[i].value;
        my_week[i].lunch.id = meal_lunch[i].id;
        my_week[i].dinner.id = meal_dinner[i].id;
        my_week[i].lunch.serving = meal_serving[i].lunch;
        my_week[i].dinner.serving = meal_serving[i].dinner;
    }
    var new_week = { week: my_week };
    var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(new_week),
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
