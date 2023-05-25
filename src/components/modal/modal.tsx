import { Dispatch, SetStateAction } from "react";
import React from "react";

interface IModal {
    children: React.ReactNode;
    set_modal: Dispatch<SetStateAction<boolean>>;
    open_modal: boolean;
    title: string;
}

const Modal: React.FC<IModal> = (props) => {
    if (props.open_modal == true)
        return (
            <React.Fragment>
                <div id="myModal" className="modal">
                    <div className="modal-content">
                        <div className="header-modal__box">
                            <h1 className="title_modal">{props.title}</h1>
                            <span
                                className="close"
                                onClick={() => props.set_modal(false)}
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

export default Modal;
