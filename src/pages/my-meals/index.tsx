import Head from "next/head";
import { Sidebar, options } from "../home";
import { AiOutlineClose } from "react-icons/ai";
import Modal_add_meal from "@/components/modal_add_meal";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { IMeal, get_meals } from "@/api/meal/get_meals";
import { useRouter } from "next/router";
import { delete_meal } from "@/api/meal/delete_meals";

export default function My_meals() {
    const [open_modal, setModal] = useState(false);
    const [listMeal, setMeal] = useState<IMeal[]>([]);

    const router = useRouter();

    useEffect(() => {
        get_meals(router, setMeal);
    }, [router]);

    return (
        <>
            <Head>
                <title>Prepalist - Home</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="layout">
                <Sidebar />
                {open_modal == true ? (
                    <Modal_add_meal
                        setModal={setModal}
                        setMeal={setMeal}
                        router={router}
                    />
                ) : null}
                <div className="home__container">
                    <div className="header-switch-day__box">
                        <div className="date-switch_box basic_grey">
                            <span className="">My meals</span>
                        </div>
                    </div>
                    <div className="body-list__box">
                        <div className="add-meal__box flex">
                            <h3>Total : {listMeal.length}</h3>
                            <button
                                className="classic__button"
                                onClick={() => {
                                    setModal(!open_modal);
                                }}
                            >
                                Create
                            </button>
                        </div>
                        {listMeal.length == 0
                            ? null
                            : listMeal.map((meal: IMeal, index: number) => (
                                  <div key={index} className="meal-list__box">
                                      <div className="name-meal__box">
                                          <h4>{meal.name}</h4>
                                          <span>
                                              Ajouté le{" "}
                                              {meal.created_at
                                                  ? new Date(
                                                        meal.created_at.split(
                                                            " "
                                                        )[0]
                                                    ).toLocaleDateString(
                                                        "fr-FR",
                                                        options
                                                    )
                                                  : "null"}
                                          </span>
                                      </div>
                                      <AiOutlineClose
                                          size={25}
                                          onClick={(e) => {
                                              delete_meal(
                                                  listMeal,
                                                  meal.id,
                                                  router,
                                                  setMeal
                                              );
                                          }}
                                      />
                                  </div>
                              ))}
                    </div>
                </div>
            </div>
        </>
    );
}
