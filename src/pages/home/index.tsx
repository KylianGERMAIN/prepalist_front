/* eslint-disable react/no-unescaped-entities */
import Head from "next/head";
import { AiOutlineHome, AiOutlineClose } from "react-icons/ai";
import { MdOutlineFastfood, MdLogout } from "react-icons/md";
import { BsEnvelopePaper } from "react-icons/bs";
import { FiHelpCircle } from "react-icons/fi";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/Io";
import { GiWheat } from "react-icons/gi";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IDay, get_week } from "@/api/week/get_week";
import { useRouter } from "next/router";
import { create_my_week } from "@/api/week/create_new_week";
import { get_meals, get_meals_count } from "@/api/meal/get_meals";

export const options = {
    weekday: "long" as "long",
    year: "numeric" as "numeric",
    month: "long" as "long",
    day: "numeric" as "numeric",
};

export function Sidebar() {
    const [burger, setBurger] = useState(false);
    const [style_dashboard, setStyle_dashboard] = useState("");
    const [my_meals_dashboard, setMy_meals_dashboard] = useState("");

    useEffect(() => {
        window.addEventListener("resize", () => {
            if (window.innerWidth > 833) {
                setBurger(false);
            }
        });
        if (window.location.pathname) {
            if (window.location.pathname == "/my-meals") {
                setMy_meals_dashboard("selected_li");
            } else {
                setStyle_dashboard("selected_li");
            }
        }
    }, [burger]);

    return (
        <>
            <div className="responsive-navbar__box">
                <li
                    className="click-zone__burger-menu"
                    onClick={() => setBurger(!burger)}
                >
                    <a>
                        <span className="span__relative"></span>
                        <span className="span__relative"></span>
                    </a>
                </li>
            </div>

            <div
                className={
                    burger == false
                        ? "close-panel__container panel__container"
                        : "open-panel__container panel__container"
                }
            >
                <div className="navbar__box">
                    <div className="navbar-top__box">
                        <div className="title__box title-responsive__box">
                            <h1>Prepalist</h1>
                            {burger == false ? null : (
                                <span onClick={() => setBurger(false)}>
                                    <AiOutlineClose size={25} />
                                </span>
                            )}
                        </div>
                        <ul>
                            <Link href="/home">
                                <li className={style_dashboard}>
                                    <AiOutlineHome size={25} />
                                    Dashboard
                                </li>
                            </Link>
                            <Link href="/my-meals">
                                <li className={my_meals_dashboard}>
                                    <MdOutlineFastfood size={25} />
                                    My meals
                                </li>
                            </Link>
                        </ul>
                    </div>
                    <div className="navbar-bottom__box">
                        <span className="support__text">Support</span>
                        <div className="support_section">
                            <ul>
                                <Link href="/home">
                                    <li>
                                        <BsEnvelopePaper size={25} />
                                        Guide
                                    </li>
                                </Link>
                                <Link href="/home">
                                    <li>
                                        <FiHelpCircle size={25} />
                                        Help Center
                                    </li>
                                </Link>
                                <hr className="separator__hr" />
                                <Link href="/login">
                                    <li className="">
                                        <MdLogout size={25} />
                                        Logout
                                    </li>
                                </Link>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function Home(props: any) {
    const [my_week, setMy_week] = useState<IDay[]>([]);
    const [count_meal, setCountMeal] = useState<number>(-1);
    const [loading, setLoading] = useState<boolean>(true);
    const [index, setindex] = useState(0);

    const router = useRouter();

    useEffect(() => {
        get_meals_count(router, setCountMeal);
        if (count_meal >= 6) get_week(router, setMy_week);
    }, [count_meal]);

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
                {Sidebar()}
                {loading == false ? (
                    <>
                        {count_meal < 10 ? (
                            <>
                                <div className="home__container">
                                    <div className="header-switch-day__box"></div>
                                </div>

                                <div className="body-day__box">
                                    <div className="no_enought_meal__container">
                                        <div className="no_enought_meal__window">
                                            <img src="https://cdn-icons-png.flaticon.com/512/5973/5973349.png" />
                                            <h1>Attention</h1>
                                            <p>
                                                Pour planifier votre semaine de
                                                repas, créez plus de 10 plats en
                                                visitant la rubrique "My meals".
                                                C'est simple et facile, et vous
                                                pourrez ainsi profiter de repas
                                                sains et savoureux.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : null}
                        <div className="home__container">
                            <div className="header-switch-day__box">
                                {my_week.length > 0 ? (
                                    <div className="header__container">
                                        <div className="date-switch_box">
                                            <IoIosArrowBack
                                                size={25}
                                                onClick={() =>
                                                    setindex(
                                                        index == 0
                                                            ? 0
                                                            : index - 1
                                                    )
                                                }
                                            />
                                            <IoIosArrowForward
                                                size={25}
                                                onClick={() =>
                                                    setindex(
                                                        index == 6
                                                            ? 6
                                                            : index + 1
                                                    )
                                                }
                                            />
                                            <span className="">
                                                {new Date(
                                                    my_week[index].date.split(
                                                        " "
                                                    )[0]
                                                ).toLocaleDateString(
                                                    "fr-FR",
                                                    options
                                                )}
                                            </span>
                                        </div>
                                        <button
                                            className="next_week__button"
                                            onClick={() => {
                                                create_my_week(
                                                    router,
                                                    setMy_week
                                                );
                                            }}
                                        >
                                            Créer une semaine
                                        </button>

                                        <button className="next_week__button_respo">
                                            +
                                        </button>
                                    </div>
                                ) : (
                                    <div className="next_week_button__container">
                                        <button
                                            className="next_week__button"
                                            onClick={() => {
                                                create_my_week(
                                                    router,
                                                    setMy_week
                                                );
                                            }}
                                        >
                                            Créer une semaine
                                        </button>

                                        <button className="next_week__button_respo">
                                            +
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="body-day__box">
                                {my_week.length > 0 ? (
                                    <>
                                        <h2>
                                            {new Date(
                                                my_week[index].date.split(
                                                    " "
                                                )[0]
                                            ).toLocaleDateString("fr-FR", {
                                                weekday: "long" as "long",
                                            })}
                                        </h2>

                                        <div className="meal__box flex">
                                            <div className="time__box">
                                                <span className="basic_grey">
                                                    12h
                                                </span>
                                                <h3>Déjeuner</h3>
                                            </div>
                                            <div className="meal-display__box">
                                                <div className="meal__icon">
                                                    <GiWheat size={20} />
                                                </div>
                                                <span className="">
                                                    {my_week[index].lunch.name}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="meal__box">
                                            <div className="time__box">
                                                <span className="basic_grey">
                                                    20h30
                                                </span>
                                                <h3>Dinner</h3>
                                            </div>
                                            <div className="meal-display__box">
                                                <div className="meal__icon">
                                                    <GiWheat size={20} />
                                                </div>
                                                <span className="">
                                                    {my_week[index].dinner.name}
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                ) : null}
                            </div>
                        </div>
                    </>
                ) : null}
            </div>
        </>
    );
}
