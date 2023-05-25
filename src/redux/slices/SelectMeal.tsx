import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { stat } from "fs";

export interface IMeal {
    name: string;
    id: string;
    servings: number;
    ingredients: { ingredient: string }[];
    created_at?: string;
}

const initialState: IMeal = {
    name: "",
    id: "",
    servings: 0,
    ingredients: [],
};

export const selectMealSlice = createSlice({
    reducers: {
        resetSelectMeal: (state: IMeal, action: PayloadAction<IMeal>) => {
            state = initialState;
        },
        setActualMeal: (state: IMeal, action: PayloadAction<IMeal>) => {
            state = action.payload;
            return state;
        },
    },
    name: "select_meal",
    initialState: initialState,
});

// actions
export const { resetSelectMeal, setActualMeal } = selectMealSlice.actions;

// selectors
export const selectMeal = (state: RootState) => state.noteReducer;

export default selectMealSlice.reducer;
