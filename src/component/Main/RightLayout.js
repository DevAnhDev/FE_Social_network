import React ,{memo,useEffect,useState} from 'react';
import {useSelector,useDispatch} from 'react-redux';
import * as FetchAPI from '../../utils/fetchAPI';
import avatarDefault from '../../assets/logo/avatar.jpg'
import {timeAgo} from '../../utils/timeAgo';
import {updateDataFriend} from '../../redux/reducers/user.reducer';
import {useNavigate} from 'react-router-dom';
import {Button,message} from 'antd';
import {updateDataRequestFriend} from '../../redux/reducers/friend.reducer';

function RightLayout ({socket}){
    const {currentUser,dataFriend,userOnline} = useSelector(e=>e.UserReducer);
    const {dataRequestAddFriend} = useSelector(e=>e.FriendReducer);
    const [showContent, setshowContent] = useState(false);
    const [currentTime, setcurrentTime] = useState(new Date());
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(()=>{
        setshowContent(false)
        if(currentUser!==null){
            getDataFriend()
        }
    },[currentUser])
    useEffect(() => {
        const interval = setInterval(()=>{
            setcurrentTime(new Date());
        },1000)
        return () => clearInterval(interval);
    },[])
    useEffect(()=>{
        if(currentUser!==null){
            getRequestAddFriend();
        }
    },[currentUser])
    const getRequestAddFriend = async()=>{
        const data = {"idUser":currentUser.idUser};
        const res = await FetchAPI.postDataAPI("/friends/getRequestAddFriend",data);
        dispatch(updateDataRequestFriend(res.msg))
    }

    const getDataFriend = async()=>{
        const data = {"idUser":currentUser.idUser};
        const res = await FetchAPI.postDataAPI("/user/getFriendById",data);
        dispatch(updateDataFriend(res.msg));
        setshowContent(true)
    }
    const handleAcceptAddFriend = async(item,index)=>{
        const data = {"sourceId":currentUser.idUser,"targetId":item.idUser};
        const res = await FetchAPI.postDataAPI("/friends/acceptAddFriend",data);
        if(res.msg){
            if(res.msg==="Success"){
                const data = {"sourceId":currentUser.idUser,"targetId":item.idUser,"type":2};
                const notify = await FetchAPI.postDataAPI("/friends/notifyThenSendFriend",data);
                if(notify.msg){
                    if(notify.msg==="Success"){
                        message.success(`Bạn đã trở thành bạn bè với ${item.firstName} ${item.lastName}`);
                        let arr = JSON.parse(JSON.stringify(dataRequestAddFriend));
                        arr.splice(index,1);
                        dispatch(updateDataRequestFriend(arr));
                        const friend = await FetchAPI.postDataAPI("/user/getFriendById",{"idUser":currentUser.idUser});
                        dispatch(updateDataFriend(friend.msg));
                        socket.emit("acceptAddFriend",{
                            "idToSend":item.idUser,
                            "firstName":currentUser.firstName,
                            "lastName":currentUser.lastName,
                            "avatar":currentUser.avatar,
                            "idUser":currentUser.idUser,
                            "type":2,
                            "read":0,
                            "trash":0,
                            "create_at": new Date(),
                            "id":notify.idNotify
                        })
                    }
                }
            }else{
                message.error("Có lỗi rồi !!!");
            }
        }
    }
    const handleRejectAddFriend = async(item,index)=>{
        const data = {"sourceId":currentUser.idUser,"targetId":item.idUser};
        const res = await FetchAPI.postDataAPI("/friends/rejectAddFriend",data);
        if(res.msg){
            if(res.msg==="Success"){
                message.warning(`Bạn đã từ chối lời mời kết bạn của ${item.firstName} ${item.lastName}`);
                let arr = JSON.parse(JSON.stringify(dataRequestAddFriend));
                arr.splice(index,1);
                dispatch(updateDataRequestFriend(arr));
                socket.emit("rejectAddFriend",{ "idToSend":item.idUser,"idUser":currentUser.idUser});
            }
        }
    }
    return(
    <div className="wrapperRight">
        {showContent &&
        <div>
        <div className="requestToAddRefriend">
            <div className="lable">
                <h3>Lời mời kết bạn</h3>
            </div>
            {dataRequestAddFriend.length===0?
            <div className="nullRequest">
                <p>Bạn chưa có lời mời kết bạn nào ...</p>
                <Button onClick={()=>navigate("/friends")}>Tìm bạn ngay</Button>
            </div>
            :
            <div>
                {dataRequestAddFriend.map((e,index)=>(
                    <>
                    {index<2 &&
                    <div className="itemContact" >
                        <div className="infor">
                        {e.avatar!==null ?
                            <img onClick={()=>navigate(`/profile/${e.idUser}`)} className="avatar" src={e.avatar} alt="avatar"/>
                            :
                            <img onClick={()=>navigate(`/profile/${e.idUser}`)} className="avatar" src={avatarDefault} alt="avatar"/>
                        }
                        <div className="name">
                            <p>{`${e.firstName} ${e.lastName} muốn kết bạn với bạn.`}</p>
                        </div>
                        </div>
                        <div className="group_btn_ask">
                            <Button type='primary' onClick={()=>handleAcceptAddFriend(e,index)}>Đồng ý</Button>
                            <Button onClick={()=>handleRejectAddFriend(e,index)}>Từ chối</Button>
                        </div>
                      
                    </div>
                   }
                </>
                ))}
               
            </div>
            }
        </div>
        <div className="wrapperContact">
            <div className="lable">
                <h3>Bạn bè</h3>
            </div>
            {dataFriend.length===0 ?
            <div>
                Kết nối đến bạn bè ...
                <div className="wrapper_btn">
                <button className="btn_find_friend" onClick={()=>navigate("/friends")}>Tìm bạn ngay</button>
                </div>
            </div>
            :
            <div>
                {dataFriend.map(e=>(
                    <div className="itemContact" onClick={()=>navigate(`/profile/${e.idUser}`)}>
                        {e.avatar!==null ?
                            <img className="avatar" src={e.avatar} alt="avatar"/>
                            :
                            <img className="avatar" src={avatarDefault} alt="avatar"/>
                        }
                        <div className="name">
                            <p>{`${e.firstName} ${e.lastName}`}</p>
                        </div>
                        {userOnline !== null &&
                        <div>
                            {userOnline.find(p=>p.targetId===e.idUser) ?
                                <div>
                                    <div className="online" />
                                    <span className="lastLogin">Đang hoạt động</span>
                                </div>
                                :
                                <div className="lastLogin">
                                    {`${timeAgo(currentTime,e.lastLogin)}`}
                                </div>
                            }
                        </div>
                        }
                    </div>
                ))}
            </div>
            }
        </div>
        </div>
        }
    </div>
    )
    
}

export default memo(RightLayout);