import React,{ useEffect, useRef, useState} from 'react';
import {useSelector,useDispatch} from 'react-redux';
import Peer from "simple-peer";
import * as FetchAPI from '../../utils/fetchAPI';
import {Button,Modal} from 'antd';
import PhoneCall from '../../assets/lottifiles/phone-call.gif';
import {updateVisibleCall,updateIdRoomCall,updateStatusCall} from '../../redux/reducers/messenges.reducer';
import SoundPhoneCall from '../../assets/audio/phone_call.wav';
import PhoneHangUp from '../../assets/audio/phone_hang_up.mp3';
import {PhoneOutlined,CloseOutlined,RightOutlined,LeftOutlined,FullscreenOutlined,FullscreenExitOutlined,FundProjectionScreenOutlined} from '@ant-design/icons';
import CallTime from './call_time';
import {endCode} from '../../utils/crypto';

function VideoChat({socket}){
    const currentUser = useSelector(e=>e.UserReducer.currentUser);
    const videoUserRef = useRef();
    const myVideoRef = useRef();
    const connectionRef = useRef();
    const audioPhoneRef = useRef();
    const audioPhoneHangUpRef = useRef();
    const [userToCall, setuserToCall] = useState();
    const [ receivingCall, setReceivingCall ] = useState(false);
    const [ callerSignal, setCallerSignal ] = useState();
    const [ caller, setCaller ] = useState("");
    const [ callAccepted, setCallAccepted ] = useState(false);
    const [ rejectCall, setrejectCall] = useState(false);
    const [missCall, setmissCall] = useState(false);
    const [ name, setName ] = useState("");
    const [statusCalling, setstatusCalling] = useState(false);
    const [moveMyvideo, setmoveMyvideo] = useState(false);
    const dispatch = useDispatch();
    const {datacall,idRoomCall,statusCall,visibleCall} = useSelector(e=>e.MessengesReducer);
    const [totalTime, settotalTime] = useState(0);
    const [fullScreen, setfullScreen] = useState(false);
    const [stream, setstream] = useState();
    
    //Run calling
    useEffect(()=>{
        if(visibleCall){
            if(statusCall==="calling"){
                setstatusCalling(true);
                if(!statusCalling){
                    callUser();
                }
                socket.on("user-left-call",async(data)=>{
                    if(callAccepted===false){
                        if(data.positionSocket===0){
                            await sendMessCall();
                        }
                        audioPhoneHangUpRef.current.play();
                        setrejectCall(true);
                        setstatusCalling(false);
                    }else{
                        leaveCall();
                    }
                })
            }
        }
        return ()=>{
            socket.off("user-left-call")
        }
    },[visibleCall,statusCall,callAccepted])

    //Run called
    useEffect(() => {
        if(visibleCall){
            if(statusCall==="called"){
                console.log("zô")
                if(datacall!==null){
                    if(!callAccepted){
                        setReceivingCall(true);
                        setCaller(datacall.from);
                        setName(datacall.name);
                        setCallerSignal(datacall.signal);
                        audioPhoneRef.current.play();
                    }
                    if(rejectCall){
                        setrejectCall(false);
                    }
                    if(missCall){
                        setmissCall(false);
                    }
                    socket.on("user-left-call",async(data)=>{
                        if(callAccepted){
                            leaveCall();
                            // if(connectionRef.current){
                                
                            //     // await sendMessCall();
                            //     // connectionRef.current.destroy();
                            //     // handleInit();
                            // }
                        }else{
                            if(data.positionSocket===0){
                                await sendMessCall();
                            }
                            audioPhoneRef.current.pause();
                            setmissCall(true);
                            setReceivingCall(false);
                        }
                    })
                    
                }
            }
        }
        return ()=>{
            socket.off("user-left-call")
        }
    },[datacall,visibleCall,statusCall,callAccepted])

    //Set time call
    useEffect(() => {
        if(callAccepted){
            setInterval(()=>{
                settotalTime(t=> t+1);
            },1000)
        }
    },[callAccepted])

    const callUser = async() => {
        const data = {"idRoom":idRoomCall,"idUser":currentUser.idUser};
        const res = await FetchAPI.postDataAPI("/messenges/getReciver",data);
        const idTocall = res.msg;

        navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
            setstream(stream);
            const peer = new Peer({
                initiator: true,
                trickle: false,
                stream: stream,
                config: {
                    iceServers: [
                        {
                            urls:"stun:localhost:3478"
                        },
                        {
                            urls: "turn:localhost:3478",
                            username: "chien",
                            credential: "123456"
                        }
                    //   {
                    //     urls: "turn:numb.viagenie.ca",
                    //     credential: "muazkh",
                    //     username: "webrtc@live.com",
                    //   },
                    //   { urls: 'stun:stun.l.google.com:19302' }, 
                    //   { urls: 'stun:global.stun.twilio.com:3478?transport=udp' }
                    ],
                },
            })
            peer._debug = console.log;
            peer.on("signal", (data) => {
                socket.emit("callUser", {
                    userToCall: idTocall,
                    signalData: data,
                    from: currentUser.idUser,
                    idRoom: idRoomCall,
                    name: currentUser.firstName+" "+currentUser.lastName
                })
            })
            peer.on("stream", (stream) => {
                if(videoUserRef.current){
                    videoUserRef.current.srcObject = stream
                }
            })
            peer.on('close',() => {
                handleInit();
            });
            socket.on("callAccepted", (signal) => {
                setCallAccepted(true)
                myVideoRef.current.srcObject = stream;
                peer.signal(signal);
                setstatusCalling(false);
            })
            socket.on("rejectCall", (data)=>{
                if(data==="reject"){
                    audioPhoneHangUpRef.current.play();
                    setrejectCall(true);
                    setstatusCalling(false);
                }
            })
            connectionRef.current = peer
        });
	}

    const answerCall =() =>  {
        audioPhoneRef.current.pause();
        navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
            setstream(stream);
            setCallAccepted(true);
            myVideoRef.current.srcObject = stream;
            const peer = new Peer({
                initiator: false,
                trickle: false,
                stream: stream,
                config: {
                    iceServers: [
                        // {
                        //     urls: "turn:numb.viagenie.ca",
                        //     credential: "muazkh",
                        //     username: "webrtc@live.com",
                        // },
                        {
                            urls:"stun:localhost:3478"
                        },
                        {
                            urls: "turn:localhost:3478",
                            username: "chien",
                            credential: "123456"
                        }
                        // {
                        //     urls: "stun:numb.viagenie.ca",
                        //     credential: "128Dat128",
                        //     username: "kennavi281@gmail.com",
                        // },
                        // {
                        //     urls: "turn:numb.viagenie.ca",
                        //     credential: "128Dat128",
                        //     username: "kennavi281@gmail.com",
                        // },
                    //   {
                    //     urls: "turn:numb.viagenie.ca",
                    //     credential: "muazkh",
                    //     username: "webrtc@live.com",
                    //   },
                    //   { urls: 'stun:stun.l.google.com:19302' }, 
                    //   { urls: 'stun:global.stun.twilio.com:3478?transport=udp' }
                    ],
                },
            })
            peer._debug = console.log;

            peer.on("signal", (data) => {
                socket.emit("answerCall", { signal: data, to: caller })
            })
    
            peer.on("stream", (stream) => {
                if(videoUserRef.current){
                    videoUserRef.current.srcObject = stream
                }
            })
            peer.on('close',() => {
                handleInit();
            });
            peer.signal(callerSignal)
            connectionRef.current = peer
        })
	}
    
    const handlerejectCall = async()=>{
        await sendMessCall();
        socket.emit("rejectCall", {to: caller});
        handleInit();
    }

    const leaveCall = async() => {
        await sendMessCall();
		connectionRef.current.destroy();
	}

    const sendMessCall = async() =>{
        if(statusCall==="calling"&&callAccepted){
            const idCall = await FetchAPI.postDataAPI("/messenges/getReciver", {"idRoom":idRoomCall,"idUser":currentUser.idUser});
            const idTocall = idCall.msg;
            const encode_text = endCode(totalTime.toString());
            const data = {"idUser":currentUser.idUser,"idRoom":idRoomCall,"message":encode_text,"typeMess":3};
            const res = await FetchAPI.postDataAPI("/messenges/addMessenger",data);
            if(res.msg==="Success"){
                console.log("ok");
            }
            socket.emit("chat", {"text":encode_text,"targetId":idTocall,"idRoom":idRoomCall,"typeMess":3});
        }else if(statusCall==="called"&&callAccepted){
            const idCall = await FetchAPI.postDataAPI("/messenges/getReciver", {"idRoom":idRoomCall,"idUser":datacall.from});
            const idTocall = idCall.msg;
            const encode_text = endCode(totalTime.toString());
            const data = {"idUser":datacall.from,"idRoom":idRoomCall,"message":encode_text,"typeMess":3};
            const res = await FetchAPI.postDataAPI("/messenges/addMessenger",data);
            if(res.msg==="Success"){
                console.log("ok");
            }
            socket.emit("chat", {"text":encode_text,"targetId":idTocall,"idRoom":idRoomCall,"typeMess":3});
        }else if(statusCall==="calling"&&!callAccepted){
            const idCall = await FetchAPI.postDataAPI("/messenges/getReciver", {"idRoom":idRoomCall,"idUser":currentUser.idUser});
            const idTocall = idCall.msg;
            const encode_text = endCode(totalTime.toString());
            const data = {"idUser":currentUser.idUser,"idRoom":idRoomCall,"message":encode_text,"typeMess":4};
            const res = await FetchAPI.postDataAPI("/messenges/addMessenger",data);
            if(res.msg==="Success"){
                console.log("ok");
            }
            socket.emit("chat", {"text":encode_text,"targetId":idTocall,"idRoom":idRoomCall,"typeMess":4});
        }else if(statusCall==="called"&&!callAccepted){
            const idCall = await FetchAPI.postDataAPI("/messenges/getReciver", {"idRoom":idRoomCall,"idUser":datacall.from});
            const idTocall = idCall.msg;
            const encode_text = endCode(totalTime.toString());
            const data = {"idUser":datacall.from,"idRoom":idRoomCall,"message":encode_text,"typeMess":4};
            const res = await FetchAPI.postDataAPI("/messenges/addMessenger",data);
            if(res.msg==="Success"){
                console.log("ok");
            }
            socket.emit("chat", {"text":encode_text,"targetId":idTocall,"idRoom":idRoomCall,"typeMess":4});
        }
    }

    //Return to default state
    const handleInit = async()=>{
        audioPhoneHangUpRef.current.play();
        dispatch(updateIdRoomCall(null));
        dispatch(updateStatusCall(null));
        dispatch(updateVisibleCall(false));
        setReceivingCall(false);
        setCallAccepted(false);
        setCaller("");
        setName("");
        setCallerSignal();
        setmoveMyvideo(false);
        setuserToCall();
        settotalTime(0);
        window.location.reload();
    }

    const handleMoveMyvideo = () =>  {
        if(moveMyvideo){
            document.getElementsByClassName("myVideo")[0].style.right = "0px";
            setmoveMyvideo(false)
        }else{
            document.getElementsByClassName("myVideo")[0].style.right = "-35%";
            setmoveMyvideo(true)
        }
    }
    const shareScreen = ()=>{
        navigator.mediaDevices.getDisplayMedia({cursor:true}).then(screenStream=>{
            connectionRef.current.replaceTrack(
                stream.getVideoTracks()[0],
                screenStream.getVideoTracks()[0],
                stream
            );
            screenStream.getTracks()[0].onended = () => {
                connectionRef.current.replaceTrack(
                    screenStream.getVideoTracks()[0],
                    stream.getVideoTracks()[0],
                    stream
                );
                myVideoRef.current.srcObject = stream;
            }
            myVideoRef.current.srcObject = screenStream;
        })
       
    }
    const propsFullScreen = fullScreen?{
        width:"100%",
        style:{top:10}
    }:null
    return(
        <Modal
            visible={visibleCall}
            footer={null}
            closable={false}
            {...propsFullScreen}
        >
        <div className="wrapperVideoCall" style={fullScreen?{padding:0}:null}>
            <audio id="audio" controls loop ref={audioPhoneRef}>
                <source src={SoundPhoneCall} type="audio/wav"></source>
            </audio>
            <audio id="audio" controls ref={audioPhoneHangUpRef}>
                <source src={PhoneHangUp} type="audio/wav"></source>
            </audio>
        
            <div className="videoUser">
            {callAccepted ?
                <div className="userVideo" style={fullScreen?{height:"100vh"}:null}>
                    <video ref={videoUserRef} autoPlay playsInline className="video"/>
                </div>
                :null
            }
            </div>
            {callAccepted &&
            <div className="myVideo" style={fullScreen?{width:"20%",top:0}:null}>
                {!fullScreen &&
                <Button onClick={handleMoveMyvideo} >
                    {moveMyvideo ?
                        <LeftOutlined />
                        :
                        <RightOutlined />
                    }
                    
                </Button>
                }
                <div style={fullScreen?{width:300}:{width:200,height:150 }}>
                    <video
                        muted 
                        ref={myVideoRef} 
                        autoPlay 
                        playsInline
                        className="video myVideoMain"
                    />
                </div>
            </div>
            }

            {!callAccepted && statusCalling &&
                <div className="calling">
                    <h2>Đang gọi ..........</h2>
                    <div className="select">
                        <Button className="btn_Reject" variant="contained" color="primary" onClick={handleInit}>
                            <CloseOutlined />
                        </Button>
                        <p>Hủy</p>
                    </div>
                </div>
            }
            {rejectCall &&
                <div className="rejectCall">
                    <h2>Người dùng không bắt máy</h2>
                    <div className="select">
                        <Button className="btn_Reject" variant="contained" color="primary" onClick={handleInit}>
                            <CloseOutlined />
                        </Button>
                        <p>Đóng</p>
                    </div>
                </div>
            }
            {missCall &&
                <div className="rejectCall">
                <h2>{`Cuộc gọi nhỡ từ ${name}`}</h2>
                <div className="select">
                    <Button className="btn_Reject" variant="contained" color="primary" onClick={handleInit}>
                        <CloseOutlined />
                    </Button>
                    <p>Đóng</p>
                 </div>
             </div>
            }
            <div>
				{receivingCall && !callAccepted ? (
                    <div className="caller">
                        <img src={PhoneCall} width={200} height={200}/>
						<h2 >{name} đang gọi...</h2>
                        <div className="groupBtn_ReceivingCall">
                            <div className="select">
                            <Button className="btn_Reject" variant="contained" color="primary" onClick={handlerejectCall}>
                                <CloseOutlined />
                            </Button>
                            <p>Từ chối</p>
                            </div>
                            <div className="select">
                            <Button className="btn_Accept" variant="contained" color="primary" onClick={answerCall}>
                                <PhoneOutlined />
                            </Button>
                            <p>Trả lời</p>
                            </div>
                        </div>
					
					</div>
				) : null}
			</div>

            <div>
            {callAccepted ? 
                (
                <div className="callAccepted">
                    <CallTime times={totalTime}/>
                    <div className="group_btn">
                    <div className="select">
                            <Button className="btn_FullScreen" variant="contained" color="secondary" onClick={shareScreen}>
                                <FundProjectionScreenOutlined />
                            </Button>
                            <p>Chia sẻ màn hình</p>        
                        </div>
                        <div className="select">
                            <Button className="btn_Close" variant="contained" color="secondary" onClick={leaveCall}>
                                <PhoneOutlined />
                            </Button>
                            <p>Kết thúc cuộc gọi</p>
                        </div>
                        <div className="select">
                            <Button className="btn_FullScreen" variant="contained" color="secondary" onClick={()=>setfullScreen(!fullScreen)}>
                                {fullScreen ?
                                <FullscreenExitOutlined />
                                :
                                <FullscreenOutlined />
                                }
                               
                            </Button>
                            {fullScreen ?
                            <p>Thu nhỏ</p>
                            :
                            <p>Toàn màn hình</p>
                            }
                        </div>
                    </div>
                </div>
                )
            :null}
            </div>
        </div>
        </Modal>
    )
}

export default VideoChat;