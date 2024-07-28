import React ,{memo,useState,useEffect} from 'react';
import { Menu } from 'antd';
import {Link,useLocation} from 'react-router-dom';
import {HomeOutlined,TeamOutlined,UserOutlined,FileImageOutlined,SettingOutlined,ContainerOutlined} from '@ant-design/icons';
import {useSelector} from 'react-redux';
import avatarDefault from '../../assets/logo/avatar.jpg'
function LeftLayout (){
    const location = useLocation();
    const currentUser = useSelector(e=>e.UserReducer.currentUser);
    const items = [
        { key: '1', label: 'Trang chủ', path: '/',icon: <HomeOutlined/> },
        { key: '2', label: 'Bạn bè', path: '/friends',icon:<TeamOutlined />},
        { key: '3', label: 'Tin mới', path: '/newfeeds',icon: <ContainerOutlined />},
        { key: '4', label: 'Ảnh', path: '/image',icon: <FileImageOutlined /> },
        { key: '5', label: 'Hồ sơ', path: `/profile`,icon: <UserOutlined /> },
        { key: '6', label: 'Cài đặt', path: '/setting',icon: <SettingOutlined /> }
    ]
    const [selectedKey, setSelectedKey] = useState("1");
    // console.log(currentUser);
   
    useEffect(() => {
        if(location.pathname==="/"){
            setSelectedKey(items[0].key);
        }else{
            const items_tmp = [...items];
            items_tmp.splice(0,1);
            if(items_tmp.find(_item => location.pathname.startsWith(_item.path))){
                setSelectedKey(items_tmp.find(_item => location.pathname.startsWith(_item.path)).key)
            }
        }
    }, [location])
  

    const NavMenu = ()=>(
    <Menu
        className="navMenu"
        defaultSelectedKeys={['/']}
        selectedKeys={selectedKey}
    >
        {items.map((item) => (
            <Menu.Item key={item.key}>
            <Link to={item.key==="5"?item.path+"/"+currentUser.idUser:item.path}>
                {item.icon}
                {item.label}
            </Link>
            </Menu.Item>
        ))}
    </Menu>
    )
    const InforUser = ()=>(
        <div className="infor">
            {currentUser.avatar!==null ?
                <img className="avatar" src={currentUser.avatar} alt="avatar"/>
                :
                <img className="avatar" src={avatarDefault} alt="avatar"/>
            }
            <div className="lable">
                <h4 className="name">{`${currentUser.firstName} ${currentUser.lastName}`}</h4>
                <p className="username">{`@${currentUser.username}`}</p>
            </div>
        </div>
    )
    return(
        <div className="wrapperLeft">
            {currentUser!==null &&
            <div>
                <InforUser/>
                <NavMenu/>
            </div>
            }
        </div>
    )
}

export default memo(LeftLayout);