import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { create_meals } from "@/api/meal/create_meals";
import { NextRouter } from "next/router";
import {
    Imeal,
    select_meal,
    set_ingredient,
    set_name,
    set_one_meal,
} from "@/redux/slices/select_meal";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { forEachChild } from "typescript";

interface Iingredient {
    index: number;
}

const Ingredient: React.FC<Iingredient> = (props) => {
    const _select_meal = useAppSelector(select_meal);
    const dispatch = useAppDispatch();

    // const update_ingredient = (index: number) => (e: any) => {
    //     props.set_ingredients((ingredients) => ({
    //         ...ingredients,
    //         [index]: e.target.value,
    //     }));
    // };

    return (
        <div className="classic__input  padding__modal">
            <span className="color--dark_blue">
                {"Nom de l'ingrédient"} {props.index + 1}
            </span>
            <input
                placeholder="Pasta carbonara"
                value={_select_meal.ingredients[props.index].ingredient}
                onChange={(e) => {
                    dispatch(set_ingredient([props.index, e.target.value]));
                    console.log(_select_meal);
                }}
            />
        </div>
    );
};

interface Imeal_content {
    set_modal: Dispatch<SetStateAction<boolean>>;
    set_meal: Dispatch<SetStateAction<Imeal[]>>;
    router: NextRouter;
}

const Add_meal_content_modal: React.FC<Imeal_content> = (props) => {
    const [list_input, set_list_input] = useState<JSX.Element[]>([
        <Ingredient key="0" index={0} />,
    ]);
    const [error, setError] = useState<string>("");

    const _select_meal = useAppSelector(select_meal);
    const dispatch = useAppDispatch();

    useEffect(() => {
        const element = document.querySelector(".ingredients__box");
        if (!element) return;
        element.scrollTop = element.scrollHeight;
    }, [list_input]);

    return (
        <>
            <div className="classic__input">
                <span className="color--dark_blue">Nom du repas</span>
                <input
                    placeholder="Pasta carbonara"
                    value={_select_meal.name}
                    onChange={(e) => dispatch(set_name(e.target.value))}
                />
            </div>

            <div className="ingredients__box">{list_input}</div>
            <div>
                <span className="error-content__text">{error}</span>
            </div>
            <div className="flex ingredients-button__box">
                <button
                    className="classic__button"
                    onClick={(e) => {
                        dispatch(set_one_meal());
                        set_list_input((element: any) => [
                            ...element,
                            <Ingredient
                                key={list_input.length}
                                index={list_input.length}
                            />,
                        ]);
                        console.log(_select_meal);
                    }}
                >
                    Ajouter 1 ingrédient
                </button>
                <button
                    className="classic__button"
                    onClick={() => {
                        console.log(_select_meal);
                        create_meals(
                            _select_meal,
                            props.set_modal,
                            props.set_meal,
                            props.router
                        );
                    }}
                >
                    Créer le repas
                </button>
            </div>
        </>
    );
};

export default Add_meal_content_modal;
