import Head from "next/head";
import { Sidebar } from "../home";
import { AiOutlineHome, AiOutlineClose } from "react-icons/ai";
import Modal_add_meal from "@/components/modal_add_meal";
import { useState } from "react";

function Ingredient() {
    return (
        <div className="classic__input">
            <span className="dark_blue">Name ingredients 1</span>
            <input placeholder="Pasta carbonara" />
        </div>
    );
}

export default function My_meals() {
    const [open_modal, setModal] = useState(false);
    const [listinput, setlistinput] = useState<JSX.Element[]>([
        <Ingredient key="1" />,
    ]);

    return (
        <>
            <Head>
                <title>Prepalist - Home</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="layout">
                {Sidebar()}
                {open_modal == true
                    ? Modal_add_meal(setModal, setlistinput, listinput)
                    : null}
                <div className="home__container">
                    <div className="header-switch-day__box">
                        <div className="date-switch_box basic_grey">
                            <span className="">My meals</span>
                        </div>
                    </div>
                    <div className="body-list__box">
                        <div className="add-meal__box flex">
                            <h3>Total : 234</h3>
                            <button
                                className="classic__button"
                                onClick={() => {
                                    setModal(!open_modal),
                                        setlistinput([<Ingredient key="1" />]);
                                }}
                            >
                                Create
                            </button>
                        </div>
                        <div className="meal-list__box">
                            <div className="name-meal__box">
                                <h4>Pate à la carbonara</h4>
                                <span>Ajouté le 18 Mars 2023</span>
                            </div>
                            <AiOutlineClose
                                size={25}
                                onClick={() => console.log("delete element")}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
