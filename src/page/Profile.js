import React ,{useState,useEffect} from 'react';
import {useParams} from 'react-router-dom';
import * as FetchAPI from '../utils/fetchAPI';
import imageCoverDefault from '../assets/logo/imageCoverDefault.jpg';
import avatarDefault from '../assets/logo/avatar.jpg';
import {useLocation} from 'react-router-dom';
import { Menu ,Button,message,Modal,Input,Upload} from 'antd';
import PostInProfile from '../component/Profile/PostInProfile';
import FriendInProfile from '../component/Profile/FriendInProfile';
import QRCodeComponent from '../component/Profile/QRCode';
import ImagePageProfile from '../component/Profile/ImagePageProfile';
import IntroInProfile from '../component/Profile/IntroInProfile';
import {useSelector,useDispatch} from 'react-redux';
import {UserAddOutlined,PlusOutlined,CheckOutlined,EditOutlined,CameraOutlined,InboxOutlined,CameraFilled } from '@ant-design/icons';
import {updateDataFriend} from '../redux/reducers/user.reducer';
import { updateUser } from '../redux/reducers/user.reducer';
import Loading from '../component/Loading';
import SecurityProfile from '../component/Profile/SecurityProfile';

const { TextArea } = Input;
const { Dragger } = Upload;

