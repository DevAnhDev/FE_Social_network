import React ,{useRef,useEffect}from 'react';
import SoundNotification from '../assets/audio/notify.mp3';
import SoundNotificationMain from '../assets/audio/notification_main.wav';
import {useDispatch,useSelector} from 'react-redux';
import {updateMessenges,updateCall,updateListRoom,updateVisibleCall,updateIdRoomCall,updateStatusCall} from '../redux/reducers/messenges.reducer';
import { updateUserOnline , updateDataFriend} from '../redux/reducers/user.reducer';
import {updateQuantityUnread,updateDataNotification} from '../redux/reducers/notification.reducer';
import { updateDataRequestFriend, updateDataToAddFriend,updateDataAddFriendSent} from '../redux/reducers/friend.reducer';
import { updateDataPost, updateListLike, updateDataPostOfUser, updateDataComment } from '../redux/reducers/post.reducer';
import {notification } from 'antd';
import { useLocation } from 'react-router-dom';
import * as FetchAPI from './fetchAPI';

function SocketClient({socket}) {
    const audioNotifyRef = useRef();
    const audioNotifyMain = useRef();
    const dispatch = useDispatch();
    const {currentMessenges,datacall} = useSelector(e=>e.MessengesReducer);
    const {currentUser,followers,followings,currentIdRoom,dataFriend} = useSelector(e=>e.UserReducer);
    const {dataNotification} = useSelector(e=>e.NotificationReducer);
    const {dataRequestAddFriend,dataToAddFriend,dataAddFriendSent} = useSelector(e=>e.FriendReducer);
    const {dataPost,listLike,postShowingLike,dataPostOfUser,dataComment} = useSelector(e=>e.PostReducer);
    const location = useLocation();
    
    //JoinUser
    useEffect(() => {
        if(currentUser!==null){
            const data = {"idUser":currentUser.idUser,"followers":followers}
            socket.emit('joinUser', data);
        }
        return ()=>{
            socket.off('joinUser');
        }
    }, [socket, currentUser])

    //GetUserOnl
    useEffect(() => {
        const data = {"followings":followings};
        socket.on("changeJoin",async(_)=>{
            socket.emit("checkUserOnline",data);
            //Update friend to see lastLogin
            const res = await FetchAPI.postDataAPI("/user/getFriendById",{"idUser":currentUser.idUser});
            dispatch(updateDataFriend(res.msg));
            //Update array user online
        })
        socket.on("getUserOnline",data=>{
            console.log("run")
            dispatch(updateUserOnline(data));
        })
        return ()=>{
            socket.off('changeJoin');
            socket.off('getUserOnline');
        }
    },[socket])

    // Message
    useEffect(() => {
        socket.on("message", async(data) => {
            updateRoom();
            const res = await FetchAPI.postDataAPI("/user/getInforById",{"idUser":data.sourceId})
            const dataUserSent = res.msg[0];
            if(currentIdRoom===null){
                if(data.sourceId!==currentUser.idUser){
                    audioNotifyRef.current.play();
                    notification.open({
                        message: 'Tin nhắn mới',
                        description:
                            `Bạn có một tin nhắn từ ${dataUserSent.firstName} ${dataUserSent.lastName}`,
                        onClick: () => {
                          console.log('Notification Clicked!');
                        },
                    });
                }
            }else{
                if(location.pathname.includes(`/messenges/${data.idRoom}`)){
                    if(data.sourceId!==currentUser.idUser){
                        audioNotifyRef.current.play();
                    }
                    let arr = JSON.parse(JSON.stringify(currentMessenges));
                    arr.push(
                        {
                            avatar: dataUserSent.avatar,
                            sourceId: data.sourceId,
                            firstName: dataUserSent.firstName,
                            lastName: dataUserSent.lastName,
                            message: data.message,
                            typeMess: data.typeMess,
                            create_at: data.create_at
                        }
                    )
                    console.log(arr);
                    dispatch(updateMessenges(arr));
                }else{
                    if(data.sourceId!==currentUser.idUser){
                        audioNotifyRef.current.play();
                        notification.open({
                            message: 'Tin nhắn mới',
                            description:
                                `Bạn có một tin nhắn từ ${dataUserSent.firstName} ${dataUserSent.lastName}`,
                            onClick: () => {
                              console.log('Notification Clicked!');
                            },
                        });
                    }
                }
            }
        })
        return () => {
            socket.off("message");
        }
    }, [socket,currentIdRoom,currentMessenges])

    //Call video
    useEffect(() => {
        socket.on("callUser", (data) => {
            dispatch(updateCall(data));
            dispatch(updateStatusCall("called"));
            dispatch(updateIdRoomCall(data.idRoom));
            dispatch(updateVisibleCall(true));
            // navigate(`/video/${data.idRoom}/called`);
            // window.open(`/video/${data.idRoom}/called`,'targetWindow','toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=1000,height=800');
		})
        return () => {
            socket.off("callUser");
        }
    },[socket,datacall])

    //Update list conversions when have new message
    const updateRoom = async()=>{
        const data = {"idUser":currentUser.idUser};
        const res = await FetchAPI.postDataAPI("/messenges/getListCovensation",data);
        dispatch(updateListRoom(res.msg));
    }

    //Update quantity undread
    useEffect(() => {
        let i = 0;
        dataNotification.map(e=>{
            if(e.read===0){
                i++
            }
        })
        dispatch(updateQuantityUnread(i));
    },[dataNotification])

    //UpdateNotifyFriend
    useEffect(() => {
        socket.on("notifyRequestAddFriend",async(data)=>{
            audioNotifyMain.current.play();
            let arr = JSON.parse(JSON.stringify(dataNotification));
            let arr_requestFriend = JSON.parse(JSON.stringify(dataRequestAddFriend));
            let arr_to_addFriend = JSON.parse(JSON.stringify(dataToAddFriend));
            if(arr_to_addFriend.length!==0){
                const index = arr_to_addFriend.findIndex(e=>e.idUser===data.idUser);
                if(index!==-1){
                    arr_to_addFriend.splice(index,1);
                    dispatch(updateDataToAddFriend(arr_to_addFriend));
                }
            }
            arr_requestFriend.push({
                idUser:data.idUser,
                firstName: data.firstName,
                lastName: data.lastName,
                avatar: data.avatar
            })
            const template = await FetchAPI.postDataAPI("/notification/getNotificationTemplate",{"type":data.type});
            arr.splice(0,0,{...data,title:template.msg[0].title,description:template.msg[0].description});
            dispatch(updateDataNotification(arr));
            dispatch(updateDataRequestFriend(arr_requestFriend));
            notification.open({
                message: data.title,
                description:
                    `${data.firstName} ${data.lastName} ${template.msg[0].description}`,
                onClick: () => {
                  console.log('Notification Clicked!');
                },
            });
        })

        socket.on("sendcancelAddFriend",(data)=>{
            const idUser = data.idUser;
            let arr = JSON.parse(JSON.stringify(dataRequestAddFriend));
            const index = arr.findIndex(e=>e.idUser === idUser);
            if(index !== -1){
                arr.splice(index,1);
                dispatch(updateDataRequestFriend(arr));
            }
        })
        return ()=>{
            socket.off("notifyRequestAddFriend");
            socket.off("sendcancelAddFriend")
        }
    },[socket,dataNotification,dataRequestAddFriend,dataToAddFriend])
    
    //Accept and Reject add Friend
    useEffect(() => {
        socket.on("sendAcceptAddFriend",async(data)=>{
            const friend = await FetchAPI.postDataAPI("/user/getFriendById",{"idUser":currentUser.idUser});
            dispatch(updateDataFriend(friend.msg));
            let arr_sent = JSON.parse(JSON.stringify(dataAddFriendSent));
            let arr = JSON.parse(JSON.stringify(dataNotification));
            let arr_to_add = JSON.parse(JSON.stringify(dataToAddFriend));
            const index_sent = arr_sent.findIndex(e=>e.idUser===data.idUser);
            const index_to_add = arr_to_add.findIndex(e=>e.idUser===data.idUser);
            if(index_sent!==-1){
                arr_sent.splice(index_sent,1);
                dispatch(updateDataAddFriendSent(arr_sent));
            }
            if(index_to_add!==-1){
                arr_to_add.splice(index_to_add,1);
                dispatch(updateDataToAddFriend(arr_to_add));
            }
            const template = await FetchAPI.postDataAPI("/notification/getNotificationTemplate",{"type":data.type});
            arr.splice(0,0,{...data,title:template.msg[0].title,description:template.msg[0].description});
            dispatch(updateDataNotification(arr));
            audioNotifyMain.current.play();
            notification.open({
                message: data.title,
                description:
                    `${data.firstName} ${data.lastName} ${template.msg[0].description}`,
                onClick: () => {
                  console.log('Notification Clicked!');
                },
            });

        })
        socket.on("sendRejectAddFriend",(data)=>{
            let arr_sent = JSON.parse(JSON.stringify(dataAddFriendSent));
            const index_sent = arr_sent.findIndex(e=>e.idUser===data.idUser);
            let arr_to_add = JSON.parse(JSON.stringify(dataToAddFriend));
            const index_to_add = arr_to_add.findIndex(e=>e.idUser===data.idUser);
            if(index_sent!==-1){
                arr_sent.splice(index_sent,1);
                dispatch(updateDataAddFriendSent(arr_sent));
            }
            if(index_to_add!==-1){
                arr_to_add.splice(index_to_add,1);
                dispatch(updateDataToAddFriend(arr_to_add));
            }
        })
        socket.on("sendRemoveFriend", (data)=>{
            let arr_friend = JSON.parse(JSON.stringify(dataFriend));
            const index_friend = arr_friend.findIndex(e=>e.idUser===data.idUser);
            arr_friend.splice(index_friend,1);
            dispatch(updateDataFriend(arr_friend));
        })
        return () => {
            socket.off("sendAcceptAddFriend");
            socket.off("sendRejectAddFriend");
            socket.off("sendRemoveFriend");
        }
    },[socket,dataAddFriendSent,dataNotification,dataFriend,dataToAddFriend])

    //addPost
    useEffect(() => {
        socket.on("changeAddPost",async(data)=>{
            const res = await FetchAPI.postDataAPI("/post/getPostRealTime",{"idUser":currentUser.idUser,"idPost":data.idPost});
            if(res.msg){
                let arr = JSON.parse(JSON.stringify(dataPost));
                if(data.idUser == currentUser.idUser){
                    arr.unshift(res.msg[0])
                }else{
                    arr.push(res.msg[0]);
                }
                dispatch(updateDataPost(arr));
                //add notification
                if(res.msg[0].idUser!==currentUser.idUser){
                    const addNotify = await  FetchAPI.postDataAPI("/notification/addNotification",{sourceId:res.msg[0].idUser,targetId:currentUser.idUser,"type":4});
                    if(addNotify.msg){
                        let arr_notify = JSON.parse(JSON.stringify(dataNotification));
                        const template = await FetchAPI.postDataAPI("/notification/getNotificationTemplate",{"type":4});
                        const notify={
                            "firstName":res.msg[0].firstName,
                            "lastName": res.msg[0].lastName,
                            "avatar":res.msg[0].avatar,
                            "idUser":res.msg[0].idUser,
                            "type":4,
                            "read":0,
                            "trash":0,
                            "create_at": new Date(),
                            "id":addNotify.idNotify
                        }
                        arr_notify.splice(0,0,{...notify,title:template.msg[0].title,description:template.msg[0].description});
                        dispatch(updateDataNotification(arr_notify));
                        audioNotifyMain.current.play();
                        notification.open({
                            message: template.msg[0].title,
                            description:
                                `${res.msg[0].firstName} ${res.msg[0].lastName} ${template.msg[0].description}`,
                            onClick: () => {
                            console.log('Notification Clicked!');
                            },
                        });
                    }
                }
            }
            
        })
        return () => {
            socket.off("changeAddPost")
        }
    },[dataPost,dataNotification])

    //Like and Unlike
    useEffect(() => {
        socket.on("changeLikePost",(data)=>{
            let arr_post =  JSON.parse(JSON.stringify(dataPost));
            let arr_post_of_user = JSON.parse(JSON.stringify(dataPostOfUser));
            let arr_listLike =  JSON.parse(JSON.stringify(listLike));
            arr_post.forEach(e=>{
                if(e.id===data.id){
                    if(data.plusLike){
                        e.numberEmotion++;
                    }
                    if(data.idUser===currentUser.idUser){
                        e.statusLike = data.emotion;
                    }
                }
            })
            arr_post_of_user.forEach(e=>{
                if(e.id===data.id){
                    if(data.plusLike){
                        e.numberEmotion++;
                    }
                    if(data.idUser===currentUser.idUser){
                        e.statusLike = data.emotion;
                    }
                }
            })
            if(data.id===postShowingLike){
                arr_listLike.splice(0,0,
                    {
                        idUser:data.idUser,
                        firstName:data.firstName,
                        lastName:data.lastName,
                        avatar:data.avatar,
                        emotion:data.emotion
                    }
                )
                dispatch(updateListLike(arr_listLike));
            }
            dispatch(updateDataPost(arr_post));
            dispatch(updateDataPostOfUser(arr_post_of_user));
        })
        socket.on("changeUnlikePost", (data)=>{
            let arr_post =  JSON.parse(JSON.stringify(dataPost));
            let arr_post_of_user = JSON.parse(JSON.stringify(dataPostOfUser));
            let arr_listLike =  JSON.parse(JSON.stringify(listLike));
            arr_post.forEach(e=>{
                if(e.id===data.id){
                    e.numberEmotion--;
                    if(data.idUser===currentUser.idUser){
                        e.statusLike = 0;
                    }
                }
            })
            arr_post_of_user.forEach(e=>{
                if(e.id===data.id){
                    e.numberEmotion--;
                    if(data.idUser===currentUser.idUser){
                        e.statusLike = 0;
                    }
                }
            })
            if(data.id===postShowingLike){
                const index = arr_listLike.findIndex(e=>e.idUser===data.idUser);
                arr_listLike.splice(index,1);
                dispatch(updateListLike(arr_listLike));
            }
            dispatch(updateDataPost(arr_post));
            dispatch(updateDataPostOfUser(arr_post_of_user));
        })
        return () => {
            socket.off("changeLikePost");
            socket.off("changeUnlikePost");
        }
    },[socket,dataPost,currentUser,listLike,postShowingLike,dataPostOfUser])
    
    //Comment Post
    useEffect(() => {
        socket.on("message_comment",(data)=>{
            let arr_comment = JSON.parse(JSON.stringify(dataComment));
            let arr_post = JSON.parse(JSON.stringify(dataPost));
            let arr_post_of_user = JSON.parse(JSON.stringify(dataPostOfUser));
            let new_data = [...arr_comment];
            arr_comment.map(async(e,index)=>{
                if(e.idPost===data.idPost){
                    const user = await FetchAPI.postDataAPI("/user/getInforById",{"idUser":data.sourceId})
                    if(user.msg){
                        let item = JSON.parse(JSON.stringify(e.data));
                        item.splice(0,0,{
                            idPost:data.idPost,
                            idUser:data.sourceId,
                            comment:data.message,
                            create_at: data.create_at,
                            typeComment: data.typeComment,
                            avatar:user.msg[0].avatar,
                            firstName:user.msg[0].firstName,
                            lastName:user.msg[0].lastName
                        })
                        new_data.splice(index,1);
                        new_data.push({"idPost":data.idPost,data:item});
                        dispatch(updateDataComment(new_data));
                    }
                }
            });
            arr_post.map(e=>{
                if(e.id===data.idPost){
                    if(e.numberComment===null){
                        e.numberComment=1
                    }else{
                        e.numberComment+=1
                    }
                }
            })
            arr_post_of_user.map(e=>{
                if(e.id===data.idPost){
                    if(e.numberComment===null){
                        e.numberComment=1
                    }else{
                        e.numberComment+=1
                    }
                }
            })
            dispatch(updateDataPostOfUser(arr_post_of_user));
            dispatch(updateDataPost(arr_post));
        })
        return () => {
            socket.off("message_comment");
        }
    },[socket,dataComment,dataPost,dataPostOfUser])
    return(
        <>
            <audio style={{ display:'none' }} controls ref={audioNotifyRef}>
                <source src={SoundNotification} type="audio/mp3"></source>
            </audio>
            <audio style={{ display:'none' }} controls ref={audioNotifyMain}>
                <source src={SoundNotificationMain} type="audio/wav"></source>
            </audio>
        </>
    )
}

export default SocketClient;