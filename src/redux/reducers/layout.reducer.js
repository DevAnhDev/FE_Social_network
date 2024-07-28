import {createSlice} from '@reduxjs/toolkit';

const layoutSlice = createSlice({
    name: 'layout',
    initialState:{
        fullscreen:false
    },
    reducers:{
        updateFullScreen: (state,action)=>{
            state.fullscreen = action.payload;
        }
    }
})
export const {updateFullScreen} = layoutSlice.actions;

export default layoutSlice.reducer;