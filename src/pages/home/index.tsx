import Head from "next/head";
import { useEffect, useState } from "react";
import { get_week } from "@/api/week/get_week";
import { useRouter } from "next/router";
import {
    get_meals_count,
    get_meals_with_empty_meal,
} from "@/api/meal/get_meals";
import Modal from "@/components/modal/modal";
import View_meal_modal from "@/components/modal/content/view_meal";
import Create_week_modal from "@/components/modal/content/create_week";
import Sidebar from "@/components/sidebar/sidebar";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import Card_Day from "@/components/planner/card_day";
import { select_meal } from "@/redux/slices/select_meal";
import {
    reset_generate_week,
    generate_week,
} from "@/redux/slices/generate_week";
import { generate_my_week } from "@/api/week/generate_new_week";
import { Iday, week } from "@/redux/slices/week";

export const __week = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];

const Home: React.FC = (props) => {
    const [count_meal, set_count_meal] = useState<number>(-1);
    const [loading, set_loading] = useState<boolean>(true);
    const [list_meal, set_list_meal] = useState<any>();
    const [modal_meal_view, set_meal_view_modal] = useState(false);
    const [modal_create_week, set_create_week_modal] = useState(false);
    const dispatch = useAppDispatch();
    const _select_meal = useAppSelector(select_meal);
    const _generate_week = useAppSelector(generate_week);
    const _week = useAppSelector(week);
    const router = useRouter();

    useEffect(() => {
        get_meals_count(router, set_count_meal);
        if (count_meal >= 10) {
            dispatch(get_week(router));
        }
    }, [count_meal, dispatch, router]);

    useEffect(() => {
        dispatch(generate_my_week(router));
        get_meals_with_empty_meal(router, set_list_meal);
    }, [dispatch, router, modal_create_week]);

    if (count_meal != -1 && loading) {
        set_loading(false);
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
                    set_modal={set_meal_view_modal}
                    open_modal={
                        _select_meal.ingredients.length <= 0
                            ? false
                            : modal_meal_view
                    }
                    title="Informations sur le repas"
                >
                    <View_meal_modal />
                </Modal>
                <Modal
                    set_modal={set_create_week_modal}
                    open_modal={
                        _generate_week.week.length <= 0
                            ? false
                            : modal_create_week
                    }
                    title="Créer une semaine de repas"
                >
                    <Create_week_modal
                        router={router}
                        set_modal={set_create_week_modal}
                        list_meal={list_meal}
                        set_list_meal={set_list_meal}
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
                                            <img
                                                alt="illustration"
                                                src="https://cdn-icons-png.flaticon.com/512/5973/5973349.png"
                                            />
                                            <h1>Attention</h1>
                                            <p>
                                                {
                                                    "Pour planifier votre semaine de repas, créez plus de 10 plats en visitant la rubrique 'Mes repas'. C'est simple et facile, et vous pourrez ainsi profiter de repas sains et savoureux."
                                                }
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
                                            set_create_week_modal(true);
                                        }}
                                    >
                                        Plannifier ma semaine
                                    </button>
                                </div>

                                <div className="home__container">
                                    {_week.week.length < 6 ? null : (
                                        <div className="home__container__header">
                                            <div className="body-planning__container">
                                                {_week.week.map(
                                                    (day: Iday, index: any) => (
                                                        <Card_Day
                                                            key={index}
                                                            day_of_week={
                                                                __week[index]
                                                            }
                                                            day={day}
                                                            set_meal_view_modal={
                                                                set_meal_view_modal
                                                            }
                                                        />
                                                    )
                                                )}

                                                <button
                                                    className="add_new_week__button"
                                                    onClick={() => {
                                                        dispatch(
                                                            reset_generate_week()
                                                        );
                                                        set_create_week_modal(
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
};

export default Home;
