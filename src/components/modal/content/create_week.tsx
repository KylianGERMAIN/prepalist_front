import { get_meals_with_empty_meal } from "@/api/meal/get_meals";
import { generate_my_week } from "@/api/week/generate_new_week";
import { Iday } from "@/api/week/get_week";
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
import CardCategory from "@/components/planner/card_categorie";

interface Icreate_week {
    router: any;
    set_my_week: Dispatch<SetStateAction<Iday[]>>;
    set_modal: Dispatch<SetStateAction<boolean>>;
}

const Create_week_modal: React.FC<Icreate_week> = (props) => {
    const [my_week, set_my_new_week] = useState<Iday[]>([
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
    const [meal, set_meal] = useState<any>();

    const week = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];
    const options: Intl.DateTimeFormatOptions = {
        month: "long",
        day: "numeric",
    };

    const [meal_lunch, set_meal_lunch] = useState<any>([]);
    const [meal_dinner, set_meal_dinner] = useState<any>([]);
    const [meal_serving, set_meal_serving] = useState<any>([]);

    useEffect(() => {
        generate_my_week(
            props.router,
            set_my_new_week,
            set_meal_lunch,
            set_meal_dinner,
            set_meal_serving
        );
        get_meals_with_empty_meal(props.router, set_meal);
    }, [props.router]);

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
            set_meal_serving((meal_serving: any) => ({
                ...meal_serving,
                [index]: { lunch: lunch_value + 1, dinner: dinner_value },
            }));
        else
            set_meal_serving((meal_serving: any) => ({
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
            set_meal_serving((meal_serving: any) => ({
                ...meal_serving,
                [index]: { lunch: lunch_value - 1, dinner: dinner_value },
            }));
        else if (!dinner_or_lunch && dinner_value > 1)
            set_meal_serving((meal_serving: any) => ({
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
                    {my_week.map((day: Iday, index: number) => {
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
                                    <CardCategory name_category="Déjeuner" />
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
                                                    set_meal_lunch
                                                )
                                            }
                                        />
                                        <button
                                            className="random__btn"
                                            onClick={() =>
                                                random_meal(
                                                    index,
                                                    set_meal_lunch
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
                                    <CardCategory name_category="Diner" />
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
                                                    set_meal_dinner
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
                                                    set_meal_dinner
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
                    <button
                        className="cancel__button"
                        onClick={() => props.set_modal(false)}
                    >
                        Annuler
                    </button>
                    <button
                        className="classic__button"
                        onClick={() =>
                            create_my_week(
                                props.router,
                                props.set_my_week,
                                meal_lunch,
                                meal_dinner,
                                meal_serving,
                                my_week,
                                props.set_modal
                            )
                        }
                    >
                        Sauvegarder
                    </button>
                </div>
            </div>
        );
};

export default Create_week_modal;
