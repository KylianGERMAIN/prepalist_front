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
                    <div className="authentification-first__box center-midle-screen ">
                        <div className="login__section">
                            <h1>Log in</h1>
                            <div className="classic__input">
                                <span className="dark_blue">Email</span>
                                <input placeholder="Your address email " />
                            </div>
                            <div className="classic__input">
                                <span className="dark_blue">Password</span>
                                <input placeholder="Your password" />
                            </div>
                            <button className="classic__button">Login</button>
                            <div className="bottom_message_login">
                                <span className="basic_grey">
                                    New to Prepalist?
                                </span>
                                <Link href="/register">
                                    <span className="blue_opacity">
                                        Get Started
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="authentification-second__box"></div>
                </div>
            </div>
        </>
    );
}
