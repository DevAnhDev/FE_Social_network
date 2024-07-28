import React,{memo,useEffect,useState} from 'react';
import {useSelector,useDispatch} from 'react-redux';
import * as FetchAPI from '../../utils/fetchAPI';
import avatarDefault from '../../assets/logo/avatar.jpg';
import { List,Button,message } from 'antd';
import {updateDataAddFriendSent} from '../../redux/reducers/friend.reducer';
import {useNavigate} from 'react-router-dom';
function AddFriendSent({socket}){
    const {currentUser} = useSelector(e=>e.UserReducer);
    const {dataAddFriendSent} = useSelector(e=>e.FriendReducer);
    const [statusLoading, setstatusLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        setstatusLoading(true)
        getDataAddFriendSent();
    },[])

    const getDataAddFriendSent = async()=>{
        const data = {"idUser":currentUser.idUser};
        const res = await FetchAPI.postDataAPI("/friends/getAddFriendSent",data);
        dispatch(updateDataAddFriendSent(res.msg));
        setstatusLoading(false)
    }

    const handleCancelAdd = async(item,index)=>{
        const data = {"sourceId":currentUser.idUser,"targetId":item.idUser};
        const res = await FetchAPI.postDataAPI("/friends/cancelAddFriend",data);
        if(res.msg){
            if(res.msg==="Success"){
                socket.emit("cancelAddFriend",{"idToSend":item.idUser,"idUser":currentUser.idUser});
                message.warning("Đã hủy");
                let arr = JSON.parse(JSON.stringify(dataAddFriendSent));
                arr.splice(index,1);
                dispatch(updateDataAddFriendSent(arr));
            }
        }
    }
    return(
        <div className="wrapperFindFriend">
            <List
                grid={{ gutter: 16, xs:2,sm:2,md:3,lg:3,xl:4,xxl:5 }}
                dataSource={dataAddFriendSent}
                loading={statusLoading}
                locale={{emptyText:"Bạn không có lời kết bạn mời đang chờ ..."}}
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
                            <Button className="btn_sent" disabled>Đã gửi lời mời</Button>
                            <Button className="btn_cancel" onClick={()=>handleCancelAdd(item,index)}>Hủy</Button>
                        </div>
                        
                    </div>
                </List.Item>
                )}
            />
        </div>
    )
}

export default memo(AddFriendSent);