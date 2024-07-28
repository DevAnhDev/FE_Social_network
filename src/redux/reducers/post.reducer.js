import {createSlice} from '@reduxjs/toolkit';

const postSlice = createSlice({
    name: 'post',
    initialState:{
        dataPost:[],
        listLike:[],
        dataPostOfUser:[],
        postShowingLike:null,
        dataComment:[]
    },
    reducers:{
        updateDataPost: (state,action)=>{
            state.dataPost = action.payload;
        },
        updateListLike: (state,action)=>{
            state.listLike = action.payload;
        },
        updatePostShowingLike : (state,action)=>{
            state.postShowingLike = action.payload;
        },
        updateDataPostOfUser: (state,action)=>{
            state.dataPostOfUser = action.payload;
        },
        updateDataComment: (state,action)=>{
            state.dataComment = action.payload;
        }
    }
})
export const {updateDataPost,updateListLike,updatePostShowingLike,updateDataPostOfUser,updateDataComment} = postSlice.actions;

export default postSlice.reducer;