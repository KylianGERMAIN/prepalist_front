/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/no-unescaped-entities */
import Head from "next/head";
import { AiOutlineHome, AiOutlineClose } from "react-icons/ai";
import {
    MdOutlineFastfood,
    MdLogout,
    MdLunchDining,
    MdDinnerDining,
} from "react-icons/md";
import { BsEnvelopePaper, BsListCheck } from "react-icons/bs";
import { FiHelpCircle } from "react-icons/fi";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Link from "next/link";
import { IDay, get_week } from "@/api/week/get_week";
import { useRouter } from "next/router";
import { get_meals_count } from "@/api/meal/get_meals";
import Modal from "@/components/modal/modal";
import View_meal_modal from "@/components/modal/content/view_meal";
import Create_week_modal from "@/components/modal/content/create_week";
import { Sidebar } from "@/components/sidebar/sidebar";

export const options = {};

export function CardCategorie({ name_category }: { name_category: string }) {
    if (name_category == "Déjeuner")
        return (
            <div className="card_categorie_lunch__container">
                <MdLunchDining size={"19px"} color="#5686E1" />
                <span>{name_category}</span>
            </div>
        );
    else
        return (
            <div className="card_categorie_dinner__container">
                <MdDinnerDining size={"19px"} color="#EE7353" />
                <span>{name_category}</span>
            </div>
        );
}

export function Card_Day({
    day,
    day_of_week,
    setMealViewModal,
    setSelectedMeal,
}: {
    day: IDay;
    day_of_week: string;
    setMealViewModal: Dispatch<SetStateAction<boolean>>;
    setSelectedMeal: Dispatch<SetStateAction<any>>;
}) {
    var date = new Date(day.date.split(" ")[0]);
    var french_date = date.toLocaleDateString("fr-FR");
    return (
        <div className="card-day__container">
            <div className="card-day__col">
                <h2 className="day_of_week__text">{day_of_week}</h2>
                <div
                    className="meal__container"
                    onClick={async (e) => {
                        await setSelectedMeal(day.lunch);
                        setMealViewModal(true);
                    }}
                >
                    <span className="date__text">{french_date}</span>
                    <CardCategorie name_category="Déjeuner" />
                    <span className="name_meal__text">{day.lunch.name}</span>
                </div>
                <div
                    className="meal__container"
                    onClick={async (e) => {
                        await setSelectedMeal(day.dinner);
                        setMealViewModal(true);
                    }}
                >
                    <span className="date__text">{french_date}</span>
                    <CardCategorie name_category="Diner" />
                    <span className="name_meal__text">{day.dinner.name}</span>
                </div>
            </div>
        </div>
    );
}

export default function Home(props: any) {
    const [my_week, setMy_week] = useState<IDay[]>([]);
    const [count_meal, setCountMeal] = useState<number>(-1);
    const [loading, setLoading] = useState<boolean>(true);
    const [modal_meal_view, setMealViewModal] = useState(false);
    const [modal_create_week, setCreateWeekModal] = useState(false);
    const [select_meal, setSelectedMeal] = useState<any>({
        lunch: { name: "", id: "" },
        dinner: { name: "", id: "" },
    });

    const router = useRouter();
    const week = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];

    useEffect(() => {
        get_meals_count(router, setCountMeal);
        if (count_meal >= 10) {
            get_week(router, setMy_week);
            setLoading(false);
        }
    }, [count_meal, router]);

    if (count_meal != -1 && loading) {
        setLoading(false);
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
                    setModal={setMealViewModal}
                    open_modal={modal_meal_view}
                    title="Informations sur le repas"
                >
                    <View_meal_modal meal={select_meal} router={router} />
                </Modal>
                <Modal
                    setModal={setCreateWeekModal}
                    open_modal={modal_create_week}
                    title="Créer une semaine de repas"
                >
                    <Create_week_modal
                        router={router}
                        setMy_week={setMy_week}
                        setModal={setCreateWeekModal}
                    />
                </Modal>
                {loading == false ? (
                    <>
                        {count_meal < 10 ? (
                            <div className="no_enought__container">
                                <div>
                                    <div className="header-switch-day__box"></div>
                                </div>

                                <div className="body-planning__container ">
                                    <div className="no_enought_meal__container">
                                        <div className="no_enought_meal__col">
                                            <img src="https://cdn-icons-png.flaticon.com/512/5973/5973349.png" />
                                            <h1>Attention</h1>
                                            <p>
                                                Pour planifier votre semaine de
                                                repas, créez plus de 10 plats en
                                                visitant la rubrique "Mes
                                                repas". C'est simple et facile,
                                                et vous pourrez ainsi profiter
                                                de repas sains et savoureux.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="header-home__container">
                                    <button
                                        className="add_new_week__button center-midle-screen"
                                        onClick={() => {
                                            setCreateWeekModal(true);
                                        }}
                                    >
                                        Plannifier ma semaine
                                    </button>
                                </div>

                                <div className="home__container">
                                    {my_week.length < 6 ? null : (
                                        <div className="home__container__header">
                                            <div className="body-planning__container">
                                                {my_week.map(
                                                    (day: IDay, index: any) => (
                                                        <Card_Day
                                                            key={index}
                                                            day_of_week={
                                                                week[index]
                                                            }
                                                            day={day}
                                                            setMealViewModal={
                                                                setMealViewModal
                                                            }
                                                            setSelectedMeal={
                                                                setSelectedMeal
                                                            }
                                                        />
                                                    )
                                                )}

                                                <button
                                                    className="add_new_week__button"
                                                    onClick={() => {
                                                        setCreateWeekModal(
                                                            true
                                                        );
                                                    }}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div>
                        <div className="header-switch-day__box"></div>
                    </div>
                )}
            </div>
        </>
    );
}
