import Head from "next/head";
import { AiOutlineHome, AiOutlineClose } from "react-icons/ai";
import { MdOutlineFastfood, MdLogout } from "react-icons/md";
import { BsEnvelopePaper } from "react-icons/bs";
import { FiHelpCircle } from "react-icons/fi";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/Io";
import { GiWheat } from "react-icons/gi";

import { useEffect, useState } from "react";
import Link from "next/link";

export function Sidebar() {
    const [burger, setBurger] = useState(false);
    const [style_dashboard, setstyle_dashboard] = useState("");
    const [my_meals_dashboard, setmy_meals_dashboard] = useState("");

    useEffect(() => {
        window.addEventListener("resize", () => {
            if (window.innerWidth > 833) {
                setBurger(false);
            }
        });
        if (window.location.pathname) {
            if (window.location.pathname == "/my-meals") {
                setmy_meals_dashboard("selected_li");
            } else {
                setstyle_dashboard("selected_li");
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
                                <Link href="/home">
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

export default function Home() {
    return (
        <>
            <Head>
                <title>Prepalist - Home</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="layout">
                {Sidebar()}
                <div className="home__container">
                    <div className="header-switch-day__box">
                        <div className="date-switch_box basic_grey">
                            <IoIosArrowBack
                                size={25}
                                onClick={() => console.log("previous")}
                            />
                            <IoIosArrowForward
                                size={25}
                                onClick={() => console.log("next")}
                            />
                            <span className="">Samedi 18 Mars 2020</span>
                        </div>
                    </div>
                    <div className="body-day__box">
                        <h2>Samedi</h2>

                        <div className="meal__box flex">
                            <div className="time__box">
                                <span className="basic_grey">12h</span>
                                <h3>Déjeuner</h3>
                            </div>
                            <div className="meal-display__box">
                                <div className="meal__icon">
                                    <GiWheat size={20} />
                                </div>
                                <span className="">Pates à la carbona</span>
                            </div>
                        </div>
                        <div className="meal__box">
                            <div className="time__box">
                                <span className="basic_grey">20h30</span>
                                <h3>Dinner</h3>
                            </div>
                            <div className="meal-display__box">
                                <div className="meal__icon">
                                    <GiWheat size={20} />
                                </div>
                                <span className="">
                                    Bâtonnets de poisson pané et riz
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
