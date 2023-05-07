import Head from "next/head";
import { Sidebar, options } from "../home";
import { AiOutlineClose } from "react-icons/ai";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { IMeal, get_meals } from "@/api/meal/get_meals";
import { useRouter } from "next/router";
import { delete_meal } from "@/api/meal/delete_meals";
import Modal from "@/components/modal/modal";
import Add_meal_content_modal from "@/components/modal/add_meal";

export default function My_meals() {
    const router = useRouter();

    useEffect(() => {}, [router]);

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
                    <div className="body-list__box"></div>
                </div>
            </div>
        </>
    );
}
