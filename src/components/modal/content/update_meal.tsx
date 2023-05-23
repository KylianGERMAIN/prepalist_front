import Head from "next/head";
import { AiOutlineHome, AiOutlineClose } from "react-icons/ai";
import { MdOutlineFastfood, MdLogout } from "react-icons/md";
import { BsEnvelopePaper } from "react-icons/bs";
import { FiHelpCircle } from "react-icons/fi";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { GiWheat } from "react-icons/gi";

import {
    Dispatch,
    SetStateAction,
    useEffect,
    useState,
    useCallback,
} from "react";
import Link from "next/link";
import { IMeal } from "@/api/meal/get_meals";
import { create_meals } from "@/api/meal/create_meals";
import { NextRouter } from "next/router";
import { update_meal } from "@/api/meal/update_meal";

interface Props {
    index: number;
    element: IMeal;
}

interface PropsModal {
    setModal: Dispatch<SetStateAction<boolean>>;
    setMeal: Dispatch<SetStateAction<IMeal[]>>;
    router: NextRouter;
    meal: IMeal;
    setNameSelectedMeal: Dispatch<SetStateAction<IMeal>>;
    listMeal: IMeal[];
}

export default function Update_meal_content_modal({
    setMeal,
    router,
    setModal,
    meal,
    setNameSelectedMeal,
    listMeal,
}: PropsModal) {
    const [error, setError] = useState<string>("");

    const handleIngredientChange = (index: number, newValue: string) => {
        const updatedIngredients = meal.ingredients;
        updatedIngredients[index] = { ingredient: newValue };
        setNameSelectedMeal((new_meals) => ({
            ...new_meals,
            ingredients: updatedIngredients,
        }));
    };

    return (
        <>
            <div className="classic__input padding__modal">
                <span className="color--dark_blue">Nom du repas</span>
                <input
                    placeholder="Pasta carbonara"
                    value={meal.name}
                    onChange={(e) =>
                        setNameSelectedMeal((new_meals) => ({
                            ...new_meals,
                            name: e.target.value,
                        }))
                    }
                />
            </div>
            <div className="ingredients__box">
                {meal.ingredients.map((element, key) => (
                    <div key={key} className="classic__input  padding__modal">
                        <span className="color--dark_blue">
                            {"Nom de l'ingrédient"} {key + 1}
                        </span>
                        <input
                            placeholder="Pasta carbonara"
                            value={element.ingredient}
                            onChange={(e) =>
                                handleIngredientChange(key, e.target.value)
                            }
                        />
                    </div>
                ))}
            </div>
            <div>
                <span className="error-content__text">{error}</span>
            </div>
            <div className="flex ingredients-button__box">
                <button
                    className="classic__button"
                    onClick={async (e) => {
                        await setNameSelectedMeal((new_meals) => ({
                            ...new_meals,
                            ingredients: [
                                ...new_meals.ingredients,
                                { ingredient: "" },
                            ],
                        }));

                        const element =
                            document.querySelector(".ingredients__box");
                        if (!element) return;
                        element.scrollTop = element.scrollHeight;
                    }}
                >
                    Ajouter 1 ingrédient
                </button>
                <button
                    className="classic__button"
                    onClick={() => {
                        for (var i = meal.ingredients.length - 1; i >= 0; i--) {
                            if (meal.ingredients[i].ingredient == "") {
                                meal.ingredients.splice(i, 1);
                            }
                        }
                        update_meal(
                            meal,
                            setModal,
                            setMeal,
                            router,
                            setError,
                            listMeal
                        );
                    }}
                >
                    Mettre à jour le repas
                </button>
            </div>
        </>
    );
}
