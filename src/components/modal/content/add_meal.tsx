import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { create_meals } from "@/api/meal/create_meals";
import { NextRouter } from "next/router";
import { IMeal } from "@/redux/slices/SelectMeal";

interface IIngredient {
    index: number;
    setIngredients: Dispatch<SetStateAction<string[]>>;
    ingredients: string[];
}

const Ingredient: React.FC<IIngredient> = (props) => {
    const updateIngredient = (index: number) => (e: any) => {
        props.setIngredients((ingredients) => ({
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
                onChange={updateIngredient(props.index)}
            />
        </div>
    );
};

interface IMeal_content {
    setModal: Dispatch<SetStateAction<boolean>>;
    setMeal: Dispatch<SetStateAction<IMeal[]>>;
    router: NextRouter;
}

const Add_meal_content_modal: React.FC<IMeal_content> = (props) => {
    const [name, setName] = useState("");
    const [ingredients, setIngredients] = useState<string[]>([]);
    const [listinput, setlistinput] = useState<JSX.Element[]>([
        <Ingredient
            key="0"
            index={0}
            setIngredients={setIngredients}
            ingredients={ingredients}
        />,
    ]);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const element = document.querySelector(".ingredients__box");
        if (!element) return;
        element.scrollTop = element.scrollHeight;
    }, [listinput]);

    return (
        <>
            <div className="classic__input">
                <span className="color--dark_blue">Nom du repas</span>
                <input
                    placeholder="Pasta carbonara"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            <div className="ingredients__box">
                {listinput.map((element) => element)}
            </div>
            <div>
                <span className="error-content__text">{error}</span>
            </div>
            <div className="flex ingredients-button__box">
                <button
                    className="classic__button"
                    onClick={(e) => {
                        setlistinput((element: any) => [
                            ...element,
                            <Ingredient
                                key={listinput.length}
                                index={listinput.length}
                                setIngredients={setIngredients}
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
                        } as IMeal;
                        create_meals(
                            newMeal,
                            props.setModal,
                            props.setMeal,
                            props.router,
                            setError
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
