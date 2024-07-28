import React,{memo,useEffect,useState} from 'react';
import {useSelector,useDispatch} from 'react-redux';
import * as FetchAPI from '../../utils/fetchAPI';
import avatarDefault from '../../assets/logo/avatar.jpg';
import { List,Button,message } from 'antd';
import {updateDataRequestFriend} from '../../redux/reducers/friend.reducer';
import {updateDataFriend} from '../../redux/reducers/user.reducer';
import {useNavigate} from 'react-router-dom'
function RequestAddFriend({socket}){
    const {currentUser} = useSelector(e=>e.UserReducer);
    const {dataRequestAddFriend} = useSelector(e=>e.FriendReducer);
    const [statusLoading, setstatusLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        setstatusLoading(true)
        getRequestAddFriend();
    },[])

    const getRequestAddFriend = async()=>{
        const data = {"idUser":currentUser.idUser};
        const res = await FetchAPI.postDataAPI("/friends/getRequestAddFriend",data);
        dispatch(updateDataRequestFriend(res.msg))
        setstatusLoading(false)
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
        <div className="wrapperFindFriend">
            <List
                grid={{ gutter: 16, xs:2,sm:2,md:3,lg:3,xl:4,xxl:5 }}
                dataSource={dataRequestAddFriend}
                loading={statusLoading}
                pagination={dataRequestAddFriend.length>8?{ defaultCurrent:1,pageSize:8}:false}
                locale={{emptyText:"Bạn không có lời mời kết bạn nào ..."}}
                renderItem={(item,index) => (
                <List.Item>
                    <div className="itemFriendToAdd">
                        {item.avatar !== null ?<img className="avatar" src={item.avatar} alt="avatar"/>:
                        <img className="avatar" src={avatarDefault} alt="avatar"/>
                        }
                        <p onClick={()=>navigate(`/profile/${item.idUser}`)} style={{ cursor:'pointer' }}>
                            {`${item.firstName} ${item.lastName}`}
                        </p>
                  
                        <div className="group_btn_sent">
                            <Button className="btn_accept" onClick={()=>handleAcceptAddFriend(item,index)}>Đồng ý</Button>
                            <Button className="btn_cancel" onClick={()=>handleRejectAddFriend(item,index)}>Từ chối</Button>
                        </div>
                        
                    </div>
                </List.Item>
                )}
            />
        </div>
    )
}

export default memo(RequestAddFriend);