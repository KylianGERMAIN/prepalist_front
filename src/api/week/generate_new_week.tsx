import { Dispatch, SetStateAction } from "react";
import { NextRouter } from "next/router";
import { customFetch } from "../custom_fetch";
import { IDay } from "./get_week";

export async function generate_my_week(
    router: NextRouter,
    set_my_week: Dispatch<SetStateAction<IDay[]>>,
    set_meal_lunch: Dispatch<
        SetStateAction<{ value: string; label: string }[]>
    >,
    set_meal_dinner: Dispatch<
        SetStateAction<{ value: string; label: string }[]>
    >,
    set_meal_serving: Dispatch<SetStateAction<any>>
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
    let custom_fetch = new customFetch(requestOptions, router);
    custom_fetch
        .fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/v1/week/generate`)
        .then(async (response) => {
            if (!response.detail) {
                var week: IDay[] = response;
                await set_my_week(week);
                var meal_lunch = [];
                var meal_dinner = [];
                var meal_serving = [];
                for (let i = 0; i < week.length; i++) {
                    meal_lunch.push({
                        value: week[i].lunch.name,
                        label: week[i].lunch.name,
                        id: week[i].lunch.id,
                    });
                    meal_dinner.push({
                        value: week[i].dinner.name,
                        label: week[i].dinner.name,
                        id: week[i].dinner.id,
                    });
                    meal_serving.push({
                        lunch: week[i].lunch.serving,
                        dinner: week[i].lunch.serving,
                    });
                }
                set_meal_lunch(meal_dinner);
                set_meal_dinner(meal_lunch);
                set_meal_serving(meal_serving);
            }
        })
        .catch((error) => console.log(error));
}
