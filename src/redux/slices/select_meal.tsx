import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { stat } from "fs";

export interface Imeal {
    name: string;
    id: string;
    servings: number;
    ingredients: { ingredient: string }[];
    created_at?: string;
}

const initial_state: Imeal = {
    name: "",
    id: "",
    servings: 0,
    ingredients: [],
};

export const select_meal_slice = createSlice({
    reducers: {
        reset_select_meal: (state: Imeal, action: PayloadAction<Imeal>) => {
            state = initial_state;
        },
        set_actual_meal: (state: Imeal, action: PayloadAction<Imeal>) => {
            state = action.payload;
            return state;
        },
    },
    name: "select_meal",
    initialState: initial_state,
});

// actions
export const { reset_select_meal, set_actual_meal } = select_meal_slice.actions;

// selectors
export const select_meal = (state: RootState) => state.noteReducer;

export default select_meal_slice.reducer;
