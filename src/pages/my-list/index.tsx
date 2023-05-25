import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { IIngredient, get_list } from "@/api/list/get_list";
import Sidebar from "@/components/sidebar/sidebar";

const My_list: React.FC = (props) => {
    const [list, set_list] = useState<IIngredient[]>([]);
    const [loading, set_loading] = useState<boolean>(true);

    const router = useRouter();

    useEffect(() => {
        get_list(router, set_list);
        set_loading(false);
    }, [router]);

    return (
        <>
            <Head>
                <title>Prepalist - Home</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="layout">
                <Sidebar />
                <div className="home__container">
                    <div className="header__container">
                        <div className="date-switch_box color--grey">
                            <span className="">Ma liste de courses</span>
                        </div>
                    </div>
                    <div className="body_container">
                        {loading ? null : (
                            <>
                                <div className="header-meal__box flex">
                                    <h3>Total : {list.length}</h3>
                                </div>
                                {list.map(
                                    (
                                        ingredient: IIngredient,
                                        index: number
                                    ) => (
                                        <div key={index} className="meal__box">
                                            <div className="meal__row">
                                                <h4>{ingredient.ingredient}</h4>
                                            </div>
                                        </div>
                                    )
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default My_list;
