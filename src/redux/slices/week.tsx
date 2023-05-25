import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { stat } from "fs";

export interface IDay {
    date: string;
    lunch: { name: string; id: string; serving?: number };
    dinner: { name: string; id: string; serving?: number };
}

export interface IWeek {
    week: IDay[];
}

const initialState: IDay = {
    date: "",
    lunch: { name: "", id: "", serving: 1 },
    dinner: { name: "", id: "", serving: 1 },
};

export const weekSlice = createSlice({
    reducers: {},
    name: "select_meal",
    initialState: initialState,
});

// actions
export const {} = weekSlice.actions;

// selectors
export const selectMeal = (state: RootState) => state.noteReducer;

export default weekSlice.reducer;
