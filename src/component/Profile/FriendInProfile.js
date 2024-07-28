import React , {memo,useEffect,useState} from 'react';
import {List,Button} from 'antd';
import * as FetchAPI from '../../utils/fetchAPI';
import {useNavigate} from 'react-router-dom';
import avatarDefault from '../../assets/logo/avatar.jpg'
function FriendInProfile({idUser}){
    const [dataFriend, setdataFriend] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
        getDataFriend();
    },[])
    const getDataFriend = async()=>{
        const data = {"idUser":idUser};
        const res = await FetchAPI.postDataAPI("/user/getFriendById",data);
        setdataFriend(res.msg);
    }
    return(
        <div className="wrapperFriendInProfile">
            <List
                grid={{ gutter: 16, xs:2,sm:2,md:3,lg:3,xl:4 }}
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
                  
                        {/* <div className="group_btn_sent">
                            <Button className="btn_cancel">Hủy kết bạn</Button>
                        </div> */}
                        
                    </div>
                </List.Item>
                )}
            />
        </div>
    )
}

export default memo(FriendInProfile)