import React,{memo,useState} from 'react';
import {useSelector,useDispatch} from 'react-redux';
import avatarDefault from '../../assets/logo/avatar.jpg';
import { List,Button,Modal,message } from 'antd';
import * as FetchAPI from '../../utils/fetchAPI';
import {updateDataFriend} from '../../redux/reducers/user.reducer';
import {useNavigate} from 'react-router-dom';
function RequestAddFriend({socket}){
    const {dataFriend,currentUser} = useSelector(e=>e.UserReducer);
    const [visibleModalRemove, setvisibleModalRemove] = useState(false);
    const handleShowModalRemove = ()=>setvisibleModalRemove(true);
    const handelHideModalRemove = ()=>setvisibleModalRemove(false);
    const [itemRemove, setitemRemove] = useState([]);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleRemoveFriend = async()=>{
        const data = {"sourceId":currentUser.idUser,"targetId":itemRemove.idUser};
        const res = await FetchAPI.postDataAPI("/friends/removeFriend",data);
        if(res.msg){
            if(res.msg==="Success"){
                message.warning(`Bạn đã hủy kết bạn với ${itemRemove.firstName} ${itemRemove.lastName} thành công !`);
                socket.emit("removeFriend",{"idToSend":itemRemove.idUser,"idUser":currentUser.idUser});
                let arr = JSON.parse(JSON.stringify(dataFriend));
                const index = arr.findIndex(e=>e.idUser===itemRemove.idUser);
                arr.splice(index,1);
                dispatch(updateDataFriend(arr));
                handelHideModalRemove();
            }
        }
    }
    const ModalRemoveFriend = ()=>(
        <Modal
            visible={visibleModalRemove}
            onCancel={handelHideModalRemove}
            cancelText={"Không"}
            okText={"Chắc chắn"}
            onOk={handleRemoveFriend}
        >
            <h3>{`Bạn có chắc chắn muốn hủy kết bạn với ${itemRemove.firstName} ${itemRemove.lastName} ?`}</h3>
            <p>{`Bạn sẽ không còn thấy các bài đăng và trạng thái hoạt động của ${itemRemove.firstName} ${itemRemove.lastName} .`}</p>
        </Modal>
    )
    return(
        <div className="wrapperFindFriend">
            <ModalRemoveFriend />
            <List
                grid={{ gutter: 16, xs:2,sm:2,md:3,lg:3,xl:4,xxl:5 }}
                dataSource={dataFriend}
                pagination={dataFriend.length>8?{ defaultCurrent:1,pageSize:8}:false}
                locale={{emptyText:"Chưa có bạn bè ..."}}
                renderItem={(item,index) => (
                <List.Item >
                    <div className="itemFriendToAdd">
                        {item.avatar !== null ?<img className="avatar" src={item.avatar} alt="avatar"/>:
                        <img className="avatar" src={avatarDefault} alt="avatar"/>
                        }
                        <p onClick={()=>navigate(`/profile/${item.idUser}`)} style={{ cursor:'pointer' }}>
                            {`${item.firstName} ${item.lastName}`}
                        </p>
                  
                        <div className="group_btn_sent">
                            <Button className="btn_cancel" onClick={()=>{handleShowModalRemove();setitemRemove(item)}}>Hủy kết bạn</Button>
                        </div>
                        
                    </div>
                </List.Item>
                )}
            />
        </div>
    )
}

export default memo(RequestAddFriend);