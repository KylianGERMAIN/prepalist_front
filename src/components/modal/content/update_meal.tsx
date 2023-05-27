import { Dispatch, SetStateAction, useState } from "react";
import { NextRouter } from "next/router";
import { update_meal } from "@/api/meal/update_meal";
import {
    Imeal,
    select_meal,
    set_ingredient,
    set_name,
    set_one_ingredient,
} from "@/redux/slices/select_meal";
import { useAppSelector, useAppDispatch } from "@/redux/hook";

interface IUpdate_meal_content {
    set_modal: Dispatch<SetStateAction<boolean>>;
    set_list_meal: Dispatch<SetStateAction<Imeal[]>>;
    router: NextRouter;
    list_meal: Imeal[];
}

const Update_meal_content_modal: React.FC<IUpdate_meal_content> = (props) => {
    const [error, set_error] = useState<string>("");

    const _select_meal = useAppSelector(select_meal);
    const dispatch = useAppDispatch();

    return (
        <>
            <div className="classic__input add__input">
                <span className="color--dark_blue">Nom du repas</span>
                <input
                    placeholder="Pasta carbonara"
                    value={_select_meal.name}
                    onChange={(e) => dispatch(set_name(e.target.value))}
                />
            </div>
            <div className="ingredients__box ">
                {_select_meal.ingredients.map((element, key) => (
                    <div key={key} className="classic__input  padding__modal">
                        <span className="color--dark_blue">
                            {"Nom de l'ingrédient"} {key + 1}
                        </span>
                        <input
                            placeholder="Pasta carbonara"
                            value={element.ingredient}
                            onChange={(e) =>
                                dispatch(set_ingredient([key, e.target.value]))
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
                    onClick={async () => {
                        await dispatch(set_one_ingredient());
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
                        update_meal(
                            _select_meal,
                            props.set_modal,
                            props.set_list_meal,
                            props.router,
                            props.list_meal
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
