import { register } from "@/api/authentification/register";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Register() {
    const [username, setUsername] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");

    const router = useRouter();

    return (
        <>
            <Head>
                <title>Prepalist - Inscription</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="layout">
                <div className="authentification__container flex">
                    <div className="authentification-second__box" />
                    <div className="center-midle-screen ">
                        <div className="login__section">
                            <h1>Inscription</h1>
                            <div className="classic__input">
                                <span className="color--dark_blue">Nom</span>
                                <input
                                    placeholder="Votre nom"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                />
                            </div>
                            <div className="classic__input">
                                <span className="color--dark_blue">
                                    Adresse mail
                                </span>
                                <input
                                    placeholder="Votre adresse mail"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                                        setPassword(e.target.value)
                                    }
                                />
                            </div>
                            <div
                                onClick={(e) =>
                                    register(
                                        username,
                                        email,
                                        password,
                                        setError,
                                        router
                                    )
                                }
                            >
                                <button
                                    className={
                                        error.length != 0
                                            ? "classic__button--without_focus"
                                            : "classic__button"
                                    }
                                >
                                    Créer un compte
                                </button>
                                <div>
                                    <span className="error-content__text">
                                        {error}
                                    </span>
                                </div>
                            </div>
                            <div className="bottom_message_register">
                                <span className="color--grey">
                                    Vous avez déjà un compte ?
                                </span>
                                <Link href="/login">
                                    <span className="color--blue">
                                        Connexion
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
