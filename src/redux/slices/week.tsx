import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { Imeal } from "./select_meal";

export interface Iday {
    date: string;
    lunch: Imeal;
    dinner: Imeal;
}

export interface Iweek {
    week: Iday[];
}

const initial_state: Iweek = {
    week: [],
};

export const week_slice = createSlice({
    reducers: {
        reset_week: (state: Iweek) => {
            return (state = initial_state);
        },
    },
    name: "week",
    initialState: initial_state,
});

// actions
export const { reset_week } = week_slice.actions;

// selectors
export const week = (state: RootState) => state.noteReducer;

export default week_slice.reducer;
