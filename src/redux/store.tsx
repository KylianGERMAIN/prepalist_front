import { configureStore } from "@reduxjs/toolkit";
import select_meal_reducer from "./slices/select_meal";
import week_reducer from "./slices/week";

export const store = configureStore({
    reducer: {
        select_meal_reducer,
        week_reducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
