import { Dispatch, SetStateAction, useState } from "react";
import { NextRouter } from "next/router";
import { update_meal } from "@/api/meal/update_meal";
import { IMeal } from "@/redux/slices/SelectMeal";

interface IUpdate_meal_content {
    setModal: Dispatch<SetStateAction<boolean>>;
    setMeal: Dispatch<SetStateAction<IMeal[]>>;
    router: NextRouter;
    meal: IMeal;
    setNameSelectedMeal: Dispatch<SetStateAction<IMeal>>;
    listMeal: IMeal[];
}

const Update_meal_content_modal: React.FC<IUpdate_meal_content> = (props) => {
    const [error, setError] = useState<string>("");

    const handleIngredientChange = (index: number, newValue: string) => {
        const updatedIngredients = props.meal.ingredients;
        updatedIngredients[index] = { ingredient: newValue };
        props.setNameSelectedMeal((new_meals) => ({
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
                    value={props.meal.name}
                    onChange={(e) =>
                        props.setNameSelectedMeal((new_meals) => ({
                            ...new_meals,
                            name: e.target.value,
                        }))
                    }
                />
            </div>
            <div className="ingredients__box">
                {props.meal.ingredients.map((element, key) => (
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
                    onClick={() => {
                        props.setNameSelectedMeal((new_meals) => ({
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
                        for (
                            var i = props.meal.ingredients.length - 1;
                            i >= 0;
                            i--
                        ) {
                            if (props.meal.ingredients[i].ingredient == "") {
                                props.meal.ingredients.splice(i, 1);
                            }
                        }
                        update_meal(
                            props.meal,
                            props.setModal,
                            props.setMeal,
                            props.router,
                            setError,
                            props.listMeal
                        );
                    }}
                >
                    Mettre à jour le repas
                </button>
            </div>
        </>
    );
};

export default Update_meal_content_modal;
