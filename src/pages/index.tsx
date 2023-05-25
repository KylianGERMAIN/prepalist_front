import Router from "next/router";
import { useEffect } from "react";

const Basic: React.FC = (props) => {
    useEffect(() => {
        Router.push(`/login`);
    }, []);

    return null;
};

export default Basic;
