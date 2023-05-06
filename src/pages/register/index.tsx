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
                <title>Prepalist - Login</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="layout">
                <div className="authentification__container flex">
                    <div className="authentification-second__box" />
                    <div className="center-midle-screen ">
                        <div className="login__section">
                            <h1>Register</h1>
                            <div className="classic__input">
                                <span className="dark_blue">Name</span>
                                <input
                                    placeholder="Your name"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                />
                            </div>
                            <div className="classic__input">
                                <span className="dark_blue">Email</span>
                                <input
                                    placeholder="Your address email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="classic__input">
                                <span className="dark_blue">Password</span>
                                <input
                                    placeholder="Your password"
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
                                            ? "classic__button_without_focus"
                                            : "classic__button"
                                    }
                                >
                                    Create an account
                                </button>
                                <div>
                                    <span className="error_content">
                                        {error}
                                    </span>
                                </div>
                            </div>
                            <div className="bottom_message_register">
                                <span className="basic_grey">
                                    Already have an account?
                                </span>
                                <Link href="/login">
                                    <span className="blue_opacity">Login</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
