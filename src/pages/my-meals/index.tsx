import Head from "next/head";
import { AiOutlineClose, AiOutlineEdit } from "react-icons/ai";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { delete_meal } from "@/api/meal/delete_meals";
import Modal from "@/components/modal/modal";
import Add_meal_content_modal from "@/components/modal/content/add_meal";
import Update_meal_content_modal from "@/components/modal/content/update_meal";
import Tiny_Modal from "@/components/modal/tiny_modal";
import Sidebar from "@/components/sidebar/sidebar";
import {
    Imeal,
    reset_select_meal,
    select_meal,
    set_actual_meal,
    set_one_ingredient,
} from "@/redux/slices/select_meal";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { get_meals } from "@/api/meal/get_meals";

const My_meals: React.FC = (props) => {
    const [modal_add_meal, set_add_meal_modal] = useState(false);
    const [modal_update_meal, set_update_meal_modal] = useState(false);
    const [modal_delete_meal, set_delete_meal_modal] = useState(false);
    const [list_meal, set_list_meal] = useState<Imeal[]>([]);
    const [delete_meal_id, set_delete_meal_id] = useState<string>("");

    const router = useRouter();
    const _select_meal = useAppSelector(select_meal);
    const dispatch = useAppDispatch();

    useEffect(() => {
        get_meals(router, set_list_meal);
    }, [dispatch, router]);

    function Card_meal({ meal }: { meal: Imeal }) {
        return (
            <div className="meal__box">
                <div className="meal__row">
                    <h4>{meal.name}</h4>
                    <span>
                        Ajouté le{" "}
                        {meal.created_at
                            ? new Date(
                                  meal.created_at.split(" ")[0]
                              ).toLocaleDateString("fr-FR", {})
                            : "null"}
                    </span>
                </div>
                <div className="icons__row">
                    <AiOutlineEdit
                        size={25}
                        onClick={(e) => {
                            dispatch(set_actual_meal(meal));
                            set_update_meal_modal(!modal_update_meal);
                        }}
                    />
                    <AiOutlineClose
                        size={25}
                        onClick={(e) => {
                            set_delete_meal_id(meal.id);
                            set_delete_meal_modal(true);
                        }}
                    />
                </div>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>Prepalist - Home</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="layout">
                <Sidebar />
                <Modal
                    set_modal={set_add_meal_modal}
                    open_modal={modal_add_meal}
                    title="Ajouter un repas"
                >
                    <Add_meal_content_modal
                        set_modal={set_add_meal_modal}
                        set_list_meal={set_list_meal}
                        router={router}
                    />
                </Modal>
                <Modal
                    set_modal={set_update_meal_modal}
                    open_modal={modal_update_meal}
                    title="Mettre à jour le repas"
                >
                    <Update_meal_content_modal
                        set_modal={set_update_meal_modal}
                        set_list_meal={set_list_meal}
                        router={router}
                        list_meal={list_meal}
                    />
                </Modal>

                <Tiny_Modal
                    set_modal={set_delete_meal_modal}
                    open_modal={modal_delete_meal}
                    title="Voulez-vous supprimer ce repas ?"
                >
                    <div className="flex ingredients-button__box">
                        <button
                            className="cancel__button yes_modal"
                            onClick={() => {
                                set_delete_meal_modal(!modal_delete_meal);
                            }}
                        >
                            Annulez
                        </button>
                        <button
                            className="classic__button no_modal"
                            onClick={() => {
                                delete_meal(
                                    list_meal,
                                    delete_meal_id,
                                    router,
                                    set_list_meal
                                );
                                set_delete_meal_modal(!modal_delete_meal);
                            }}
                        >
                            Supprimer
                        </button>
                    </div>
                </Tiny_Modal>

                <div className="home__container">
                    <div className="header__container"></div>
                    <div className="header-meal__box flex">
                        <h3>Total : {list_meal.length}</h3>
                        <button
                            className="classic__button"
                            onClick={async () => {
                                dispatch(reset_select_meal());
                                dispatch(set_one_ingredient());
                                set_add_meal_modal(!modal_add_meal);
                            }}
                        >
                            Créer
                        </button>
                    </div>
                    <div className="body_container">
                        {list_meal.map((meal: Imeal, index: number) => (
                            <Card_meal key={index} meal={meal} />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default My_meals;
