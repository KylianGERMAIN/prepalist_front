import { Dispatch, SetStateAction, useState } from "react";
import { NextRouter } from "next/router";
import { update_meal } from "@/api/meal/update_meal";
import { Imeal } from "@/redux/slices/select_meal";

interface IUpdate_meal_content {
    set_modal: Dispatch<SetStateAction<boolean>>;
    set_meal: Dispatch<SetStateAction<Imeal[]>>;
    router: NextRouter;
    meal: Imeal;
    set_name_selected_meal: Dispatch<SetStateAction<Imeal>>;
    listMeal: Imeal[];
}

const Update_meal_content_modal: React.FC<IUpdate_meal_content> = (props) => {
    const [error, set_error] = useState<string>("");

    const handle_ingredient_change = (index: number, new_value: string) => {
        const updated_ingredients = props.meal.ingredients;
        updated_ingredients[index] = { ingredient: new_value };
        props.set_name_selected_meal((new_meals) => ({
            ...new_meals,
            ingredients: updated_ingredients,
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
                        props.set_name_selected_meal((new_meals) => ({
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
                                handle_ingredient_change(key, e.target.value)
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
                        props.set_name_selected_meal((new_meals) => ({
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
                            props.set_modal,
                            props.set_meal,
                            props.router,
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
