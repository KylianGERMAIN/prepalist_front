import Head from "next/head";
import { AiOutlineHome, AiOutlineClose } from "react-icons/ai";
import { MdOutlineFastfood, MdLogout } from "react-icons/md";
import { BsEnvelopePaper } from "react-icons/bs";
import { FiHelpCircle } from "react-icons/fi";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/Io";
import { GiWheat } from "react-icons/gi";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Link from "next/link";

function Ingredient() {
    return (
        <div className="classic__input">
            <span className="dark_blue">Name ingredients 1</span>
            <input placeholder="Pasta carbonara" />
        </div>
    );
}

export default function Modal_add_meal(
    setModal: Dispatch<SetStateAction<boolean>>,
    setlistinput: Dispatch<SetStateAction<JSX.Element[]>>,
    listinput: JSX.Element[]
) {
    return (
        <div id="myModal" className="modal">
            <div className="modal-content">
                <div className="header-modal__box">
                    <span>Create new meal</span>
                    <span className="close" onClick={() => setModal(false)}>
                        &times;
                    </span>
                </div>
                <div className="body-modal__box">
                    <div className="classic__input padding--modal">
                        <span className="dark_blue">Name</span>
                        <input placeholder="Pasta carbonara" />
                    </div>

                    <div className="ingredients__box">
                        {listinput.map((element) => element)}
                        <div className="flex ingredients-button__box">
                            <button
                                className="classic__button"
                                onClick={() =>
                                    setlistinput((listinput) => [
                                        ...listinput,
                                        <Ingredient
                                            key={(
                                                listinput.length + 1
                                            ).toString()}
                                        />,
                                    ])
                                }
                            >
                                Add 1 ingredients
                            </button>
                            <button
                                className="classic__button"
                                onClick={() => setModal(false)}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
