/* eslint-disable no-undef */
import React, {useEffect,useState,useLayoutEffect} from 'react';
import './assets/scss/App.scss';
import { Routes,Route,useNavigate,useLocation} from 'react-router-dom';
import {Home,Login,Profile,Messenger,Friend,ImagePage,Story} from './page';
import {Header,LeftLayout,RightLayout,VideoChat} from './component';
import { Row, Col } from 'antd';
import {checkAuth} from './utils/checkAuth';
import SocketClient from './utils/SocketClient';
import {useDispatch,useSelector} from 'react-redux';
import {updateFullScreen} from './redux/reducers/layout.reducer';
import {updateUser} from './redux/reducers/user.reducer';
import io from "socket.io-client";
import * as FetchAPI from './utils/fetchAPI';
import {updateDataFriend} from './redux/reducers/user.reducer';
import CreateStory from './component/Story/CreateStory';
import { setFaceIO } from './redux/reducers/faceIO.reducer';
const dotenv = require('dotenv');
dotenv.config({path: '../.env'});

let socket = io.connect('/');

function App() {
  const navigate = useNavigate();
  const [user, setuser] = useState(false);
  const [showContent, setshowContent] = useState(false);
  const fullscreen = useSelector(e=>e.LayoutReducer.fullscreen);
  const {currentUser} = useSelector(e=>e.UserReducer);
  const {faceioInstance} = useSelector(e=>e.FaceIOReducer);

  const dispatch = useDispatch();

  useEffect(() => {
    const script = document.createElement('script')
    script.src = '//cdn.faceio.net/fio.js'
    script.async = true
    script.onload = () => loaded()
    document.body.appendChild(script)
    return () => {
        document.body.removeChild(script)
    }
  },[])

  const loaded = () => {
      console.log("hahahaa");
      console.log(faceIO)
      if (faceIO && !faceioInstance) {
          const face = new faceIO('fioa77d4')
          dispatch(setFaceIO(face))
      }
  }
  // useEffect(()=> {
  //   window.addEventListener('offline', () => {
  //     socket.emit("end")
  //   })
  // },[])

  useEffect(()=>{
    // localStorage.removeItem("token");
    // console.log(process.env.SECRETKEYMESS);
    document.title="Space Social"
    setshowContent(false);
    checkAuthAction();
    socket = io.connect('/')
  },[user])
  const location = useLocation();

  //Update dataFriend
  useEffect(() => {
    if(currentUser!==null){
      getDataFriend();
    }
  },[currentUser])
  //Hide left right
  useLayoutEffect(()=>{
    if(document.getElementsByClassName("wrapperLeft")[0]!==undefined){
      if(location.pathname.includes("/messenges")||location.pathname.includes("/story")){
          document.getElementsByClassName("wrapperLeft")[0].style.display = "none";
          document.getElementsByClassName("wrapperRight")[0].style.display = "none";
          dispatch(updateFullScreen(true))
      }else{
          document.getElementsByClassName("wrapperLeft")[0].style.display = "";
          document.getElementsByClassName("wrapperRight")[0].style.display = "";
          dispatch(updateFullScreen(false))
      }
    }
  },[location,showContent])

  const checkAuthAction = async()=>{
    const status_auth = await checkAuth(dispatch);
    if(!status_auth){
      setuser(false);
      dispatch(updateFullScreen(true))
      navigate("/login");
      setshowContent(true);
    }else{
      setuser(true);
      dispatch(updateFullScreen(false))
      // navigate("/");
      setshowContent(true);
    }
  }
  
  const getDataFriend = async()=>{
      const data = {"idUser":currentUser.idUser};
      const res = await FetchAPI.postDataAPI("/user/getFriendById",data);
      dispatch(updateDataFriend(res.msg));
  }
  return (
    <div className="App">
      {showContent &&
        <div>
        {user &&
          <Header 
            confirmUser={()=>{
              setuser(false);
              dispatch(updateUser(null))
            }} 
            socket={socket}
          />
        }
        { user && 
          <SocketClient socket={socket}/>
        }
        <div className="content">
        <VideoChat socket={socket}/>
        <Row>
        {user &&
        <Col xl={5} md={0} xs={0}>
          <LeftLayout />
        </Col>
        }
        <Col xl={fullscreen?24:14} md={fullscreen?24:16} xs={24}>
        <div className="content_main">
          <Routes>
            <Route path="/" element={<Home socket={socket}/>}/>
            <Route path="/login" element={<Login user={user} confirmUser={()=>setuser(true)}/>} />
            <Route path="/profile" element={<Profile socket={socket}/>}>
              <Route path=":idUser" element={<Profile socket={socket}/>} />
            </Route>
            <Route path="messenges" element={<Messenger socket={socket}/>}>
                <Route path=":idRoom" element={<Messenger socket={socket}/>} />
            </Route>
            <Route path="/friends" element={<Friend socket={socket}/>} />
            <Route path="/image" element={<ImagePage socket={socket}/>} />
            <Route path="/story" element={<Story socket={socket}/>} >
              <Route path="create" element={<Story socket={socket}/>}/>
            </Route>
          </Routes>
        </div>
        </Col>
        {user &&
        <Col xl={5} md={8} xs={0}>
          <RightLayout socket={socket}/>
        </Col>
        }
        </Row>
        </div>
        </div>
      }
    </div>
  );
}

export default App;
