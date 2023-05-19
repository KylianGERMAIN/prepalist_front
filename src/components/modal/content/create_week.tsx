import { get_meal } from "@/api/meal/get_meal";
import { IMeal, get_meals_with_empty_meal } from "@/api/meal/get_meals";
import { generate_my_week } from "@/api/week/generate_new_week";
import { IDay } from "@/api/week/get_week";
import { CardCategorie } from "@/pages/home";
import router from "next/router";
import React, {
    Dispatch,
    SetStateAction,
    use,
    useEffect,
    useState,
} from "react";
import { GiPerspectiveDiceSixFacesRandom } from "react-icons/gi";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import Select from "react-select";
import { create_my_week } from "@/api/week/create_new_week";

interface PropsModal {
    router: any;
    setMy_week: Dispatch<SetStateAction<IDay[]>>;
    setModal: Dispatch<SetStateAction<boolean>>;
}

export default function Create_week_modal({
    router,
    setMy_week,
    setModal,
}: PropsModal) {
    const [my_week, setMyNew_week] = useState<IDay[]>([
        {
            date: "",
            lunch: {
                name: "",
                id: "",
            },
            dinner: {
                name: "",
                id: "",
            },
        },
    ]);
    const [meal, setMeal] = useState<any>();

    const week = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];
    const options: Intl.DateTimeFormatOptions = {
        month: "long",
        day: "numeric",
    };

    const [meal_lunch, setMealLunch] = useState<any>([]);
    const [meal_dinner, setMealDinner] = useState<any>([]);
    const [meal_serving, setMealServing] = useState<any>([]);

    useEffect(() => {
        generate_my_week(
            router,
            setMyNew_week,
            setMealLunch,
            setMealDinner,
            setMealServing
        );
        get_meals_with_empty_meal(router, setMeal);
    }, [router]);

    const customStyles = {
        indicatorSeparator: (base: any) => ({
            ...base,
            display: "none",
        }),
        dropdownIndicator: (base: any) => ({
            ...base,
            color: "#595959",
        }),
    };

    const random_meal = (index: number, setmeal: any) => {
        const rndInt = Math.floor(Math.random() * meal.length - 1) + 1;
        setmeal((meals: any) => ({
            ...meals,
            [index]: {
                value: meal[rndInt].value,
                label: meal[rndInt].label,
                id: meal[rndInt].id,
            },
        }));
    };

    const increase_serving = (
        index: number,
        lunch_value: number,
        dinner_value: number,
        dinner_or_lunch: boolean
    ) => {
        if (dinner_or_lunch)
            setMealServing((meal_serving: any) => ({
                ...meal_serving,
                [index]: { lunch: lunch_value + 1, dinner: dinner_value },
            }));
        else
            setMealServing((meal_serving: any) => ({
                ...meal_serving,
                [index]: { lunch: lunch_value, dinner: dinner_value + 1 },
            }));
    };

    const decrease_serving = (
        index: number,
        lunch_value: number,
        dinner_value: number,
        dinner_or_lunch: boolean
    ) => {
        if (dinner_or_lunch && lunch_value > 1)
            setMealServing((meal_serving: any) => ({
                ...meal_serving,
                [index]: { lunch: lunch_value - 1, dinner: dinner_value },
            }));
        else if (!dinner_or_lunch && dinner_value > 1)
            setMealServing((meal_serving: any) => ({
                ...meal_serving,
                [index]: { lunch: lunch_value, dinner: dinner_value - 1 },
            }));
    };

    const onChange = (option: any, index: number, setmeal: any) => {
        setmeal((meals: any) => ({
            ...meals,
            [index]: option,
        }));
    };

    if (meal_serving.length == 0) return <div></div>;
    else
        return (
            <div className="">
                <div className="generate_week__container">
                    {my_week.map((day: IDay, index: number) => {
                        var date = new Date(day.date.split(" ")[0]);
                        var french_date = date.toLocaleDateString(
                            "fr-FR",
                            options
                        );

                        return (
                            <div
                                key={index}
                                className="day_choose_meal__container"
                            >
                                <h2>
                                    {week[index]} {french_date.toUpperCase()}
                                </h2>
                                <div className="catégories__card">
                                    <CardCategorie name_category="Déjeuner" />
                                </div>
                                <div className="modify_day_meal__container">
                                    <div className="select_meal__container">
                                        <Select
                                            className="select_meal__select"
                                            options={meal}
                                            value={meal_lunch[index]}
                                            styles={customStyles}
                                            menuPortalTarget={document.body}
                                            closeMenuOnScroll={(e: any) => {
                                                if (
                                                    e.target!.className ===
                                                    "generate_week__container"
                                                ) {
                                                    return true;
                                                } else {
                                                    return false;
                                                }
                                            }}
                                            onChange={(option: any) =>
                                                onChange(
                                                    option,
                                                    index,
                                                    setMealLunch
                                                )
                                            }
                                        />
                                        <button
                                            className="random__btn"
                                            onClick={() =>
                                                random_meal(index, setMealLunch)
                                            }
                                        >
                                            <GiPerspectiveDiceSixFacesRandom
                                                size={30}
                                                color="white"
                                            />
                                        </button>
                                    </div>
                                    <div className="rand_serving__container">
                                        <button
                                            className="minus__btn"
                                            onClick={() =>
                                                decrease_serving(
                                                    index,
                                                    meal_serving[index].lunch,
                                                    meal_serving[index].dinner,
                                                    true
                                                )
                                            }
                                        >
                                            <AiOutlineMinus />
                                        </button>
                                        <span>{meal_serving[index].lunch}</span>
                                        <button
                                            className="minus__btn"
                                            onClick={() =>
                                                increase_serving(
                                                    index,
                                                    meal_serving[index].lunch,
                                                    meal_serving[index].dinner,
                                                    true
                                                )
                                            }
                                        >
                                            <AiOutlinePlus />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <CardCategorie name_category="Diner" />
                                </div>
                                <div className="modify_day_meal__container">
                                    <div className="select_meal__container">
                                        <Select
                                            className="select_meal__select"
                                            options={meal}
                                            value={meal_dinner[index]}
                                            styles={customStyles}
                                            onChange={(option: any) =>
                                                onChange(
                                                    option,
                                                    index,
                                                    setMealDinner
                                                )
                                            }
                                            menuPortalTarget={document.body}
                                            closeMenuOnScroll={(e: any) => {
                                                if (
                                                    e.target!.className ===
                                                    "generate_week__container"
                                                ) {
                                                    return true;
                                                } else {
                                                    return false;
                                                }
                                            }}
                                        />
                                        <button
                                            className="random__btn"
                                            onClick={() =>
                                                random_meal(
                                                    index,
                                                    setMealDinner
                                                )
                                            }
                                        >
                                            <GiPerspectiveDiceSixFacesRandom
                                                size={30}
                                                color="white"
                                            />
                                        </button>
                                    </div>
                                    <div className="rand_serving__container">
                                        <button
                                            className="minus__btn"
                                            onClick={() =>
                                                decrease_serving(
                                                    index,
                                                    meal_serving[index].lunch,
                                                    meal_serving[index].dinner,
                                                    false
                                                )
                                            }
                                        >
                                            <AiOutlineMinus />
                                        </button>
                                        <span>
                                            {meal_serving[index].dinner}
                                        </span>
                                        <button
                                            className="minus__btn"
                                            onClick={() =>
                                                increase_serving(
                                                    index,
                                                    meal_serving[index].lunch,
                                                    meal_serving[index].dinner,
                                                    false
                                                )
                                            }
                                        >
                                            <AiOutlinePlus />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="btn_end__container">
                    <button className="cancel__button">Annuler</button>
                    <button
                        className="classic__button"
                        onClick={() =>
                            create_my_week(
                                router,
                                setMy_week,
                                meal_lunch,
                                meal_dinner,
                                meal_serving,
                                my_week,
                                setModal
                            )
                        }
                    >
                        Sauvegarder
                    </button>
                </div>
            </div>
        );
}
