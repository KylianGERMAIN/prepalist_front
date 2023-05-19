import { NextRouter } from "next/router";

interface customFetchOptions {
    method: string;
    headers: Headers;
    body?: string;
}

export class customFetch {
    _Options: customFetchOptions;
    _router: NextRouter;

    constructor(Options: customFetchOptions, router: NextRouter) {
        this._Options = Options;
        this._router = router;
    }

    async fetch(URL: string) {
        const response = await fetch(URL, this._Options);
        let data = await response.json();
        if (data.detail == "Invalid token") {
            await this.fetch_refresh();
            data = await this.fetch(URL);
            return data;
        }
        return data;
    }

    async fetch_refresh() {
        const refresh_token = localStorage.getItem("refresh_token") || "";
        var myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${refresh_token}`);
        let refresh_option: customFetchOptions = {
            method: "GET",
            headers: myHeaders,
        };
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_URL_API}/api/v1/refresh_token`,
            refresh_option
        );
        const data = await response.json();
        if (data.detail == "Invalid token") {
            this._router.push("/login");
        }
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        this._Options.headers.set(
            "Authorization",
            "Bearer " + data.access_token
        );
        return data;
    }
}
