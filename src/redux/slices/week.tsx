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
        set_week: (state: Iweek, action: PayloadAction<Iweek>) => {
            console.log(action.payload.week);
            state.week = action.payload.week;
        },
        set_lunch_name: (
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
        set_dinner_name: (
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
    name: "week",
    initialState: initial_state,
});

// actions
export const { reset_week, set_week, set_lunch_name, set_dinner_name } =
    week_slice.actions;

// selectors
export const week = (state: RootState) => state.week_reducer;

export default week_slice.reducer;
