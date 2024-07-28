import React,{memo,useEffect,useState} from 'react';
import {useSelector,useDispatch} from 'react-redux';
import * as FetchAPI from '../../utils/fetchAPI';
import avatarDefault from '../../assets/logo/avatar.jpg';
import { List,Button,message,Input } from 'antd';
import {updateDataToAddFriend} from '../../redux/reducers/friend.reducer';
import {useNavigate} from 'react-router-dom';

const { Search } = Input;

function FindFriend ({socket}){
    const {currentUser} = useSelector(e=>e.UserReducer);
    const {dataToAddFriend} = useSelector(e=>e.FriendReducer);
    const [datatoShow, setdatatoShow] = useState([]);
    const [searched, setsearched] = useState(false);
    const [statusLoading, setstatusLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        setstatusLoading(true)
        getDataToAddFriend();
    },[])

    useEffect(()=>{
        setsearched(false);
    },[dataToAddFriend])

    const getDataToAddFriend = async()=>{
        const data = {"idUser":currentUser.idUser};
        const res = await FetchAPI.postDataAPI("/friends/getUserToAddFriend",data);
        res.msg.map(e=>e.statusSend=false);
        dispatch(updateDataToAddFriend(res.msg));
        // let arr = []
        // for(var i = 0;i<5;i++){
        //     arr = arr.concat(res.msg)
        // }
        // setdataToAddFriend(arr)
        setstatusLoading(false)
    }
    const handleSendAddFriend = async(item,index)=>{
        const data = {"sourceId":currentUser.idUser,"targetId":item.idUser,"type":1};
        const res = await FetchAPI.postDataAPI("/friends/addFriend",data);
        if(res.msg){
            if(res.msg==="Success"){
                const update_notify = await FetchAPI.postDataAPI("/friends/notifyThenSendFriend",data);
                if(update_notify.msg){
                    if(update_notify.msg==="Success"){
                        message.success(`Đã gửi lời mời kết bạn đến ${item.firstName} ${item.lastName} !`);
                        socket.emit("requestAddFriend",{
                            "idToSend":item.idUser,
                            "firstName":currentUser.firstName,
                            "lastName":currentUser.lastName,
                            "avatar":currentUser.avatar,
                            "idUser":currentUser.idUser,
                            "type":1,
                            "read":0,
                            "trash":0,
                            "create_at": new Date(),
                            "id":update_notify.idNotify
                        })
                        if(searched){
                            setsearched(false);
                        }else{
                            let arr = JSON.parse(JSON.stringify(dataToAddFriend));
                            arr[index].statusSend=true;
                            dispatch(updateDataToAddFriend(arr));
                        }
                    }
                }
            }
        }
    }

    const handleCancelAdd = async(item,index)=>{
        const data = {"sourceId":currentUser.idUser,"targetId":item.idUser};
        const res = await FetchAPI.postDataAPI("/friends/cancelAddFriend",data);
        if(res.msg){
            if(res.msg==="Success"){
                socket.emit("cancelAddFriend",{"idToSend":item.idUser,"idUser":currentUser.idUser});
                message.warning("Đã hủy");
                let arr = JSON.parse(JSON.stringify(dataToAddFriend));
                arr[index].statusSend=false;
                dispatch(updateDataToAddFriend(arr));
            }
        }
    }

    const searchFriend = (v)=>{
        
        let tmp = [...dataToAddFriend];
        tmp =  tmp.filter(e=>`${e.firstName} ${e.lastName}`.includes(v.target.value));
        setdatatoShow(tmp);
        setsearched(true);
    }

    return(
        <div className="wrapperFindFriend">
            <Search
                className='searchFindFriend'
                placeholder="Tìm kiếm bạn bè ..." 
                allowClear 
                onChange={searchFriend} 
                style={{ width: 200 }} 
            />
            <h3>Những người bạn có thể biết</h3>
            <List
                grid={{ gutter: 16, xs:2,sm:2,md:3,lg:3,xl:4,xxl:5 }}
                dataSource={searched ? datatoShow : dataToAddFriend}
                pagination={searched ? (datatoShow.length>8?{ defaultCurrent:1,pageSize:8}:false) : 
                    (dataToAddFriend.length>8?{ defaultCurrent:1,pageSize:8}:false)
                }
                loading={statusLoading}
                locale={{emptyText:"Chưa có gợi ý cho bạn ..."}}
                renderItem={(item,index) => (
                <List.Item >
                    <div className="itemFriendToAdd">
                        {item.avatar !== null ?<img className="avatar" src={item.avatar} alt="avatar"/>:
                        <img className="avatar" src={avatarDefault} alt="avatar"/>
                        }
                        <p onClick={()=>navigate(`/profile/${item.idUser}`)} style={{ cursor:'pointer' }}>
                            {`${item.firstName} ${item.lastName}`}
                        </p>
                        {item.statusSend===false ?
                        <Button onClick={()=>handleSendAddFriend(item,index)}>
                            Thêm bạn bè
                        </Button>
                        :
                        <div className="group_btn_sent">
                            <Button className="btn_sent" disabled>Đã gửi lời mời</Button>
                            <Button className="btn_cancel" onClick={()=>handleCancelAdd(item,index)}>Hủy</Button>
                        </div>
                        }
                    </div>
                </List.Item>
                )}
            />
        </div>
    )

}

export default memo(FindFriend);