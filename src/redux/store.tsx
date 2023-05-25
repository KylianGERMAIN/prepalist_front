import { configureStore } from "@reduxjs/toolkit";
import noteReducer from "./slices/SelectMeal";

export const store = configureStore({
    reducer: {
        noteReducer,
    },
});

// create types for state and dispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;