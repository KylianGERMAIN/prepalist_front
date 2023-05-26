import { get_meals_with_empty_meal } from "@/api/meal/get_meals";
import { generate_my_week } from "@/api/week/generate_new_week";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { GiPerspectiveDiceSixFacesRandom } from "react-icons/gi";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import Select from "react-select";
import { create_my_week } from "@/api/week/create_new_week";
import CardCategory from "@/components/planner/card_categorie";
import { NextRouter } from "next/router";
import {
    Iday,
    set_dinner_name,
    set_lunch_name,
    week,
} from "@/redux/slices/week";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { Imeal } from "@/redux/slices/select_meal";

interface Icreate_week {
    router: NextRouter;
    set_my_week: Dispatch<SetStateAction<Iday[]>>;
    set_modal: Dispatch<SetStateAction<boolean>>;
    list_meal: any;
    set_list_meal: Dispatch<SetStateAction<any>>;
}

interface Iselect_meal {
    meal: Imeal;
    index: number;
    islunch: boolean;
    list_meal: any;
}

const Create_week_modal: React.FC<Icreate_week> = (props) => {
    const __week = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];
    const options: Intl.DateTimeFormatOptions = {
        month: "long",
        day: "numeric",
    };

    const dispatch = useAppDispatch();
    const _week = useAppSelector(week);

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

    const Meal: React.FC<Iselect_meal> = (props) => {
        return (
            <>
                <div className="catégories__card">
                    {props.islunch ? (
                        <CardCategory name_category="Déjeuner" />
                    ) : (
                        <CardCategory name_category="Diner" />
                    )}
                </div>
                <div className="modify_day_meal__container">
                    <div className="select_meal__container">
                        <Select
                            className="select_meal__select"
                            options={props.list_meal}
                            value={{
                                value: props.meal.name,
                                label: props.meal.name,
                                id: props.meal.id,
                            }}
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
                            onChange={(option: any) => {
                                if (props.islunch)
                                    dispatch(
                                        set_lunch_name([
                                            props.index,
                                            option.value,
                                            option.id,
                                            props.meal.serving,
                                        ])
                                    );
                                else
                                    dispatch(
                                        set_dinner_name([
                                            props.index,
                                            option.value,
                                            option.id,
                                            props.meal.serving,
                                        ])
                                    );
                            }}
                        />
                        <button
                            className="random__btn"
                            onClick={() => {
                                var rndInt =
                                    Math.floor(
                                        Math.random() * props.list_meal.length -
                                            1
                                    ) + 1;
                                console.log(props.list_meal[rndInt]);
                                if (props.islunch)
                                    dispatch(
                                        set_lunch_name([
                                            props.index,
                                            props.list_meal[rndInt].value,
                                            props.list_meal[rndInt].id,
                                            props.meal.serving,
                                        ])
                                    );
                                else
                                    dispatch(
                                        set_dinner_name([
                                            props.index,
                                            props.list_meal[rndInt].value,
                                            props.list_meal[rndInt].id,
                                            props.meal.serving,
                                        ])
                                    );
                            }}
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
                            onClick={() => {
                                if (props.meal.serving > 1)
                                    if (props.islunch)
                                        dispatch(
                                            set_lunch_name([
                                                props.index,
                                                props.meal.name,
                                                props.meal.id,
                                                (props.meal.serving as number) -
                                                    1,
                                            ])
                                        );
                                    else
                                        dispatch(
                                            set_dinner_name([
                                                props.index,
                                                props.meal.name,
                                                props.meal.id,
                                                (props.meal.serving as number) -
                                                    1,
                                            ])
                                        );
                            }}
                        >
                            <AiOutlineMinus />
                        </button>
                        <span>{props.meal.serving}</span>
                        <button
                            className="minus__btn"
                            onClick={() => {
                                if (props.islunch)
                                    dispatch(
                                        set_lunch_name([
                                            props.index,
                                            props.meal.name,
                                            props.meal.id,
                                            (props.meal.serving as number) + 1,
                                        ])
                                    );
                                else
                                    dispatch(
                                        set_dinner_name([
                                            props.index,
                                            props.meal.name,
                                            props.meal.id,
                                            (props.meal.serving as number) + 1,
                                        ])
                                    );
                            }}
                        >
                            <AiOutlinePlus />
                        </button>
                    </div>
                </div>
            </>
        );
    };

    if (_week.week.length <= 0) return <div></div>;
    else
        return (
            <div className="">
                <div className="generate_week__container">
                    {_week.week.map((day: Iday, index: number) => {
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
                                    {__week[index]} {french_date.toUpperCase()}
                                </h2>
                                <Meal
                                    meal={day.lunch}
                                    index={index}
                                    islunch={true}
                                    list_meal={props.list_meal}
                                />
                                <Meal
                                    meal={day.dinner}
                                    index={index}
                                    islunch={false}
                                    list_meal={props.list_meal}
                                />
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
                                _week,
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
