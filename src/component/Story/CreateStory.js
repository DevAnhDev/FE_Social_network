import React, {useState} from 'react';
import {Row,Col,Button,Upload} from 'antd';
import { useNavigate } from 'react-router-dom';
import {useSelector} from 'react-redux';
import avatarDefault from '../../assets/logo/avatar.jpg';
import logo from '../../assets/logo/logo_space.png';
import {CloseCircleOutlined} from '@ant-design/icons';
import * as FetchAPI from '../../utils/fetchAPI';
import Image from '../CustomImageAntd'
function CreateStory (){
    const {currentUser} = useSelector(e=>e.UserReducer);
    const navigate = useNavigate();
    const [uploadListImageStory, setuploadListImageStory] = useState([]);
    const [pathImage, setpathImage] = useState("");

    const onChangeUploadImg = async({ fileList: newFileList })=>{
        setuploadListImageStory(newFileList);
        if(newFileList[0]?.status == "done"){
            console.log(newFileList[0].response.msg.path);
            setpathImage(newFileList[0].response.msg.path);
        }
        // if(newFileList[0]?.status == "done"){
        //    const res = await FetchAPI.postDataAPI('http://127.0.0.1:3002/ai_suggestion/image',{url:newFileList[0].response.msg.path})
        //    console.log(JSON.parse(res.msg));
        // }
    }

    const handleRemoveFileUpload = (item)=>{
        if(item.response.msg){
            const data = {"pathFile":item.response.msg.path};
            FetchAPI.postDataAPI("/uploads/removeFile",data);
        }
    }

    const handleActionRemovePost = (path) => {
        const data = {"pathFile":path};
        FetchAPI.postDataAPI("/uploads/removeFile",data);
        setpathImage("");
        setuploadListImageStory([]);
    }
    return(
        <div className="wrapperCreateStory">
            <Row>
            <Col xxl={6} xl={6} lg={8} md={8} sm={8} xs={0} className="left-create-story">
                <div className="top-create-story">
                    <Button className="btn-close" onClick={()=>navigate("/")}>
                        <CloseCircleOutlined />
                    </Button>
                    <img className="logo" src={logo} /> 
                </div>
                <h2>Tin của bạn</h2>
                <div className="infor">
                    {currentUser.avatar!==null ?
                        <img onClick={()=>navigate(`/profile/${currentUser.idUser}`)} className="avatar" src={currentUser.avatar} alt="avatar"/>
                        :
                        <img onClick={()=>navigate(`/profile/${currentUser.idUser}`)} className="avatar" src={avatarDefault} alt="avatar"/>
                    }
                    <div className="name">
                        <p>{`${currentUser.firstName} ${currentUser.lastName}`}</p>
                    </div>
                </div>
                {pathImage != "" &&            
                <div className='action-story'>
                    <Button className='btn' onClick={()=>handleActionRemovePost(pathImage)}>Bỏ</Button>
                    <Button className='btn' style={{marginLeft:20}} type="primary">Chia sẻ lên tin</Button>
                </div>
                }
            </Col>
            <Col xxl={18} xl={18} lg={16} md={16} sm={16} xs={24} className="content-create-story">
                {pathImage == "" ?
                <>
                <Upload
                    onChange={onChangeUploadImg}
                    fileList={uploadListImageStory}
                    onRemove={(e)=>handleRemoveFileUpload(e)}
                    name="image"
                    accept="image/*"
                    action="/uploads/uploadImageForStory"
                >
                <div className="card story-image">
                    <h3>Tạo tin ảnh</h3>
                </div>
                </Upload>
                <div className="card story-word">
                    <h3>Tạo tin văn bản</h3>
                </div>
                </>
                :
                <div className='frame-view-image-story-upload'>
                    <p className='title'>Xem trước</p>
                    <div className='wrapper-img'>
                    <Image className='image' src={pathImage}/>
                    </div>
                </div>
                }
            </Col>
            </Row>
        </div>
    )
}

export default CreateStory;