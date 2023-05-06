import Head from "next/head";
import { AiOutlineHome, AiOutlineClose } from "react-icons/ai";
import { MdOutlineFastfood, MdLogout } from "react-icons/md";
import { BsEnvelopePaper } from "react-icons/bs";
import { FiHelpCircle } from "react-icons/fi";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { GiWheat } from "react-icons/gi";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Link from "next/link";
import { IMeal } from "@/api/meal/get_meals";
import { create_meals } from "@/api/meal/create_meals";
import { NextRouter } from "next/router";

interface Props {
    index: number;
}

interface PropsModal {
    setModal: Dispatch<SetStateAction<boolean>>;
    setMeal: Dispatch<SetStateAction<IMeal[]>>;
    router: NextRouter;
}

export default function Modal_add_meal({
    setModal,
    setMeal,
    router,
}: PropsModal) {
    const [name, setName] = useState("");
    const [ingredients, setIngredients] = useState<string[]>([]);
    const [listinput, setlistinput] = useState<JSX.Element[]>([
        <Ingredient key="0" index={0} />,
    ]);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const element = document.querySelector(".ingredients__box");
        if (!element) return;
        element.scrollTop = element.scrollHeight;
    }, [listinput]);

    const updateIngredient = (index: number) => (e: any) => {
        setIngredients((ingredients) => ({
            ...ingredients,
            [index]: e.target.value,
        }));
    };

    function Ingredient({ index }: Props) {
        return (
            <div className="classic__input  padding__modal">
                <span className="dark_blue">Name ingredients {index + 1}</span>
                <input
                    placeholder="Pasta carbonara"
                    value={ingredients[index]}
                    onChange={updateIngredient(index)}
                />
            </div>
        );
    }

    return (
        <div id="myModal" className="modal">
            <div className="modal-content">
                <div className="header-modal__box">
                    <span>Create new meal</span>
                    <span className="close" onClick={() => setModal(false)}>
                        &times;
                    </span>
                </div>
                <div className="body-modal__box">
                    <div className="classic__input padding__modal">
                        <span className="dark_blue">Name</span>
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
                        <span className="error_content">{error}</span>
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
                                    />,
                                ]);
                            }}
                        >
                            More ingredients
                        </button>
                        <button
                            className="classic__button"
                            onClick={() => {
                                var newar = [];
                                for (var key in ingredients) {
                                    console.log(ingredients[key]);
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
                                    setModal,
                                    setMeal,
                                    router,
                                    setError
                                );
                            }}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
