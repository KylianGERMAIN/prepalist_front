import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { create_meals } from "@/api/meal/create_meals";
import { NextRouter } from "next/router";
import { Imeal } from "@/redux/slices/select_meal";

interface Iingredient {
    index: number;
    set_ingredients: Dispatch<SetStateAction<string[]>>;
    ingredients: string[];
}

const Ingredient: React.FC<Iingredient> = (props) => {
    const update_ingredient = (index: number) => (e: any) => {
        props.set_ingredients((ingredients) => ({
            ...ingredients,
            [index]: e.target.value,
        }));
    };

    return (
        <div className="classic__input  padding__modal">
            <span className="color--dark_blue">
                {"Nom de l'ingrédient"} {props.index + 1}
            </span>
            <input
                placeholder="Pasta carbonara"
                value={props.ingredients[props.index]}
                onChange={update_ingredient(props.index)}
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
    const [name, set_name] = useState("");
    const [ingredients, set_ingredients] = useState<string[]>([]);
    const [list_input, set_list_input] = useState<JSX.Element[]>([
        <Ingredient
            key="0"
            index={0}
            set_ingredients={set_ingredients}
            ingredients={ingredients}
        />,
    ]);
    const [error, setError] = useState<string>("");

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
                    value={name}
                    onChange={(e) => set_name(e.target.value)}
                />
            </div>

            <div className="ingredients__box">
                {list_input.map((element) => element)}
            </div>
            <div>
                <span className="error-content__text">{error}</span>
            </div>
            <div className="flex ingredients-button__box">
                <button
                    className="classic__button"
                    onClick={(e) => {
                        set_list_input((element: any) => [
                            ...element,
                            <Ingredient
                                key={list_input.length}
                                index={list_input.length}
                                set_ingredients={set_ingredients}
                                ingredients={ingredients}
                            />,
                        ]);
                    }}
                >
                    Ajouter 1 ingrédient
                </button>
                <button
                    className="classic__button"
                    onClick={() => {
                        var newar = [];
                        for (var key in ingredients) {
                            if (ingredients[key] != "")
                                newar.push({
                                    ingredient: ingredients[key],
                                });
                        }
                        var newMeal = {
                            name: name,
                            ingredients: newar,
                        } as Imeal;
                        create_meals(
                            newMeal,
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
