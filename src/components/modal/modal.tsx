import Head from "next/head";
import { AiOutlineHome, AiOutlineClose } from "react-icons/ai";
import { MdOutlineFastfood, MdLogout } from "react-icons/md";
import { BsEnvelopePaper } from "react-icons/bs";
import { FiHelpCircle } from "react-icons/fi";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { GiWheat } from "react-icons/gi";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Link from "next/link";
import { IMeal } from "@/api/meal/get_meals";
import { create_meals } from "@/api/meal/create_meals";
import { NextRouter } from "next/router";
import React from "react";

interface IModal {
    children: React.ReactNode;
    setModal: Dispatch<SetStateAction<boolean>>;
    open_modal: boolean;
    title: string;
    modalProps?: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLDivElement>,
        HTMLDivElement
    >;
}

const Modal: React.FC<IModal> = (props) => {
    if (props.open_modal == true)
        return (
            <React.Fragment>
                <div id="myModal" className="modal" {...props.modalProps}>
                    <div className="modal-content">
                        <div className="header-modal__box">
                            <h1 className="title_modal">{props.title}</h1>
                            <span
                                className="close"
                                onClick={() => props.setModal(false)}
                            >
                                &times;
                            </span>
                        </div>
                        <div className="body-modal__box">{props.children}</div>
                    </div>
                </div>
            </React.Fragment>
        );
    else return <React.Fragment></React.Fragment>;
};

Modal.defaultProps = {
    modalProps: {},
};

export default Modal;
