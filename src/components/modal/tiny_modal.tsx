import { Dispatch, SetStateAction } from "react";
import React from "react";

interface IUpdate_meal_content {
    children: React.ReactNode;
    setModal: Dispatch<SetStateAction<boolean>>;
    open_modal: boolean;
    title: string;
}

const Tiny_Modal: React.FC<IUpdate_meal_content> = (props) => {
    if (props.open_modal == true)
        return (
            <React.Fragment>
                <div id="myModal" className="tiny-modal">
                    <div className="tiny-modal-content">
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

export default Tiny_Modal;
