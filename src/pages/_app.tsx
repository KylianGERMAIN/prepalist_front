import { store } from "@/redux/store";
import { Provider } from "react-redux";
import "../styles/globals.scss";
import type { AppProps } from "next/app";

const App: React.FC<AppProps> = (props) => {
    return (
        <Provider store={store}>
            <props.Component {...props.pageProps} />
        </Provider>
    );
};

export default App;
