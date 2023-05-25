import { Dispatch, SetStateAction } from "react";
import React from "react";

export default function Tiny_Modal({
    children,
    setModal,
    open_modal,
    title,
}: {
    children: React.ReactNode;
    setModal: Dispatch<SetStateAction<boolean>>;
    open_modal: boolean;
    title: string;
}) {
    if (open_modal == true)
        return (
            <React.Fragment>
                <div id="myModal" className="tiny-modal">
                    <div className="tiny-modal-content">
                        <div className="header-modal__box">
                            <h1 className="title_modal">{title}</h1>
                            <span
                                className="close"
                                onClick={() => setModal(false)}
                            >
                                &times;
                            </span>
                        </div>
                        <div className="body-modal__box">{children}</div>
                    </div>
                </div>
            </React.Fragment>
        );
    else return <React.Fragment></React.Fragment>;
}
