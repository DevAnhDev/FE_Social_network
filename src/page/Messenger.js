import React ,{useEffect,useState,useRef} from 'react';
import {Row,Col,notification,Upload,Button } from 'antd';
import {useParams} from 'react-router-dom';
import {useSelector,useDispatch} from 'react-redux';
import * as FetchAPI from '../utils/fetchAPI';
import {SendOutlined} from '@ant-design/icons';
import {useNavigate,useLocation} from 'react-router-dom';
import {updateIdRoom} from '../redux/reducers/user.reducer';
import {updateMessenges,updateListRoom} from '../redux/reducers/messenges.reducer';
import {VideoCameraOutlined,ExclamationCircleOutlined,PhoneOutlined,SmileOutlined,FileImageOutlined,FileAddOutlined,DownloadOutlined} from '@ant-design/icons';
import {endCode,deCode} from '../utils/crypto';
import {updateIdRoomCall,updateVisibleCall,updateStatusCall} from '../redux/reducers/messenges.reducer';
import avatarDefault from '../assets/logo/avatar.jpg';
import avatarChatRoomDefault from '../assets/logo/avatar_chat_room.png';
import LeftChat from '../component/Messenger/left_chat';
import {timeAgo} from '../utils/timeAgo';
import CallTime from '../component/Messenger/call_time';
import Picker, { SKIN_TONE_MEDIUM_DARK } from 'emoji-picker-react';
import ModalDetail from '../component/Messenger/modal_detail';
import Image from '../component/CustomImageAntd';

