import { login } from "@/api/authentification/login";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");

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
                                <span className="dark_blue">Adresse mail</span>
                                <input
                                    placeholder="Votre adresse mail"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="classic__input">
                                <span className="dark_blue">Mot de passe</span>
                                <input
                                    placeholder="Votre mot de passe"
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />
                            </div>
                            <div
                                onClick={() =>
                                    login(email, password, setError, router)
                                }
                            >
                                <button
                                    className={
                                        error.length != 0
                                            ? "classic__button_without_focus"
                                            : "classic__button"
                                    }
                                >
                                    Connexion
                                </button>
                            </div>
                            <div>
                                <span className="error_content">{error}</span>
                            </div>
                            <div className="bottom_message_login">
                                <span className="basic_grey">
                                    {"Vous n'avez pas de compte ?"}
                                </span>
                                <Link href="/register">
                                    <span className="blue_opacity">
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
}