function Profile ({socket}){
    const {idUser} = useParams();
    const {currentUser,dataFriend} = useSelector(e=>e.UserReducer);
    const [showContent, setshowContent] = useState(false);
    const [dataInforUser, setdataInforUser] = useState([]);
    const [keyTab, setkeyTab] = useState("1");
    const [followed, setfollowed] = useState(false);
    const [friend, setfriend] = useState(0);
    const [showModalConfirmRemove, setshowModalConfirmRemove] = useState(false);
    const [showModalEditProfile, setshowModalEditProfile] = useState(false);
    const [showModalEditCoverImg, setshowModalEditCoverImg] = useState(false);
    const [showModalEditAvatar, setshowModalEditAvatar] = useState(false);
    const [uploadCoverImg, setuploadCoverImg] = useState([]);
    const [uploadAvatar, setuploadAvatar] = useState([]);
    const dispatch = useDispatch();
    const location = useLocation();

    //setDefaut Tab1 and getUser
    useEffect(() => {
        setkeyTab("1");
        setshowContent(false);
        if(idUser){
            getUser();
        }else{
            setshowContent(true);
        }
    },[location])

    //check friend and follow
    useEffect(() => {
        if(currentUser.idUser!==idUser){
            checkFull();
        }
    },[currentUser,location])

    const checkFull = async()=>{
        const data = {"sourceId":currentUser.idUser,"targetId":idUser};
        const checkFollow = await FetchAPI.postDataAPI("/profile/checkFollower",data);
        const checkFriend = await FetchAPI.postDataAPI("/profile/checkFriend",data);
        if(checkFollow.msg){
            if(checkFollow.msg==="followed"){
                setfollowed(true)
            }else if (checkFollow.msg==="unfollowed"){
                setfollowed(false)
            }
        }
        if(checkFriend.msg){
            if(checkFriend.msg==="not_friend"){
                setfriend(0);
            }else if(checkFriend.msg==="friend"){
                setfriend(1)
            }else if(checkFriend.msg==="you_sent"){
                setfriend(2)
            }else if(checkFriend.msg==="user_sent"){
                setfriend(3)
            }
        }
    }

    const getUser = async()=>{
        const data = {"idUser":idUser}
        const res = await FetchAPI.postDataAPI("/user/getFullInforUserById",data);
        if(res.msg){
            setdataInforUser(res.msg[0]);
            setshowContent(true);
        }
    }

    const handleSetKey = e => {
        setkeyTab(e.key)
    }

    const handleAddFriend = async()=>{
        console.log(dataInforUser)
        const data = {"sourceId":currentUser.idUser,"targetId":idUser,"type":1};
        const res = await FetchAPI.postDataAPI("/friends/addFriend",data);
        if(res.msg){
            if(res.msg==="Success"){
                const update_notify = await FetchAPI.postDataAPI("/friends/notifyThenSendFriend",data);
                if(update_notify.msg){
                    if(update_notify.msg==="Success"){
                        message.success(`Đã gửi lời mời kết bạn đến ${dataInforUser.firstName} ${dataInforUser.lastName} !`);
                        socket.emit("requestAddFriend",{
                            "idToSend":dataInforUser.idUser,
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
                        setfriend(2);
                        setfollowed(true);
                    }
                }
            }
        }
    }

    const handleCancelFollow = async()=>{
        const data = {"sourceId":currentUser.idUser,"targetId":idUser};
        const checkFollow = await FetchAPI.postDataAPI("/profile/checkFollower",data);
        if(checkFollow.msg){
            if(checkFollow.msg==="followed"){
                const res = await FetchAPI.postDataAPI("/friends/cancelFollow",data);
                if(res.msg){
                    if(res.msg==="Success"){
                        message.success(`Đã hủy theo dõi ${dataInforUser.firstName} ${dataInforUser.lastName}`);
                        setfollowed(false);
                    }else{
                        message.error("Có lỗi rồi !!!");
                    }
                }
            }else if (checkFollow.msg==="unfollowed"){
                message.warning(`Bạn chưa theo dõi ${dataInforUser.firstName} ${dataInforUser.lastName}`)
            }
        }
      
        
    }

    const handleFollow = async()=>{
        const data = {"sourceId":currentUser.idUser,"targetId":idUser};
        const checkFollow = await FetchAPI.postDataAPI("/profile/checkFollower",data);
        if(checkFollow.msg){
            if(checkFollow.msg==="followed"){
                message.warning(`Bạn đã theo dõi ${dataInforUser.firstName} ${dataInforUser.lastName} rồi`)
            }else if (checkFollow.msg==="unfollowed"){
                const res = await FetchAPI.postDataAPI("/friends/addFollow",data);
                if(res.msg){
                    if(res.msg==="Success"){
                        message.success(`Đã theo dõi ${dataInforUser.firstName} ${dataInforUser.lastName}`);
                        setfollowed(true);
                    }else{
                        message.error("Có lỗi rồi !!!");
                    }
                }
            }
        }
       
    }

    const handleRemoveFriend = async()=>{
        const data = {"sourceId":currentUser.idUser,"targetId":dataInforUser.idUser};
        const res = await FetchAPI.postDataAPI("/friends/removeFriend",data);
        if(res.msg){
            if(res.msg==="Success"){
                message.warning(`Bạn đã hủy kết bạn với ${dataInforUser.firstName} ${dataInforUser.lastName} thành công !`);
                socket.emit("removeFriend",{"idToSend":dataInforUser.idUser,"idUser":currentUser.idUser});
                let arr = JSON.parse(JSON.stringify(dataFriend));
                const index = arr.findIndex(e=>e.idUser===dataInforUser.idUser);
                arr.splice(index,1);
                dispatch(updateDataFriend(arr));
                setfriend(0);
                setfollowed(false);
                setshowModalConfirmRemove(false);
            }
        }
    }

    const onChangeUploadCoverImg = ({ fileList: newFileList,file:file })=>{
        const { status } = file;
        setuploadCoverImg(newFileList);
        if (status !== 'uploading') {
            console.log(file, newFileList);
        }
        if (status === 'done') {
            message.success(`${file.name} được tải lên thành công.`);
        } else if (status === 'error') {
            message.error(`${file.name} tải lên thất bại.`);
        }
    }

    const onChangeUploadAvatar = ({ fileList: newFileList,file:file })=>{
        const { status } = file;
        setuploadAvatar(newFileList);
        if (status !== 'uploading') {
            console.log(file, newFileList);
        }
        if (status === 'done') {
            message.success(`${file.name} được tải lên thành công.`);
        } else if (status === 'error') {
            message.error(`${file.name} tải lên thất bại.`);
        }
    }


    const handleRemoveFileUpload = (item)=>{
        try {
            if(item.response.msg){
                const data = {"pathFile":item.response.msg.path};
                FetchAPI.postDataAPI("/uploads/removeFile",data);
            }
        } catch (error) {
            
        }
      
    }

    const handleUpdateCoverImg = ()=>{
        uploadCoverImg.forEach(async(e)=>{
            const path_file = `/${e.response.msg.path}`;
            const data = {idUser:currentUser.idUser,urlImg:path_file};
            const res = await FetchAPI.postDataAPI("/profile/updateCoverImage",data);
            if(res.msg){
                if(res.msg==="Success"){
                    message.success("Cập nhật ảnh bìa thành công !");
                    let obj = dataInforUser;
                    obj.coverImage = path_file;
                    setdataInforUser(obj);
                    setuploadCoverImg([]);
                    setshowModalEditCoverImg(false);
                }else{
                    message.error("Có lỗi xảy ra");
                    setuploadCoverImg([]);
                    setshowModalEditCoverImg(false);
                }
            }
        })
    }

    const handleUpdateAvatar = ()=>{
        uploadAvatar.forEach(async(e)=>{
            const path_file = `/${e.response.msg.path}`;
            const data = {idUser:currentUser.idUser,urlImg:path_file};
            const res = await FetchAPI.postDataAPI("/profile/updateAvatarImage",data);
            if(res.msg){
                if(res.msg==="Success"){
                    message.success("Cập nhật ảnh đại diện thành công !");
                    let obj = dataInforUser;
                    dispatch(updateUser({...currentUser,avatar:path_file}))
                    obj.avatar = path_file;
                    setdataInforUser(obj);
                    setuploadAvatar([]);
                    setshowModalEditAvatar(false);
                }else{
                    message.error("Có lỗi xảy ra");
                    setuploadAvatar([]);
                    setshowModalEditAvatar(false);
                }
            }
        })
    }

    const ModalConfirmRemoveFriend = ()=>(
        <Modal
            visible={showModalConfirmRemove}
            onCancel={()=>setshowModalConfirmRemove(false)}
            closable={false}
            cancelText="Thoát"
            okText="Chắc chắn"
            onOk={handleRemoveFriend}
        >
            <h3>{`Bạn có chắc chắn muốn hủy kết bạn với ${dataInforUser.firstName} ${dataInforUser.lastName} ?`}</h3>
            <p>{`Bạn sẽ không còn thấy các bài đăng và trạng thái hoạt động của ${dataInforUser.firstName} ${dataInforUser.lastName} .`}</p>
        </Modal>
    )
    
    const ModalEditIntroAndProfile = ()=>(
        <Modal
            visible={showModalEditProfile}
            onCancel={()=>setshowModalEditProfile(false)}
            closable={false}
            cancelText="Thoát"
            okText="Chỉnh sửa"
        >
            <h2><b>Chỉnh sửa thông tin cá nhân</b></h2>
            <p><b>Giới thiệu bản thân</b></p>
            <TextArea 
                defaultValue={dataInforUser.intro===null || dataInforUser.intro==="" ? "" : dataInforUser.intro} 
                rows={4} 
                placeholder="Gới thiệu bản thân" 
            />
            <p style={{marginTop:10}}><b>Thông tin chi tiết</b></p>
            <TextArea 
                defaultValue={dataInforUser.profile===null || dataInforUser.profile==="" ? "" : dataInforUser.profile} 
                rows={4} 
                placeholder="Thông tin chi tiết về bản thân" 
            />
        </Modal>
    )

    const propsDragger = {
        name:"image",
        multiple: false,
        action: '/uploads/uploadCoverImg',
        listType:"picture",
        // onChange(info) {
        //   const { status } = info.file;
        //   if (status !== 'uploading') {
        //     console.log(info.file, info.fileList);
        //   }
        //   if (status === 'done') {
        //     message.success(`${info.file.name} file uploaded successfully.`);
        //   } else if (status === 'error') {
        //     message.error(`${info.file.name} file upload failed.`);
        //   }
        // },
        accept:"image/*",
        onDrop(e) {
          console.log('Dropped files', e.dataTransfer.files);
        },
    }

    const propsDraggerAvatar = {
        name:"image",
        multiple: false,
        action: '/uploads/uploadAvatar',
        listType:"picture",
        // onChange(info) {
        //   const { status } = info.file;
        //   if (status !== 'uploading') {
        //     console.log(info.file, info.fileList);
        //   }
        //   if (status === 'done') {
        //     message.success(`${info.file.name} file uploaded successfully.`);
        //   } else if (status === 'error') {
        //     message.error(`${info.file.name} file upload failed.`);
        //   }
        // },
        accept:"image/*",
        onDrop(e) {
          console.log('Dropped files', e.dataTransfer.files);
        },
    }

    const ModalEditCoverImg = ()=>(
        <Modal
            visible={showModalEditCoverImg}
            onCancel={()=>setshowModalEditCoverImg(false)}
            onOk={handleUpdateCoverImg}
            closable={false}
            cancelText="Thoát"
            okText="Cập nhật"
        >
            <h2><b>Chỉnh sửa ảnh bìa</b></h2>
            <Dragger  
                fileList={uploadCoverImg}
                onChange={onChangeUploadCoverImg}
                onRemove={(e)=>handleRemoveFileUpload(e)}
                maxCount={1}
                {...propsDragger}
            >
                <>
                    <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Chọn một ảnh từ thư mục hoặc kéo thả ảnh</p>
                    <p className="ant-upload-hint">
                        Chỉ một ảnh
                    </p>
                </>
            </Dragger>
        </Modal>
    )

    const ModalUpdateAvatar = ()=> (
        <Modal
            visible={showModalEditAvatar}
            onCancel={()=>setshowModalEditAvatar(false)}
            onOk={handleUpdateAvatar}
            closable={false}
            cancelText="Thoát"
            okText="Cập nhật"
        >
            <h2><b>Chỉnh sửa ảnh đại diện</b></h2>
            <Dragger  
                fileList={uploadAvatar}
                onChange={onChangeUploadAvatar}
                onRemove={(e)=>handleRemoveFileUpload(e)}
                maxCount={1}
                {...propsDraggerAvatar}
            >
                <>
                    <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Chọn một ảnh từ thư mục hoặc kéo thả ảnh</p>
                    <p className="ant-upload-hint">
                        Chỉ một ảnh
                    </p>
                </>
            </Dragger>
        </Modal>
    )

    return(
        <div className="wrapperProfile"> 
            {showContent ?
            <>
            {idUser===undefined ? 
                <div className="nullProfile">
                    Chúng tôi không tìm thấy hồ sơ cá nhân nào.
                </div>
                :
                <div className="profile">
                    {/* top */}
                    <div className="top">
                        {dataInforUser.coverImage===null ?
                            <img className="imageCover" src={imageCoverDefault} width={"100%"} height={250} alt="imageCover"/>
                            :
                            <img className="imageCover" src={dataInforUser.coverImage} width={"100%"} height={250} alt="imageCover"/>
                        }
                        {dataInforUser.avatar===null ?
                            <img className="avatar" src={avatarDefault} width={100} height={100} alt="avatar"/>
                            :
                            <img className="avatar" src={dataInforUser.avatar} width={100} height={100} alt="avatar"/>
                        }
                        {currentUser.idUser == idUser && <CameraFilled style={{ cursor:'pointer',position:'absolute',left:125,bottom:15,fontSize: '18px' }} onClick={()=>setshowModalEditAvatar(true)}/>}
                        <h2 className="name">{`${dataInforUser.firstName} ${dataInforUser.lastName}`}</h2>
                        {currentUser.idUser!==idUser ?
                            <div className="group_btn_action">
                                {ModalConfirmRemoveFriend()}
                                {friend===0 &&
                                <Button className="btn_sendAddFriend" onClick={handleAddFriend}>
                                    <UserAddOutlined />
                                    Kết bạn
                                </Button>
                                }
                                {friend===1 &&
                                <Button className="btn_sendAddFriend" onClick={()=>setshowModalConfirmRemove(true)}>
                                    <CheckOutlined />
                                    Bạn bè
                                </Button>
                                }
                                {friend===2 &&
                                <Button className="btn_sendAddFriend">
                                    <UserAddOutlined />
                                    Đã gửi
                                </Button>
                                }
                                {friend===3 &&
                                <Button className="btn_sendAddFriend">
                                    <UserAddOutlined />
                                    Đồng ý
                                </Button>
                                }
                               
                                {followed ?
                                <Button onClick={handleCancelFollow}>
                                  <CheckOutlined />
                                    Đã theo dõi
                                </Button>
                                :
                                <Button onClick={handleFollow}>
                                    <PlusOutlined />
                                    Theo dõi
                                </Button>
                                }
                            </div>
                            :
                            <div className="group_btn_action">
                                {ModalEditIntroAndProfile()}
                                {ModalEditCoverImg()}
                                {ModalUpdateAvatar()}
                                <Button className="btn_edit" onClick={()=>setshowModalEditProfile(true)}>
                                    <EditOutlined />
                                    Chỉnh sửa thông tin
                                </Button>
                                <Button className="btn_cover_img" onClick={()=>setshowModalEditCoverImg(true)}>
                                    <CameraOutlined  />
                                    Ảnh bìa
                                </Button>
                            </div>

                        }
                        <div className="tabs">
                        <Menu className="menu" mode="horizontal" defaultSelectedKeys={['1']} selectedKeys={keyTab} onClick={handleSetKey}>
                            <Menu.Item key="1" >
                                Bài viết
                            </Menu.Item>
                            <Menu.Item key="2">
                                Giới thiệu
                            </Menu.Item>
                            <Menu.Item key="3">
                                Bạn bè
                            </Menu.Item>
                            <Menu.Item key="4">
                                Ảnh
                            </Menu.Item>
                            <Menu.Item key="5">
                                QR code
                            </Menu.Item>
                            {currentUser?.idUser == idUser &&
                            <Menu.Item key="6">
                                Bảo mật
                            </Menu.Item>
                            }
                        </Menu>
                        </div>
                    </div>
                    {/* top */}
                    <div className="content">
                        {keyTab==="1"&&
                        <div>
                            <PostInProfile idUser={idUser} socket={socket}/>
                        </div>
                        }
                        {keyTab==="2"&&
                        <div>
                            <IntroInProfile idUser={idUser} dataUser={dataInforUser} />
                        </div>
                        }
                        {keyTab==="3"&&
                        <div>
                            <FriendInProfile idUser={idUser} socket={socket}/>
                        </div>
                        }
                        {keyTab==="4"&&
                        <div>
                            <ImagePageProfile idUser={idUser}/>
                        </div>
                        }
                        {keyTab==="5"&&
                        <div>
                            <QRCodeComponent idUser={idUser}/>
                        </div>
                        }
                        {keyTab==="6"&&
                        <div>
                            <SecurityProfile idUser={idUser} currentUser={currentUser}/>
                        </div>
                        }
                    </div>
                </div>
            }
            </>
            :
            <>
            <div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'68vh'}}>
                <Loading/>
            </div>
            </>
            }
        </div>
    )
}

export default Profile;