function Messenger ({socket}){
    let { idRoom } = useParams();
    const [listRevicer, setlistRevicer] = useState([]);
    const [text, setText] = useState("");
    const {currentUser,userOnline} = useSelector(e=>e.UserReducer);
    const {currentMessenges,listRoom} = useSelector(e=>e.MessengesReducer);
    const [dataRoomCurrent, setdataRoomCurrent] = useState();
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [showContent, setshowContent] = useState(false);
    const dispatch = useDispatch();
    const [currentTime, setcurrentTime] = useState(new Date());
    const [uploadList, setuploadList] = useState([]);
    const [uploadListFile, setuploadListFile] = useState([]);
    const [showEmoji, setshowEmoji] = useState(false);
    const [showModalDetail, setshowModalDetail] = useState(false);
    const pickerEmojiRef = useRef();

    const onEmojiClick = (_,emojiObject) => {
      let string = text;
      string += emojiObject.emoji;
      setText(string);
    };
   //click outside for picker emoji
   useEffect(() => {
        if(pickerEmojiRef.current!==undefined&&pickerEmojiRef.current!== null){
            document.addEventListener('mousedown', clickOutside);
        }
        // clean up function before running new effect
        return () => {
            document.removeEventListener('mousedown', clickOutside);
        }
    }, [pickerEmojiRef.current])

    const clickOutside = (e)=>{
        if(pickerEmojiRef.current!==null){
            if(pickerEmojiRef.current.contains(e.target)) {
                // inside click
                return;
            }
        }
        setshowEmoji(false);
    }

    //Behavior scroll
    const scrollToBottom = () => {
        if(messagesEndRef.current!==null){
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };
    //Run scroll when have new mess
    useEffect(scrollToBottom, [currentMessenges]);

    //Init
    useEffect(()=>{
        setshowContent(false);
        document.title="Tin nhắn | Space Social"
        getRoom();
        if(idRoom!==undefined){
            dispatch(updateIdRoom(idRoom));
            getMess();
            getReciver();
        }else{
            setshowContent(true)
        }
    },[location])

    //Run real-time with times ago
    useEffect(() => {
        const interval = setInterval(()=>{
            setcurrentTime(new Date());
        },1000)
        return () => clearInterval(interval);
    },[])

    const getMess = async()=>{
        const data = {"idRoom":idRoom};
        const res = await FetchAPI.postDataAPI("/messenges/getMessengesByIdRoom",data);
        dispatch(updateMessenges(res.msg));
        setshowContent(true)
    }

    const getReciver = async()=>{
        const data = {"idRoom":idRoom,"idUser":currentUser.idUser};
        const res = await FetchAPI.postDataAPI("/messenges/getReciver",data);
        console.log(res.msg);
        setlistRevicer(res.msg);
    }

    const getRoom = async()=>{
        const data = {"idUser":currentUser.idUser};
        const res = await FetchAPI.postDataAPI("/messenges/getListCovensation",data);
        dispatch(updateListRoom(res.msg));
        if(idRoom){
            const dataRoom = {"idRoom":idRoom,"idUser":currentUser.idUser};
            const room = await FetchAPI.postDataAPI("/messenges/getRoomCurrent",dataRoom);
            setdataRoomCurrent(room.msg);
            console.log(room.msg)
            // res.msg.map(e=>{
            //     if(e.idRoom===idRoom){
            //         setdataRoomCurrent(e)
            //     }
            // })
        }
    }

    const sendData = async()=>{
        if (text !== "") {
            const encode_text = endCode(text);
            const data = {"idUser":currentUser.idUser,"idRoom":idRoom,"message":encode_text,"typeMess":0};
            const res = await FetchAPI.postDataAPI("/messenges/addMessenger",data);
            //encrypt the message here
            // const ans = to_Encrypt(text);
            if(res.msg==="Success"){
                console.log("ok");
            }
            console.log(encode_text);
            socket.emit("chat", {"text":encode_text,"targetId":listRevicer,"idRoom":idRoom,"typeMess":0});
            setText("");
            setshowEmoji(false);
        }
    }

    const sendDataFile = ()=>{
        if(uploadListFile.length!==0){
            uploadListFile.map(async(e,index)=>{
                const path_file = `/${e.response.msg.path}`;
                const encode_text = endCode(path_file);
                const data = {"idUser":currentUser.idUser,"idRoom":idRoom,"message":encode_text,"typeMess":2};
                const res = await FetchAPI.postDataAPI("/messenges/addMessenger",data);
                if(res.msg==="Success"){
                    console.log("ok");
                }
                socket.emit("chat", {"text":encode_text,"targetId":listRevicer,"idRoom":idRoom,"typeMess":2});
                new Promise((res) => {
                    setTimeout(() => {
                      res()
                    }, 1000)
                })
                setuploadListFile([]);
                setshowEmoji(false);
                
            })
          
        }
        if(uploadList.length!==0){
            uploadList.map(async(e,index)=>{
                const path_file = `/${e.response.msg.path}`;
                const encode_text = endCode(path_file);
                const data = {"idUser":currentUser.idUser,"idRoom":idRoom,"message":encode_text,"typeMess":1};
                const res = await FetchAPI.postDataAPI("/messenges/addMessenger",data);
                if(res.msg==="Success"){
                    console.log("ok");
                }
                socket.emit("chat", {"text":encode_text,"targetId":listRevicer,"idRoom":idRoom,"typeMess":1});
                setuploadList([]);
                setshowEmoji(false);
                 
            })
        }
    }

    const handleCallVideo = ()=>{
        let i = 0;
        listRevicer.map(e=>{
            if(userOnline!==null){
                if(userOnline.find(p=>p.targetId === e.idUser)){
                    i++;
                }
            }
        })
        if(i>0){
            dispatch(updateStatusCall("calling"));
            dispatch(updateIdRoomCall(idRoom));
            dispatch(updateVisibleCall(true));
        }else{
            notification.error({
                message: 'Thông báo',
                description:
                  dataRoomCurrent[0].type === 1 ? `${listRevicer[0].firstName} ${listRevicer[0].lastName} hiện không hoạt động, vui lòng gọi lại sau !!!`
                  :'Hiện tại trong nhóm không có người dùng nào hoạt động, vui lòng gọi lại sau !!!'
                  ,
                icon: <SmileOutlined style={{ color: '#108ee9' }} />,
                placement: "bottomRight",
            });
        }
    }

    const onChangeUploadImg = ({ fileList: newFileList })=>{
        setuploadList(newFileList);
    }
    
    const onChangeUploadFile = ({ fileList: newFileList })=>{
        setuploadListFile(newFileList);
    }
    
    const handleRemoveFileUpload = (item)=>{
        if(item.response.msg){
            const data = {"pathFile":item.response.msg.path};
            FetchAPI.postDataAPI("/uploads/removeFile",data);
        }
    }
    const handleFile = (text)=>{
        const StringFile = deCode(text);
        const lastIndex = StringFile.lastIndexOf("/");
        const str = StringFile.substring(lastIndex+1, StringFile.length);
        return str;
    }
    return(
        <div className="wrapperMessenger">
            <Row>
                <Col className="left_chat" xl={6} lg={6} md={6} xs={24}>
                    <LeftChat 
                        idRoom = {idRoom}
                        currentTime = {currentTime}
                        socket ={socket}
                    />
                </Col>

                {idRoom!==undefined ?
                <Col className="chat" xl={18} lg={18} md={18} xs={24}>
                <ModalDetail 
                    showModalDetail={showModalDetail} 
                    hideModal={()=>setshowModalDetail(false)} 
                    socket={socket}
                    listRevicer={listRevicer}
                    endCode={endCode}
                />
                <div className="infor">
                    <div className="left">
                        {dataRoomCurrent!==undefined && 
                            <div>
                                {dataRoomCurrent[0].type===1 ?
                                <div style={{ position:'relative' }}>
                                    {dataRoomCurrent[0].avatar !== null ?<img className="avatar" src={dataRoomCurrent[0].avatar} alt="avatar"/>
                                        :<img className="avatar" src={avatarDefault} alt="avatar"/>
                                    }
                                    <span>{`${dataRoomCurrent[0].firstName} ${dataRoomCurrent[0].lastName}`}</span>
                                    {userOnline !== null &&
                                    <div>
                                        {userOnline.find(p=>p.targetId===dataRoomCurrent[0].idUser) &&
                                            <div className="online" />
                                        }
                                    </div>
                                    }
                                </div>
                                :
                                <div style={{ position:'relative' }}>
                                    {dataRoomCurrent[0].avatarRoom !== null ? <img className="avatar" src={dataRoomCurrent[0].avatarRoom} alt="avatar"/>
                                    :<img className="avatar" src={avatarChatRoomDefault} alt="avatar"/>
                                    }
                                    <span>{dataRoomCurrent[0].nameRoom}</span>
                                    {userOnline !== null &&
                                    <div>
                                        {userOnline.find(p=>dataRoomCurrent.find(e=>e.idUser===p.targetId)) &&
                                            <div className="online" />
                                        }
                                    </div>
                                    }
                                </div>
                                }
                            </div>
                        }
                    </div>
                    <div className="right">
                        <div className='btn'>
                            <PhoneOutlined />
                        </div>
                        <div 
                            className="btn" 
                            onClick={handleCallVideo
                                // window.open(`/video/${idRoom}/call`,'targetWindow','toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=1000,height=800')
                            }
                        >
                            <VideoCameraOutlined />
                        </div>
                        <div
                            className="btn"
                            onClick={()=>setshowModalDetail(true)}
                        >
                            <ExclamationCircleOutlined />
                        </div>
                    </div>
                </div>
                <div className="chat-message">
                    {currentMessenges.length===0 ?
                    <div className="null-mess">
                        {dataRoomCurrent!==undefined &&
                        <div style={{ position:'relative' }}>
                            {dataRoomCurrent[0].avatar !== null ?<img className="avatar" src={dataRoomCurrent[0].avatar} alt="avatar"/>
                                :<img className="avatar" src={avatarDefault} alt="avatar"/>
                            }
                            <p>{`Hãy gửi lời chào đầu tiên đến ${dataRoomCurrent[0].firstName} ${dataRoomCurrent[0].lastName}`}</p>
                            {userOnline !== null &&
                                <div>
                                    {userOnline.find(p=>p.targetId===dataRoomCurrent[0].idUser) &&
                                        <div className="online" />
                                    }
                                </div>
                            }
                        </div>
                        }
                    </div>
                    :<>
                    {currentMessenges.map((i,index) => {
                        if (i.sourceId === currentUser.idUser) {
                            return (
                            <div className="message">
                                {i.typeMess===0 &&
                                <p>{deCode(i.message)}</p>
                                }
                                {i.typeMess===1 &&
                                    <Image src={deCode(i.message)} width={200} height={200}/>
                                }
                                {i.typeMess===2 &&
                                <div className="file">
                                <p>{handleFile(i.message)}
                                <button onClick={()=>{FetchAPI.dowloadFile(deCode(i.message),handleFile(i.message))}}>
                                    <DownloadOutlined />
                                </button>
                                </p>
                                </div>
                                }
                                {i.typeMess===3 &&
                                <div>
                                    {dataRoomCurrent &&
                                    <p>
                                        Bạn đã gọi cho  {dataRoomCurrent[0].type===1 ? `${dataRoomCurrent[0].lastName}`:`${dataRoomCurrent[0].nameRoom}`}
                                        <CallTime times={parseInt(deCode(i.message))}/> 
                                        <Button onClick={handleCallVideo} className="btn_call_again"><VideoCameraOutlined /> Gọi lại</Button>
                                    </p>
                                   }
                                </div>
                                }
                                {i.typeMess===4 &&
                                <div>
                                    {dataRoomCurrent &&
                                    <p>
                                        {dataRoomCurrent[0].type===1 ? `${dataRoomCurrent[0].lastName}`:`${dataRoomCurrent[0].nameRoom}`} đã bỏ lỡ cuộc gọi của bạn.
                                        <Button onClick={handleCallVideo} className="btn_call_again"><VideoCameraOutlined /> Gọi lại</Button>
                                    </p>
                                   }
                                </div>
                                }
                                {/* <span>{i.sourceId}</span> */}
                                <span>{timeAgo(currentTime,i.create_at)}</span>
                            </div>
                            );
                        } else {
                            return (
                            <div className="message mess-right">
                                <div className="text">
                                    {i.typeMess===0 &&
                                    <p>{deCode(i.message)}</p>
                                    }
                                    {i.typeMess===1 &&
                                        <Image src={deCode(i.message)} width={200} height={200}/>
                                    }
                                    {i.typeMess===2 &&
                                    <div className="file">
                                        <p>{handleFile(i.message)}
                                        <button onClick={()=>{FetchAPI.dowloadFile(deCode(i.message),handleFile(i.message))}}>
                                            <DownloadOutlined />
                                        </button>
                                        </p>
                                    </div>
                                    }
                                    {i.typeMess===3 &&
                                        <div>
                                            <p>
                                                {i.lastName} đã gọi cho bạn. <CallTime times={parseInt(deCode(i.message))}/> 
                                                <Button onClick={handleCallVideo} className="btn_call_again"><VideoCameraOutlined /> Gọi lại</Button>
                                            </p>
                                        
                                        </div>
                                    }
                                    {i.typeMess===4 &&
                                        <div>
                                            {dataRoomCurrent &&
                                            <p>
                                                Bạn đã bỏ lỡ cuộc gọi của {i.lastName}.
                                                <Button onClick={handleCallVideo} className="btn_call_again"><VideoCameraOutlined /> Gọi lại</Button>
                                            </p>
                                        }
                                        </div>
                                    }
                                    <span>{timeAgo(currentTime,i.create_at)}</span>
                                </div>
                                {currentMessenges[index===currentMessenges.length-1 ? 0:index+1].sourceId!==i.sourceId
                                || index === currentMessenges.length-1
                                ?
                                <div className="infor_mess">
                                    {i.avatar !== null ?<img className="avatar" src={i.avatar} alt="avatar"/>
                                        :<img className="avatar" src={avatarDefault} alt="avatar"/>
                                    }
                                    <span>{i.lastName}</span>
                                </div>
                                : <div className="null_avatar" />
                                }
                            </div>
                            );
                        }
                    })}
                    <div ref={messagesEndRef}/>
                    </>
                    }
                </div>
                <div className="send">
                {showEmoji &&
                <div ref={pickerEmojiRef} className="wrapperEmoji">
                    <Picker
                        onEmojiClick={onEmojiClick}
                        disableAutoFocus={true}
                        skinTone={SKIN_TONE_MEDIUM_DARK}
                        groupNames={{ smileys_people: 'PEOPLE' }}
                        native
                    />
                </div>
                }
                <input
                    placeholder="Nhập tin nhắn của bạn"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === "Enter") {
                         sendData();
                        }
                    }}
                    disabled={uploadList.length===0 && uploadListFile.length===0?false:true}
                ></input>
             
                {uploadList.length===0 && uploadListFile.length===0 ?
                <button className="btn_send" onClick={sendData}>Gửi  <SendOutlined/></button>
                :
                <button className="btn_send" onClick={sendDataFile}>Gửi tập tin  <SendOutlined/></button>
                }
                <button
                    className="btn_emoji" 
                    onClick={()=>setshowEmoji(!showEmoji)}
                >  
                    <SmileOutlined />
                </button>
                <Upload 
                    className="btn_sendImg"
                    action="/uploads/fileUploadMess"
                    // listType="picture"
                    onChange={onChangeUploadFile}
                    fileList={uploadListFile}
                    name="file"
                    onRemove={(e)=>handleRemoveFileUpload(e)}
                    disabled={uploadList.length!==0}
                >
                <button 
                    className="btn_up" 
                    style={uploadList.length===0?null:{opacity:"0.4"}}
                >
                <FileAddOutlined />
                </button>
                </Upload>

                <Upload 
                    className="btn_sendImg"
                    action="/uploads/uploadMediaImgMess"
                    listType="picture"
                    onChange={onChangeUploadImg}
                    fileList={uploadList}
                    name="image"
                    onRemove={(e)=>handleRemoveFileUpload(e)}
                    disabled={uploadListFile.length!==0}
                    accept="image/*"
                >
                <button 
                    className="btn_up"
                    style={uploadListFile.length===0?null:{opacity:"0.4"}}
                >
                    <FileImageOutlined />
                </button>
                </Upload>
                </div>
                </Col>
                :
                <Col className="chat-null" xl={18}>
                    <h2>Hãy chọn một đoạn chat hoặc bắt đầu cuộc trò chuyện mới</h2>
                </Col>
                }
            </Row>
        </div>
    )
}

export default Messenger;