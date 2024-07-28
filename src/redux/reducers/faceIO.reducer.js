import {createSlice} from '@reduxjs/toolkit';

const faceIOSlice = createSlice({
    name: 'faceIO',
    initialState:{
        faceioInstance: null
    },
    reducers:{
        setFaceIO: (state,action)=>{
            state.faceioInstance = action.payload;
        },
    }
})
export const {setFaceIO} = faceIOSlice.actions;

export default faceIOSlice.reducer;