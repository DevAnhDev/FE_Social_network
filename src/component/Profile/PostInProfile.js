import React,{memo,useEffect,useState} from 'react';
import PostScreen from '../PostScreen';
import * as FetchAPI from '../../utils/fetchAPI';
import {useSelector,useDispatch} from 'react-redux';
import {Modal,List} from 'antd';
import avatarDefault from '../../assets/logo/avatar.jpg';
import {updateDataPostOfUser} from '../../redux/reducers/post.reducer';
import {useLocation} from 'react-router-dom';
function PostInProfile({idUser,socket}){
    const {currentUser} = useSelector(e=>e.UserReducer);
    const [showModalLike, setshowModalLike] = useState(false);
    const {listLike,dataPostOfUser} = useSelector(e=>e.PostReducer);
    const dispatch = useDispatch();
    const location = useLocation();

    useEffect(() => {
        getData();
    },[location])

    const getData = async()=>{
        const data = {"sourceId":currentUser.idUser,"targetId":idUser};
        const res = await FetchAPI.postDataAPI("/post/getPostOfUser",data);
        if(res.msg){
            dispatch(updateDataPostOfUser(res.msg));
        }
    }
    const ModalLike = ()=>(
        <Modal
            visible={showModalLike}
            onCancel={()=>setshowModalLike(false)}
            footer={null}
        >
            <List
                dataSource={listLike}
                locale={{emptyText:"Bài đăng chưa có lượt thích nào ..."}}
                renderItem={item=>(
                    <List.Item className="itemListLike">
                        {item.avatar !== null ?<img className="avatar" src={item.avatar} alt="avatar"/>:
                            <img className="avatar" src={avatarDefault} alt="avatar"/>
                        }
                        <span>{`${item.firstName} ${item.lastName}`}</span>
                    </List.Item>
                )}
            />
        </Modal>
    )
    return(
        <div className='wrapperPostInProile'>
            {ModalLike()}
            {dataPostOfUser.length===0 ?
            <div style={{ textAlign:'center' }}>
            <p>Người dùng chưa có bài đăng nào ...</p>
            </div>
            :
            <>
            {dataPostOfUser.map(e=>(
                <PostScreen
                    item={e}
                    socket={socket}
                    currentUser={currentUser}
                    showModalLike={()=>setshowModalLike(true)}
                />
            ))}
            </>
            }
        </div>
    )
}

export default memo(PostInProfile);