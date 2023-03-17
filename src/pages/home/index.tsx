import Head from "next/head";
import { AiOutlineHome, AiOutlineClose } from "react-icons/ai";
import { MdOutlineFastfood, MdLogout } from "react-icons/md";
import { BsEnvelopePaper } from "react-icons/bs";
import { FiHelpCircle } from "react-icons/fi";

import { useEffect, useState } from "react";

export default function Home() {
    const [burger, setBurger] = useState(false);

    useEffect(() => {
        window.addEventListener("resize", () => {
            if (window.innerWidth > 833) {
                setBurger(false);
            }
        });
    }, [burger]);

    return (
        <>
            <Head>
                <title>Prepalist - Home</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="layout">
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
                                <li className="selected_li">
                                    <AiOutlineHome size={25} />
                                    Dashboard
                                </li>
                                <li>
                                    <MdOutlineFastfood size={25} />
                                    My meals
                                </li>
                            </ul>
                        </div>
                        <div className="navbar-bottom__box">
                            <span className="support__text">Support</span>
                            <div className="support_section">
                                <ul>
                                    <li>
                                        <BsEnvelopePaper size={25} />
                                        Guide
                                    </li>
                                    <li>
                                        <FiHelpCircle size={25} />
                                        Help Center
                                    </li>
                                    <hr className="separator__hr" />
                                    <li className="">
                                        <MdLogout size={25} />
                                        Logout
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="home__container"></div>
            </div>
        </>
    );
}
