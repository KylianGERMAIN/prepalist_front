import Head from "next/head";
import { Sidebar, options } from "../home";
import { AiOutlineClose, AiOutlineEdit } from "react-icons/ai";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { IMeal, get_meals } from "@/api/meal/get_meals";
import { useRouter } from "next/router";
import { delete_meal } from "@/api/meal/delete_meals";
import Modal from "@/components/modal/modal";
import Add_meal_content_modal from "@/components/modal/add_meal";
import Update_meal_content_modal from "@/components/modal/update_meal";

export default function My_meals() {
    const [modal_add_meal, setAddMealModal] = useState(false);
    const [modal_update_meal, setUpdateMealModal] = useState(false);
    const [modal_delete_meal, setDeleteMealModal] = useState(false);
    const [listMeal, setMeal] = useState<IMeal[]>([]);
    const [delete_meal_id, setDeleteMealID] = useState<string>("");

    const [select_meal, setNameSelectedMeal] = useState<IMeal>({
        name: "",
        id: "",
        ingredients: [],
    });

    const router = useRouter();

    useEffect(() => {
        get_meals(router, setMeal);
    }, [router]);

    function Card_meal({ meal }: { meal: IMeal }) {
        return (
            <div className="meal-list__box">
                <div className="name-meal__box">
                    <h4>{meal.name}</h4>
                    <span>
                        Ajouté le{" "}
                        {meal.created_at
                            ? new Date(
                                  meal.created_at.split(" ")[0]
                              ).toLocaleDateString("fr-FR", options)
                            : "null"}
                    </span>
                </div>
                <div className="meal_icon__box">
                    <AiOutlineEdit
                        size={25}
                        onClick={(e) => {
                            setNameSelectedMeal(meal);
                            setUpdateMealModal(!modal_update_meal);
                        }}
                    />
                    <AiOutlineClose
                        size={25}
                        onClick={(e) => {
                            setDeleteMealID(meal.id);
                            setDeleteMealModal(true);
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
                    setModal={setAddMealModal}
                    open_modal={modal_add_meal}
                    title="Create new meal "
                >
                    <Add_meal_content_modal
                        setModal={setAddMealModal}
                        setMeal={setMeal}
                        router={router}
                    />
                </Modal>
                <Modal
                    setModal={setUpdateMealModal}
                    open_modal={modal_update_meal}
                    title="Update meal"
                >
                    <Update_meal_content_modal
                        setModal={setUpdateMealModal}
                        setMeal={setMeal}
                        router={router}
                        meal={select_meal}
                        setNameSelectedMeal={setNameSelectedMeal}
                        listMeal={listMeal}
                    />
                </Modal>

                <Modal
                    setModal={setDeleteMealModal}
                    open_modal={modal_delete_meal}
                    title="Are you sure you want to delete this meal ?"
                >
                    <div className="flex ingredients-button__box">
                        <button
                            className="classic__button yes_modal"
                            onClick={() => {
                                delete_meal(
                                    listMeal,
                                    delete_meal_id,
                                    router,
                                    setMeal
                                );
                                setDeleteMealModal(!modal_delete_meal);
                            }}
                        >
                            Yes
                        </button>
                        <button
                            className="classic__button no_modal"
                            onClick={() => {
                                setDeleteMealModal(!modal_delete_meal);
                            }}
                        >
                            No
                        </button>
                    </div>
                </Modal>

                <div className="home__container">
                    <div className="header-switch-day__box">
                        <div className="date-switch_box basic_grey">
                            <span className="">My meals</span>
                        </div>
                    </div>
                    <div className="body-list__box">
                        <div className="add-meal__box flex">
                            <h3>Total : {listMeal.length}</h3>
                            <button
                                className="classic__button"
                                onClick={() => {
                                    setAddMealModal(!modal_add_meal);
                                }}
                            >
                                Create
                            </button>
                        </div>
                        {listMeal.map((meal: IMeal, index: number) => (
                            <Card_meal key={index} meal={meal} />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
