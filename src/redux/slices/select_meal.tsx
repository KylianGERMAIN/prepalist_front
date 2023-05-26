import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

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
    ingredients: [{ ingredient: "" }],
};

export const select_meal_slice = createSlice({
    reducers: {
        reset_select_meal: (state: Imeal, action: PayloadAction<Imeal>) => {
            return (state = initial_state);
        },
        set_actual_meal: (state: Imeal, action: PayloadAction<Imeal>) => {
            return (state = action.payload);
        },
        set_name: (state: Imeal, action: PayloadAction<string>) => {
            console.log(state.ingredients);
            return (state = { ...state, name: action.payload });
        },
        set_one_meal: (state: Imeal) => {
            state.ingredients.push({ ingredient: "" });
            console.log(state.ingredients);
            return state;
        },
        set_ingredient: (
            state: Imeal,
            action: PayloadAction<(string | number)[]>
        ) => {
            state = {
                ...state,
                ingredients: state.ingredients.map((content, i) =>
                    i === (action.payload[0] as number)
                        ? {
                              ...content,
                              ingredient: action.payload[1] as string,
                          }
                        : content
                ),
            };
            return state;
        },
    },
    name: "select_meal",
    initialState: initial_state,
});

// actions
export const {
    reset_select_meal,
    set_actual_meal,
    set_name,
    set_one_meal,
    set_ingredient,
} = select_meal_slice.actions;

// selectors
export const select_meal = (state: RootState) => state.noteReducer;

export default select_meal_slice.reducer;
