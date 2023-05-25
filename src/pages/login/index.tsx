import { login } from "@/api/authentification/login";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";

const Login: React.FC = (props) => {
    const [email, set_email] = useState<string>("");
    const [password, set_password] = useState<string>("");
    const [error, set_error] = useState<string>("");
    const router = useRouter();

    return (
        <>
            <Head>
                <title>Prepalist - Connexion</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="layout">
                <div className="authentification__container flex">
                    <div className="center-midle-screen">
                        <div className="login__section">
                            <h1>Connexion</h1>
                            <div className="classic__input">
                                <span className="color--dark_blue">
                                    Adresse mail
                                </span>
                                <input
                                    placeholder="Votre adresse mail"
                                    value={email}
                                    onChange={(e) => set_email(e.target.value)}
                                />
                            </div>
                            <div className="classic__input">
                                <span className="color--dark_blue">
                                    Mot de passe
                                </span>
                                <input
                                    placeholder="Votre mot de passe"
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        set_password(e.target.value)
                                    }
                                />
                            </div>
                            <div
                                onClick={() =>
                                    login(email, password, set_error, router)
                                }
                            >
                                <button
                                    className={
                                        error.length != 0
                                            ? "classic__button--without_focus"
                                            : "classic__button"
                                    }
                                >
                                    Connexion
                                </button>
                            </div>
                            <div>
                                <span className="error-content__text">
                                    {error}
                                </span>
                            </div>
                            <div className="bottom_message_login">
                                <span className="color--grey">
                                    {"Vous n'avez pas de compte ?"}
                                </span>
                                <Link href="/register">
                                    <span className="color--blue">
                                        Inscription
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="authentification-second__box" />
                </div>
            </div>
        </>
    );
};

export default Login;
