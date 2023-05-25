import { register } from "@/api/authentification/register";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

const Register: React.FC = (props) => {
    const [username, set_username] = useState<string>("");
    const [email, set_email] = useState<string>("");
    const [password, set_password] = useState<string>("");
    const [error, set_error] = useState<string>("");

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
                                        set_username(e.target.value)
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
                                onClick={(e) =>
                                    register(
                                        username,
                                        email,
                                        password,
                                        set_error,
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
};

export default Register;
