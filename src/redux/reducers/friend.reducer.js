import {createSlice} from '@reduxjs/toolkit';

const friendSlice = createSlice({
    name: 'layout',
    initialState:{
        dataRequestAddFriend:[],
        dataToAddFriend:[],
        dataAddFriendSent:[]
    },
    reducers:{
        updateDataRequestFriend: (state,action)=>{
            state.dataRequestAddFriend = action.payload;
        },
        updateDataToAddFriend: (state,action)=>{
            state.dataToAddFriend = action.payload;
        },
        updateDataAddFriendSent: (state,action)=>{
            state.dataAddFriendSent = action.payload;
        }
    }
})
export const {updateDataRequestFriend,updateDataToAddFriend,updateDataAddFriendSent} = friendSlice.actions;

export default friendSlice.reducer;