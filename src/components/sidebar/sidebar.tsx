import Link from "next/link";
import { useState, useEffect } from "react";
import { AiOutlineClose, AiOutlineHome } from "react-icons/ai";
import { BsListCheck, BsEnvelopePaper } from "react-icons/bs";
import { FiHelpCircle } from "react-icons/fi";
import { MdOutlineFastfood, MdLogout } from "react-icons/md";

const Sidebar: React.FC = (props) => {
    const [burger, set_burger] = useState(false);
    const [style_dashboard, set_style_dashboard] = useState(["", "", ""]);

    useEffect(() => {
        window.addEventListener("resize", () => {
            if (window.innerWidth > 833) {
                set_burger(false);
            }
        });
        if (window.location.pathname) {
            if (window.location.pathname == "/home") {
                set_style_dashboard(["selected_li", "", ""]);
            } else if (window.location.pathname == "/my-meals") {
                set_style_dashboard(["", "selected_li", ""]);
            } else {
                set_style_dashboard(["", "", "selected_li"]);
            }
        }
    }, [burger]);

    return (
        <>
            <div className="responsive-navbar__box">
                <li
                    className="click-zone__burger-menu"
                    onClick={() => set_burger(!burger)}
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
                                <span onClick={() => set_burger(false)}>
                                    <AiOutlineClose size={25} />
                                </span>
                            )}
                        </div>
                        <ul>
                            <Link href="/home">
                                <li className={style_dashboard[0]}>
                                    <AiOutlineHome size={25} />
                                    Tableau de bord
                                </li>
                            </Link>
                            <Link href="/my-meals">
                                <li className={style_dashboard[1]}>
                                    <MdOutlineFastfood size={25} />
                                    Mes repas
                                </li>
                            </Link>
                            <Link href="/my-list">
                                <li className={style_dashboard[2]}>
                                    <BsListCheck size={25} />
                                    Ma liste de courses
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
                                        {"Centre d'aide"}
                                    </li>
                                </Link>
                                <hr className="separator__hr" />
                                <Link href="/login">
                                    <li className="">
                                        <MdLogout size={25} />
                                        Se déconnecter
                                    </li>
                                </Link>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
