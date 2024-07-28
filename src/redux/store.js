import {configureStore} from '@reduxjs/toolkit';
import { combineReducers } from "redux";
import {UserReducer,PostReducer,LayoutReducer,MessengesReducer,NotificationReducer,FriendReducer,FaceIOReducer} from './reducers';

const rootReducer = combineReducers({
    UserReducer,
    PostReducer,
    LayoutReducer,
    MessengesReducer,
    NotificationReducer,
    FriendReducer,
    FaceIOReducer
});

const store = configureStore({
    reducer:rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
    }),
})
// store.dispatch(userReducer.updateUser({id:'12142'}));

export default store;