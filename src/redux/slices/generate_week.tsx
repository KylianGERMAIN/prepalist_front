import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { Iweek, Iday } from "./week";

const initial_state: Iweek = {
    week: [],
};

export const generate_week_slice = createSlice({
    reducers: {
        reset_generate_week: (state: Iweek) => {
            return (state = initial_state);
        },
        set_generate_week: (state: Iweek, action: PayloadAction<Iweek>) => {
            state.week = action.payload.week;
        },
        set_generate_lunch_name: (
            state: Iweek,
            action: PayloadAction<(string | number | undefined)[]>
        ) => {
            state = {
                ...state,
                week: state.week.map((content: Iday, i) =>
                    i === (action.payload[0] as number)
                        ? {
                              ...content,
                              lunch: {
                                  ...content.lunch,
                                  name: action.payload[1] as string,
                                  id: action.payload[2] as string,
                                  serving: action.payload[3] as number,
                              },
                          }
                        : content
                ),
            };
            return state;
        },
        set_generate_dinner_name: (
            state: Iweek,
            action: PayloadAction<(string | number | undefined)[]>
        ) => {
            state = {
                ...state,
                week: state.week.map((content: Iday, i) =>
                    i === (action.payload[0] as number)
                        ? {
                              ...content,
                              dinner: {
                                  ...content.dinner,
                                  name: action.payload[1] as string,
                                  id: action.payload[2] as string,
                                  serving: action.payload[3] as number,
                              },
                          }
                        : content
                ),
            };
            return state;
        },
    },
    name: "generate_week",
    initialState: initial_state,
});

// actions
export const {
    reset_generate_week,
    set_generate_week,
    set_generate_lunch_name,
    set_generate_dinner_name,
} = generate_week_slice.actions;

// selectors
export const generate_week = (state: RootState) => state.generate_week_reducer;

export default generate_week_slice.reducer;
