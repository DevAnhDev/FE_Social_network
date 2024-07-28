import React ,{useEffect,useState} from 'react';
import {VideoCameraAddOutlined} from '@ant-design/icons';
import {useSelector,useDispatch} from 'react-redux';
import {updateDataPost} from '../redux/reducers/post.reducer';
import {PostScreen} from '../component';
import * as FetchAPI from '../utils/fetchAPI';
import avatarDefault from '../assets/logo/avatar.jpg';
import { Skeleton,Modal,List,Button,Upload,message } from 'antd';
import {useNavigate} from 'react-router-dom';
import {FileImageOutlined,TagOutlined} from '@ant-design/icons';
import TextareaAutosize from 'react-textarea-autosize';

function Home ({socket}){
    // const navigate = useNavigate();
    const [showContent, setshowContent] = useState(false);
    const {currentUser,followers} = useSelector(e=>e.UserReducer);
    const {dataPost,listLike} = useSelector(e=>e.PostReducer);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showModalLike, setshowModalLike] = useState(false);
    const [showModalCreatePost, setshowModalCreatePost] = useState(false);
    const [currentTime, setcurrentTime] = useState(new Date());
    const [textPost, settextPost] = useState("");
    const [uploadImagePost, setuploadImagePost] = useState([]);
    const [loadingBtnCreatePost, setloadingBtnCreatePost] = useState(false);

    useEffect(()=>{
        document.title="Space Social"
        setshowContent(false);
        if(currentUser!==null){
            getPost();
        }
    },[])

    const getPost = async()=>{
        const data = {idUser:currentUser.idUser};
        const res = await FetchAPI.postDataAPI("/post/getPostById",data);
        dispatch(updateDataPost(res.msg));
        setshowContent(true);
    }

    //Handle createPost
    const onChangeUploadImagePost = ({ fileList: newFileList })=>{
        setuploadImagePost(newFileList)
    }

    const handleRemoveFileUpload = (item)=>{
        if(item.response.msg){
            const data = {"pathFile":item.response.msg.path};
            FetchAPI.postDataAPI("/uploads/removeFile",data);
        }
    }

    const handleCreatePost = async()=>{
        setloadingBtnCreatePost(true);
        let tmp_arr_image = [];
        uploadImagePost.map(e=>{
            tmp_arr_image.push({path:"/"+e.response.msg.path});
        })
        const data = {"text":textPost,"arr_img":tmp_arr_image,"idUser":currentUser.idUser};
        const res = await FetchAPI.postDataAPI("/post/addPost",data);
        if(res.msg){
            if(res.msg==="Success"){
                message.success("Bạn đã đăng bài thành công !!!");
                socket.emit("addPost",{"idPost":res.idPost,"idUser":currentUser.idUser});
                settextPost("");
                setuploadImagePost([]);
                setshowModalCreatePost(false);
                setloadingBtnCreatePost(false);
            }else{
                message.error("Có lỗi rồi !!!");
                setshowModalCreatePost(false);
                setloadingBtnCreatePost(false);
            }
        }
     
    }

    // const sendNotificationAddPost = ()=>{
    //     followers.map(e=>{
    //         const data = {sourceId:currentUser.idUser,targetId:e.sourceId,"type":4};
    //         FetchAPI.postDataAPI("/notification/addNotification",data);
    //     })
    // }

    const Story = ()=>(
        <div>
            <div className="nullStory">
                <div className="icon" onClick={()=>navigate("/story")}>
                    <VideoCameraAddOutlined style={{color:'gray'}}/>
                </div>
                <div className="lable">
                    <h3>Tạo tin</h3>
                    <p>Bạn có thể chia sẻ ảnh hoặc viết gì đó.</p>
                </div>
            </div>
        </div>
    )

    const AddPost = ()=>(
        <div className="addPost">
            <div className="wrapper">
                {currentUser.avatar!==null ?
                    <img className="avatar" src={currentUser.avatar} alt="avatar"/>
                    :
                    <img className="avatar" src={avatarDefault} alt="avatar"/>
                }
                <button onClick={()=>setshowModalCreatePost(true)}>
                    {`${currentUser.lastName} ơi, bạn đang nghĩ gì thế ?`}
                </button>
            </div>
        </div>
    )
    
    const Post = ()=>{
        return(
        <div>
            {showContent ?
            <div>
            {dataPost.length===0 ? 
            <div className="nullPost">
                <h2>Không có bài viết nào</h2>
                <p>Thêm bạn bè để xem nhiều bài viết hơn.</p>
                <button onClick={()=>navigate("/friends")}>Tìm bạn bè</button>
            </div>
            :
            <div>
                {dataPost.map(e=>(
                    <PostScreen
                        item={e} 
                        socket={socket}
                        currentUser={currentUser}
                        showModalLike={()=>setshowModalLike(true)}
                        // currentTime={currentTime}
                    />
                ))}
        
            </div>
            }
            </div>
            :
            <div>
                <div className="cardSkeleton" style={{ marginBottom:"20px" }}>
                    <Skeleton active avatar paragraph={{ rows: 4 }} />
                </div>
                <div className="cardSkeleton">
                <Skeleton active avatar paragraph={{ rows: 4 }} />
                </div>
            </div>
            }
        </div>
        )
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

    const ModalCreatePost = ()=>(
        <Modal
            visible={showModalCreatePost}
            onCancel={()=>setshowModalCreatePost(false)}
            footer={null}
            title="Tạo bài viết"
        >
            <div className="wrapperModalCreatePost">
                {/* <img src="https://192.168.1.30:5001/video_feed" /> */}
                <div className="user">
                    {currentUser.avatar !== null ?<img className="avatar" src={currentUser.avatar} alt="avatar"/>:
                        <img className="avatar" src={avatarDefault} alt="avatar"/>
                    }
                    <span>{`${currentUser.firstName} ${currentUser.lastName}`}</span>
                </div>
                <TextareaAutosize
                    className="input_think"
                    type="text"
                    placeholder={`${currentUser.lastName} ơi, bạn đang nghĩ gì thế ?`}
                    value={textPost}
                    onChange={e=>settextPost(e.target.value)}
                    minRows={1}
                    maxRows={15}
                />
                <div className="add_description">
                    <span>Thêm vào bài viết</span>
                    <div className="right">
                        <Upload
                            action="/uploads/uploadImagePost"
                            name="image"
                            listType="picture"
                            onChange={onChangeUploadImagePost}
                            onRemove={(e)=>handleRemoveFileUpload(e)}
                            // disabled={uploadImagePost.length!==0}
                            fileList={uploadImagePost}
                            accept="image/*"
                        >
                        <div className="btn">
                            <FileImageOutlined style={{color:'rgb(0, 173, 0)'}}/>
                        </div>
                        </Upload>
                        {/* <div className="btn">
                            <TagOutlined style={{color:'rgb(0, 0, 164)'}}/>
                        </div> */}
                    </div>
                </div>
                <Button
                    className="btn_submit"
                    type="primary"
                    disabled={!textPost.trim()}
                    onClick={handleCreatePost}
                    loading={loadingBtnCreatePost}
                >
                    Đăng
                </Button>
            </div>
        </Modal>
    )
    return(
        <div className="wrapperHome">
        {currentUser !== null &&
        <div>
            {ModalCreatePost()}
            {ModalLike()}
            {Story()}
            {AddPost()}
            {Post()}
        </div>
        }
        </div>
    )
};

export default Home;