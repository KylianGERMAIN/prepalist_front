import Head from "next/head";
import Link from "next/link";

export default function Login() {
    return (
        <>
            <Head>
                <title>Prepalist - Login</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="layout">
                <div className="authentification__container flex">
                    <div className="authentification-second__box"></div>
                    <div className="authentification-first__box center-midle-screen ">
                        <div className="login__section">
                            <h1>Register</h1>
                            <div className="classic__input">
                                <span className="dark_blue">Name</span>
                                <input placeholder="Your name" />
                            </div>
                            <div className="classic__input">
                                <span className="dark_blue">Email</span>
                                <input placeholder="Your address email" />
                            </div>
                            <div className="classic__input">
                                <span className="dark_blue">Password</span>
                                <input placeholder="Your password" />
                            </div>

                            <Link href="/home">
                                <button className="classic__button">
                                    Create an account
                                </button>
                            </Link>
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
