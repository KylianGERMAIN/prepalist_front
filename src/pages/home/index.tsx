/* eslint-disable react/no-unescaped-entities */
import Head from "next/head";
import { AiOutlineHome, AiOutlineClose } from "react-icons/ai";
import { MdOutlineFastfood, MdLogout, MdLunchDining } from "react-icons/md";
import { BsEnvelopePaper, BsListCheck } from "react-icons/bs";
import { FiHelpCircle } from "react-icons/fi";
import { useEffect, useState } from "react";
import Link from "next/link";
import { IDay, get_week } from "@/api/week/get_week";
import { useRouter } from "next/router";
import { get_meals, get_meals_count } from "@/api/meal/get_meals";
import { create_my_week } from "@/api/week/create_new_week";

export const options = {
    weekday: "long" as "long",
    year: "numeric" as "numeric",
    month: "long" as "long",
    day: "numeric" as "numeric",
};

export function Sidebar() {
    const [burger, setBurger] = useState(false);
    const [style_dashboard, setStyle_dashboard] = useState(["", "", ""]);

    useEffect(() => {
        window.addEventListener("resize", () => {
            if (window.innerWidth > 833) {
                setBurger(false);
            }
        });
        if (window.location.pathname) {
            if (window.location.pathname == "/home") {
                setStyle_dashboard(["selected_li", "", ""]);
            } else if (window.location.pathname == "/my-meals") {
                setStyle_dashboard(["", "selected_li", ""]);
            } else {
                setStyle_dashboard(["", "", "selected_li"]);
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
                                <li className={style_dashboard[0]}>
                                    <AiOutlineHome size={25} />
                                    Dashboard
                                </li>
                            </Link>
                            <Link href="/my-meals">
                                <li className={style_dashboard[1]}>
                                    <MdOutlineFastfood size={25} />
                                    My meals
                                </li>
                            </Link>
                            <Link href="/my-list">
                                <li className={style_dashboard[2]}>
                                    <BsListCheck size={25} />
                                    My list
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

export function Card_Day({
    day,
    day_of_week,
}: {
    day: IDay;
    day_of_week: string;
}) {
    function CardCategorie({ name_category }: { name_category: string }) {
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
                    <MdLunchDining size={"19px"} color="#EE7353" />
                    <span>{name_category}</span>
                </div>
            );
    }

    return (
        <div className="card-day__container">
            <div className="card-day__element">
                <h2 className="day_of_week__text">{day_of_week}</h2>
                <div className="meal-diner__container">
                    <span className="date__text">{day.date.split(" ")[0]}</span>
                    <CardCategorie name_category="Déjeuner" />
                    <span className="name_meal__text">{day.lunch.name}</span>
                </div>
                <div className="meal-diner__container">
                    <span className="date__text">{day.date.split(" ")[0]}</span>
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
    const [index, setindex] = useState(0);

    const router = useRouter();
    const week = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];

    useEffect(() => {
        get_meals_count(router, setCountMeal);
        if (count_meal >= 6) get_week(router, setMy_week);
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
                {loading == false ? (
                    <>
                        {count_meal < 10 ? (
                            <div className="no_enought__container">
                                <div>
                                    <div className="header-switch-day__box"></div>
                                </div>

                                <div className="body-day__box ">
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
                            </div>
                        ) : (
                            <div>
                                <div className="header-switch-day__box"></div>

                                <div className="home__container">
                                    <div className="body-day__box">
                                        {my_week.map(
                                            (day: IDay, index: any) => (
                                                <Card_Day
                                                    key={index}
                                                    day_of_week={week[index]}
                                                    day={day}
                                                />
                                            )
                                        )}

                                        <button
                                            className="add_new_week__button"
                                            onClick={() => {
                                                create_my_week(
                                                    router,
                                                    setMy_week
                                                );
                                            }}
                                        >
                                            +
                                        </button>
                                    </div>
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
