import React ,{useState,useEffect} from 'react';
import { useSelector } from 'react-redux';
import {truncate} from '../../utils/truncate';
import {timeAgo} from '../../utils/timeAgo';
import {UsergroupAddOutlined,SwapOutlined} from '@ant-design/icons';
import {deCode} from '../../utils/crypto';
import avatarDefault from '../../assets/logo/avatar.jpg';
import avatarChatRoomDefault from '../../assets/logo/avatar_chat_room.png';
import {useNavigate} from 'react-router-dom';
import * as FetchAPI from '../../utils/fetchAPI';
import {Input,Modal,List,Checkbox,Button,Form,message } from 'antd';
import {endCode} from '../../utils/crypto';

const {Search} = Input;

function LeftChat ({idRoom,currentTime,socket}){
    const {currentUser,userOnline,dataFriend} = useSelector(e=>e.UserReducer);
    const {listRoom} = useSelector(e=>e.MessengesReducer);
    const navigate = useNavigate();
    const [showListUser, setshowListUser] = useState(true);
    const [listRoomToCheck, setlistRoomToCheck] = useState([]);
    const [dataToShow, setdataToShow] = useState([]);
    const [listRoomToShow, setlistRoomToShow] = useState([]);
    const [showModalAddGroup, setshowModalAddGroup] = useState(false);
    const [listGruopToAdd, setlistGruopToAdd] = useState([]);
    const [formCreateRoom] = Form.useForm();
    const [loadingBtnCreateRoom, setloadingBtnCreateRoom] = useState(false);
    
    //Init dataFriend
    useEffect(() => {
        setdataToShow(dataFriend)
    },[dataFriend])

    //Init dataListRoom
    useEffect(()=>{
        setlistRoomToShow(listRoom);
    },[listRoom])

    useEffect(() => {
        getListRoomToCheck();
    },[])

    const getListRoomToCheck = async()=>{
        const data = {"idUser":currentUser.idUser};
        const res = await FetchAPI.postDataAPI("/messenges/checkRoomExist",data);
        if(res.msg){
            setlistRoomToCheck(res.msg);
        }
    }

    const handleCheckRoom = async(item)=>{
        const check = listRoomToCheck.find(e=>e.idUser===item.idUser);
        if(check){
            navigate(`/messenges/${check.idRoom}`)
        }else{
            const data = {sourceId:currentUser.idUser,targetId:item.idUser};
            const res = await FetchAPI.postDataAPI("/messenges/createRoomSolo",data);
            if(res.msg){
                navigate(`/messenges/${res.msg.idRoom}`);
                getListRoomToCheck();
            }
            // message.error("Tạo room nào !!!");
        }
    }

    const handleFilterFriend = (e)=>{
        let arr = dataFriend.filter(item=>{
            const s = `${item.firstName} ${item.lastName}`;
            return s.includes(e.target.value)
        })
        setdataToShow(arr);
    }

    const handleFilterConversation = (e) =>  {
        let arr = listRoom.filter(item=>{
            if(item.type===1){
                const s = `${item.firstName} ${item.lastName}`;
                return s.includes(e.target.value)
            }else{
                const s = item.nameRoom;
                return s.includes(e.target.value)
            }
        })
        setlistRoomToShow(arr);
    }

    const onChangeCheckBoxAddGroup = (e)=>{
        let arr = [...listGruopToAdd];
        if(e.target.checked){
            arr.push({idUser:e.target.value})
        }else{
           const index = arr.findIndex(item=>item.idUser===e.target.value);
           arr.splice(index,1);
        }
        setlistGruopToAdd(arr);
    }

    const handleCreateRoom = async()=>{
        setloadingBtnCreateRoom(true);
        const nameRoom = formCreateRoom.getFieldValue().nameGruop;
        if(listGruopToAdd.length===0){
            message.warning("Vui lòng chọn thành viên của nhóm");
        }else{
            let listGruopToAddFinal = [...listGruopToAdd];
            listGruopToAddFinal.push({idUser:currentUser.idUser});
            const data = {"nameRoom":nameRoom,"listGruopToAdd":listGruopToAddFinal};
            const res = await FetchAPI.postDataAPI("/messenges/createRoomGroup",data);
            if(res.msg){
                if(res.msg==="Success"){
                    const encode_text = endCode(`${currentUser.firstName} ${currentUser.lastName} đã tạo nhóm ${nameRoom}.`);
                    const send = {"idUser":currentUser.idUser,"idRoom":res.idRoom,"message":encode_text,"typeMess":0};
                    const addMessengerFirst = await FetchAPI.postDataAPI("/messenges/addMessenger",send);
                    socket.emit("chat", {"text":encode_text,"targetId":listGruopToAdd,"idRoom":idRoom,"typeMess":0});
                    message.success("Tạo nhóm thành công");
                    setlistGruopToAdd([]);
                    formCreateRoom.setFieldsValue({"nameGruop":""});
                    setshowModalAddGroup(false);
                    setloadingBtnCreateRoom(false);
                }else{
                    message.error("Có lỗi rồi !!!");
                    setlistGruopToAdd([]);
                    formCreateRoom.setFieldsValue({"nameGruop":""});
                    setshowModalAddGroup(false);
                    setloadingBtnCreateRoom(false);
                }
            }
        }
    }
    
    const ModalAddGruop = ()=>(
        <Modal
            title="Thêm nhóm"
            visible={showModalAddGroup}
            onCancel={()=>setshowModalAddGroup(false)}
            cancelText="Thoát"
            footer={null}
            bodyStyle={{ maxHeight:"80vh",overflowX:'scroll',overflowY:"visible" }}
            style={{ top:30}}
        >
        <Form
            form={formCreateRoom}
            onFinish={handleCreateRoom}
        >
            <div className="groupTopModal">
                <Form.Item
                    label="Tên nhóm"
                    name="nameGruop"
                    rules={[{ required: true, message: 'Nhập tên nhóm!' }]}
                >
                <Input 
                    placeholder="Nhập tên nhóm"
                    className="inputNameGroup"
                />
                </Form.Item>
                <Form.Item>
                    <Button loading={loadingBtnCreateRoom} type="primary" className="btnAdd" htmlType="submit">Tạo nhóm</Button>
                </Form.Item>
            </div>

            <List
                dataSource={dataFriend}
                renderItem={item=>(
                    <List.Item key={item.idUser} className="itemAddFriend">
                        <div style={{ display:'flex', flexDirection:'row',alignItems:'center'}}>
                        {item.avatar !== null ?<img className="avatar" src={item.avatar} alt="avatar"/>
                            :<img className="avatar" src={avatarDefault} alt="avatar"/>
                        }
                        <div className="name">
                            <p>{`${item.firstName} ${item.lastName}`}</p>
                        </div>
                        </div>
                        <Checkbox value={item.idUser} onChange={onChangeCheckBoxAddGroup}/>
                    </List.Item>
                )}
            />
            </Form>
        </Modal>
    )
    return(
    <>
    <div className="top">
        {ModalAddGruop()}
        <h2 >Nhắn tin</h2>
        <div className="top-right">
            <div className='btn add-group' onClick={()=>setshowModalAddGroup(true)}>
                <UsergroupAddOutlined/>
            </div>
            <div 
                className='btn' 
                onClick={()=>{
                    if(showListUser){
                        document.getElementsByClassName("list_user")[0].style.transform = "translateX(100%)";
                        document.getElementsByClassName("list_friend")[0].style.transform = "translateX(0%)";
                        setshowListUser(false);
                    }else{
                        document.getElementsByClassName("list_user")[0].style.transform = "translateX(0%)";
                        document.getElementsByClassName("list_friend")[0].style.transform = "translateX(-150%)";
                        setshowListUser(true);
                    }
                 
                }}
            >
               <SwapOutlined />
            </div>
        </div>
    </div>
   
    <div className="list_user">
    <Search className="inputSearch" placeholder="Tìm kiếm cuộc hội thoại..." onChange={handleFilterConversation}/>
        {listRoomToShow.length!==0 ?
        <>
        {listRoomToShow.map(e=>(
            <div 
                className="item_user" 
                style={e.idRoom===idRoom?{backgroundColor:'rgba(210, 210, 210,.6)'}:null} 
                onClick={()=>navigate(`/messenges/${e.idRoom}`)}
            >
                {e.type===1 ?
                <div style={{ position:'relative' }}>
                    {e.avatar !== null ?<img className="avatar" src={e.avatar} alt="avatar"/>
                        :<img className="avatar" src={avatarDefault} alt="avatar"/>
                    }
                    {userOnline !== null &&
                        <div>
                            {userOnline.find(p=>p.targetId===e.idUserToChat) &&
                                <div className="online" />
                            }
                        </div>
                    }
                </div>
                :
                <div>
                    {e.avatarRoom !== null ? <img className="avatar" src={e.avatarRoom} alt="avatar"/>
                    :<img className="avatar" src={avatarChatRoomDefault} alt="avatar"/>
                    }
                </div>
                }
                <div className="infor">
                    {e.type === 1 ?
                        <h3>{`${e.firstName} ${e.lastName}`}</h3>
                        :
                        <h3>{e.nameRoom}</h3>
                    }
                    {e.sourceId===currentUser.idUser ?
                        <div className="bottomInfor">
                            {e.typeMess===0&&
                                <p>{`Bạn : ${truncate(deCode(e.message),6)}`}</p>
                            }
                            {e.typeMess===1&&
                                <p>{`Bạn : ${truncate("Đã gửi một ảnh.",6)}`}</p>
                            }
                            {e.typeMess===2&&
                                <p>{`Bạn : ${truncate("Đã gửi một tập tin.",6)}`}</p>
                            }
                            {e.typeMess===3&&
                                <p>{`Bạn : ${truncate("Đã gọi bạn.",6)}`}</p>
                            } 
                            {e.typeMess===4&&
                                <p>{`Bạn : ${truncate("Đã bỏ lỡ cuộc gọi của bạn.",6)}`}</p>
                            } 
                            <span>{timeAgo(currentTime,e.create_at)}</span>
                        </div>
                        :
                        <div className="bottomInfor">
                            {e.typeMess===0&&
                                <p>{`${e.lastNameSent} : ${truncate(deCode(e.message),6)}`}</p>
                            }
                            {e.typeMess===1&&
                                <p>{`${e.lastNameSent} : ${truncate("Đã gửi một ảnh.",6)}`}</p>
                            }
                            {e.typeMess===2&&
                                <p>{`${e.lastNameSent} : ${truncate("Đã gửi một tập tin.",6)}`}</p>
                            }
                            {e.typeMess===3&&
                                <p>{`${e.lastNameSent} : ${truncate("Đã gọi cho bạn.",6)}`}</p>
                            }
                            {e.typeMess===4&&
                                <p>{`${e.lastNameSent} : ${truncate("Bạn đã bỏ lỡ cuộc gọi của.",6)}`}</p>
                            }
                            <span>{timeAgo(currentTime,e.create_at)}</span>
                        </div>
                    }   
                </div>
            </div>
        ))}
        </>
        :
        <div style={{ minHeight:"69vh",display:'flex',justifyContent:'center',alignItems:'center' }}>
            <h3>Bạn chưa có cuộc trò chuyện nào ...</h3>
        </div>
        }
    </div>
    
    <div className="list_friend">
        <p>Danh sách bạn bè để liên hệ</p>
        <Search className="inputSearch" placeholder="Tìm kiếm người liên hệ..." onChange={handleFilterFriend}/>
        {dataToShow.map(e=>(
              <div className="itemContact" onClick={()=>handleCheckRoom(e)}>
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
    </>
    )
}
export default LeftChat;