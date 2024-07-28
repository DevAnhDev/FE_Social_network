import React ,{memo,useEffect,useState,useCallback} from 'react';
import {Modal,List} from 'antd';
import { Tabs,Button,Input,message } from 'antd';
import { useSelector } from 'react-redux';
import {deCode} from '../../utils/crypto';
import {DownloadOutlined} from '@ant-design/icons';
import * as FetchAPI from '../../utils/fetchAPI';
import avatarChatRoomDefault from '../../assets/logo/avatar_chat_room.png';
import Image from '../CustomImageAntd';
import { useParams } from 'react-router-dom';
const { TabPane } = Tabs;

const TabImage = memo(({currentMessenges})=>{
    const data = currentMessenges.filter(e=>e.typeMess===1);

    return(
        <div>
            <List
                dataSource={data}
                pagination={{
                    pageSize: 8,
                }}
                grid={{
                    gutter: 16,
                    xs: 1,
                    sm: 2,
                    md: 4,
                    lg: 4,
                    xl: 4,
                    xxl: 4,
                }}
                renderItem={item => (
                    <List.Item>
                        <Image className="imgDetail" src={deCode(item.message)} />
                    </List.Item>
                )}
            />
        </div>
    )
}
)
const TabFile = memo(({currentMessenges})=>{
    const data = currentMessenges.filter(e=>e.typeMess===2);
    return(
        <div className="modal_tab_file">
            <List
                pagination={{
                    pageSize: 6,
                }}
                dataSource={data}
                renderItem={item => (
                    <List.Item>
                        <a>{handleFile(item.message)}</a>
                        <Button className="btn_dowloadFile" onClick={()=>{FetchAPI.dowloadFile(deCode(item.message),handleFile(item.message))}}>
                            <DownloadOutlined />
                        </Button>
                    </List.Item>
                )}
            />
        </div>
    )
}
)
const handleFile = (text)=>{
    const StringFile = deCode(text);
    const lastIndex = StringFile.lastIndexOf("/");
    const str = StringFile.substring(lastIndex+1, StringFile.length);
    return str;
}
function ModalDetail ({showModalDetail,hideModal,socket,listRevicer,endCode}){
    const {currentUser} = useSelector(e=>e.UserReducer);
    const {currentMessenges,listRoom} = useSelector(e=>e.MessengesReducer);
    const [dataRoom, setdataRoom] = useState();
    const [nameRoom, setnameRoom] = useState("");
    let { idRoom } = useParams();

    function callback(key) {
        console.log(key);
    }
    useEffect(() => {
        if(idRoom!==undefined){
            getRoom()
        }
    }, [idRoom,listRoom,listRevicer]);

    const getRoom = async()=>{
        const promise = new Promise((resolve,reject)=>{
            resolve(listRoom.filter(e=>e.idRoom===idRoom));
        })
        promise.then(arr=>{
            // console.log("🚀 ~ file: modal_detail.js ~ line 85 ~ getRoom ~ listRoom", arr[0])
            setdataRoom(arr[0]);
            if(arr[0].nameRoom!==null){
                setnameRoom(arr[0].nameRoom);
            }
        })
        .catch((err)=>{
            console.log(err)
        })
    
    }

    const handleRenameRoomChat = async()=>{
        const data = {idRoom,nameRoom}
        const res = await FetchAPI.postDataAPI("/messenges/renameRoomById",data);
        if(res.msg){
            if(res.msg==="Success"){
                message.success("Đổi tên nhóm thành công !");
                sendData();
            }else{
                message.error("Có lỗi xảy ra")
            }
        }
    }

    const sendData = async()=>{
        const text = `${currentUser.firstName} ${currentUser.lastName} đã thay đổi tên nhóm thành ${nameRoom}`;
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
    }

    const TabSetting = ()=>{
        return(
            <>
            {dataRoom !== undefined &&
            <div>
                {dataRoom.type===2&&
                    <div className='tabsettingChatModal'>
                    <div style={{display:'flex',flexDirection:'row',alignItems:'center',marginBottom:10}}>
                        <h3 style={{margin:0}}>Tên nhóm</h3>
                        <Input
                            value={nameRoom}
                            defaultValue={dataRoom.nameRoom}
                            style={{width:200,marginInline:20,borderWidth:.1}}
                            onChange={(e)=>setnameRoom(e.target.value)}
                        />
                        <Button 
                            disabled={!nameRoom.trim()}
                            type='primary'
                            onClick={handleRenameRoomChat}
                        >
                                Đổi tên nhóm
                        </Button>
                    </div>
                    <div>
                        <h3>Ảnh đại diện nhóm</h3>
                        <div style={{display:'flex',flexDirection:'column'}}>
                        {dataRoom.avatarRoom !== null ? <img className="avatar" src={dataRoom.avatarRoom} alt="avatar"/>
                            :<img className="avatar" src={avatarChatRoomDefault} alt="avatar"/>
                        }
                        <Button style={{marginTop:10,width:'auto',marginInline:20}}>Thay đổi ảnh đại diện</Button>
                        </div>
                    </div>
                    </div>
                }
            </div>
            }
            </>
        )
    }
    return(
        <Modal
            visible={showModalDetail}
            onCancel={hideModal}
            footer={null}
            closable={false}
        >
            <Tabs defaultActiveKey="1" onChange={callback}>
                <TabPane tab="Ảnh" key="1">
                    <TabImage currentMessenges={currentMessenges}/>
                </TabPane>
                <TabPane tab="Đa phương tiện" key="2">
                    <TabFile currentMessenges={currentMessenges} />
                </TabPane>
                <TabPane tab="Cài đặt" key="3">
                    {TabSetting()}
                </TabPane>
            </Tabs>
            <div
                style={{ display:'flex', justifyContent:'flex-end'}}
            >
            <Button type="primary" onClick={hideModal} style={{ marginTop:20 }}>
                Đóng
            </Button>
            </div>
        </Modal>        
    )
}

export default memo(ModalDetail);