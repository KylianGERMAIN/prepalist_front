import Head from "next/head";
import { Sidebar, options } from "../home";
import { useEffect, useState } from "react";
import { IMeal } from "@/api/meal/get_meals";
import { useRouter } from "next/router";
import { IIngredient, get_list } from "@/api/list/get_list";

export default function My_meals() {
    const [list, setList] = useState<IIngredient[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const router = useRouter();

    useEffect(() => {
        get_list(router, setList);
        setLoading(false);
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
                    <div className="header-switch-day__box">
                        <div className="date-switch_box basic_grey">
                            <span className="">My list</span>
                        </div>
                    </div>
                    <div className="body-list__box">
                        {loading ? null : (
                            <>
                                <div className="add-meal__box flex">
                                    <h3>Total : {list.length}</h3>
                                </div>
                                {list.map(
                                    (
                                        ingredient: IIngredient,
                                        index: number
                                    ) => (
                                        <div
                                            key={index}
                                            className="meal-list__box"
                                        >
                                            <div className="name-meal__box">
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
}
