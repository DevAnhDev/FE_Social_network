import React ,{memo,useState,useEffect,useLayoutEffect,useRef} from 'react';
import logo from '../../assets/logo/logo_space.png';
import {Input,Dropdown,Menu,message,Badge,List,Select, Button} from 'antd';
import { useNavigate,Link,useLocation } from 'react-router-dom';
import { useSelector, useDispatch} from 'react-redux';
import {LoginOutlined,MessageOutlined,NotificationOutlined,MenuOutlined,SearchOutlined} from '@ant-design/icons';
import {HomeOutlined,TeamOutlined,UserOutlined,FileImageOutlined,SettingOutlined,ContainerOutlined} from '@ant-design/icons';
import avatarDefault from '../../assets/logo/avatar.jpg';
import * as FetchAPI from '../../utils/fetchAPI';
import {updateDataNotification} from '../../redux/reducers/notification.reducer';
import {timeAgo} from '../../utils/timeAgo';
import DebounceSelect from './DebounceSelect';

const { Option } = Select;

function Header ({confirmUser,socket}){
    const {currentUser} = useSelector(e=>e.UserReducer);
    const {dataNotification,quantityNotificationUnread} = useSelector(e=>e.NotificationReducer);
    const [visibleDropDownNotify, setvisibleDropDownNotify] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [widthScreen, setwidthScreen] = useState(0);
    const dropDownRef = useRef();

    useEffect(()=>{
        setvisibleDropDownNotify(false);
    },[location])

    //Get data notify
    useEffect(() => {
        if(currentUser!==null){
            getDataNotify()
        }
    },[currentUser])

    //Set clickoutside
    useEffect(() => {
        if(dropDownRef.current!==undefined){
            document.addEventListener('mousedown', clickOutside);
        }
        // clean up function before running new effect
        return () => {
            document.removeEventListener('mousedown', clickOutside);
        }
    }, [dropDownRef.current])

    const clickOutside = (e)=>{
        if(dropDownRef.current.contains(e.target)) {
            // inside click
            return;
        }
        setvisibleDropDownNotify(false);
    }

    //Update current Time
    useEffect(() => {
        setInterval(()=>{
            setCurrentTime(new Date())
        },1000)
    },[])

    //Update width
    useLayoutEffect(() => {
        function updateSize() {
            if(window.innerWidth>990){
                if(document.getElementsByClassName("inputSearch")[0]){
                    document.getElementsByClassName("inputSearch")[0].style.display="flex";
                }
            }else{
                if(document.getElementsByClassName("inputSearch")[0]){
                    document.getElementsByClassName("inputSearch")[0].style.display="none";
                }  
            }
            setwidthScreen(window.innerWidth);
        }
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const getDataNotify = async()=>{
        const data = {"idUser":currentUser.idUser};
        const res = await FetchAPI.postDataAPI("/notification/getNotification",data);
        dispatch(updateDataNotification(res.msg));
    }

    const handleClickNotify = (item)=>{
        let arr_notify = JSON.parse(JSON.stringify(dataNotification));
        arr_notify.map((e)=>{
            if(e.id===item.id){
                FetchAPI.postDataAPI("/notification/updateNotifyReaded",{"id":e.id});
                e.read=1;
            }
        })
        dispatch(updateDataNotification(arr_notify));
        if(item.type===1){
            navigate("/friends");
        }
    }

    const handleLogout = ()=>{
        const key = "logout"
        message.loading({content:'Đăng đăng xuất ...', key});
        setTimeout(()=>{
            localStorage.removeItem("token");
            message.success({ content: 'Đăng xuất thành công !',key, duration: 2 });
            confirmUser();
            socket.emit("end")
        },1000)
    }

    const handleSearch = ()=>{
        if(widthScreen>990){
            
        }else{
            if(document.getElementsByClassName("inputSearch")[0].style.display==="flex"){
                if(document.getElementsByClassName("inputSearch")[0].value===""){
                    document.getElementsByClassName("inputSearch")[0].style.display="none";
                }else{
                    console.log("search nào");
                    document.getElementsByClassName("inputSearch")[0].style.display="none";
                }
              
            }else{
                document.getElementsByClassName("inputSearch")[0].style.display="flex";
            }
        }
    }
    
    const dropdownAccount = ()=>(
        <Menu className="menuAccount">
            <Menu.Item onClick={handleLogout} key="log-out">
                <LoginOutlined/> Đăng xuất
            </Menu.Item>
        </Menu>
    )

    const markAllRead = ()=>{
        let arr_notify = JSON.parse(JSON.stringify(dataNotification));
        arr_notify.map(e=>{
            if(e.read===0){
                FetchAPI.postDataAPI("/notification/updateNotifyReaded",{"id":e.id});
                e.read=1; 
            }
        })
        dispatch(updateDataNotification(arr_notify));
        message.success("Đã đánh dấu tất cả thông báo là đã đọc.");
    }

    const dropdownNotify = ()=>{
        return(
            <div ref={dropDownRef} className="wrapperNotify">
            <div className="top">
                <h2>Thông báo</h2>
                <span onClick={markAllRead}>Đánh dấu tất cả đã đọc</span>
            </div>
            {dataNotification.length===0 ?
            <div className="wrapperNotifyNull">
                <span>Bạn chưa có thông báo nào.....</span>
            </div>
            :
            <div>
                <List
                    dataSource={dataNotification}
                    pagination={dataNotification.length>5?{ defaultCurrent:1,pageSize:5}:false}
                    renderItem={item => (
                        <List.Item className="itemNotify" style={item.read===1?null:{backgroundColor:'rgba(210, 210, 210,.5)'}} onClick={()=>handleClickNotify(item)}>
                            {item.avatar !== null ?<img className="avatar" src={item.avatar} alt="avatar"/>:
                            <img className="avatar" src={avatarDefault} alt="avatar"/>
                            }
                            <div className="description">
                                <span><b>{`${item.firstName} ${item.lastName}`}</b> {`${item.description}`}</span>
                                <span>{timeAgo(currentTime,item.create_at)}</span>
                            </div>
                        </List.Item>
                    )}
                />
            </div>
            }
            </div>
        )
        
    }

    const NavMenu = ()=>(
        <Menu
            className="navMenu2"
            defaultSelectedKeys={['/']}
            selectedKeys={location.pathname}
        >
            <Menu.Item key="/" >
                <Link to="/">
                    <HomeOutlined/>
                    Trang chủ
                </Link>
            </Menu.Item>
            <Menu.Item key="/friends">
                <Link to="/friends">
                    <TeamOutlined />
                    Bạn bè
                </Link>
            </Menu.Item>
            <Menu.Item key="3" >
                <ContainerOutlined />
                Tin mới
            </Menu.Item>
            <Menu.Item key="4">
                <FileImageOutlined />
                Ảnh
            </Menu.Item>
            <Menu.Item key="/profile" >
                <Link to={`/profile/${currentUser.idUser}`}>
                    <UserOutlined />
                    Hồ sơ
                </Link>
            </Menu.Item>
            <Menu.Item key="6" >
                <SettingOutlined />
                Cài đặt
            </Menu.Item>
        </Menu>
    )

    const fetchUserList = async(username)=> {
        console.log('fetching user', username);
        const res = await FetchAPI.postDataAPI("/user/searchUserByName",{"name":username});
        if(username!==""){
            return res.msg.map(user=>(
                <Option value={user.idUser}>
                    <div className="resultSearchHeader" onClick={()=>navigate(`/profile/${user.idUser}`)}>
                    {user.avatar!==null ?
                        <img className="avatar" src={user.avatar} alt="avatar"/>
                        :
                        <img className="avatar" src={avatarDefault} alt="avatar"/>
                    }
                        {`${user.firstName} ${user.lastName}`}
                    </div>
                </Option>
            ))
        }else{
            return [];
        }
   
    }
    return(
        <div className="wrapperHeader">
            <div className="logo" onClick={()=>navigate("/")}>
                <img src={logo} width={80} height={80} alt="logo"/>
                <span>Space Social</span>
            </div>
            <Dropdown overlay={NavMenu} arrow>
                <button  className="btn_menu">
                    <MenuOutlined />
                </button>
            </Dropdown>
            <div className="right">
            {currentUser!==null&&
                <>
                <DebounceSelect
                    mode="multiple"
                    value={[]}
                    placeholder="Tìm kiếm ..."
                    fetchOptions={fetchUserList}
                    // onChange={(newValue) => {
                    //     setlistUserSearch(newValue);
                    // }}
                    className="inputSearch"
                />
                <Button className="btn_search" onClick={handleSearch}><SearchOutlined /></Button>
                <button onClick={()=>navigate('/messenges')} className="btn_mess"><MessageOutlined /></button>
                <Dropdown overlay={dropdownNotify} placement="bottomCenter" arrow visible={visibleDropDownNotify}>
                    <button className="btn_notify" onClick={()=>setvisibleDropDownNotify(!visibleDropDownNotify)}>
                    <Badge count={quantityNotificationUnread} size="small">
                        <NotificationOutlined />
                    </Badge>
                    </button>
                </Dropdown>
                <Dropdown overlay={dropdownAccount} arrow>
                {currentUser.avatar!==null ?
                    <img className="avatar" src={currentUser.avatar} alt="avatar"/>
                    :
                    <img className="avatar" src={avatarDefault} alt="avatar"/>
                }
                </Dropdown>
                </>
            }
            </div>
        </div>
    )
}

export default memo(Header);