import React , {useEffect,useState} from 'react';
import * as FetchAPI from '../../utils/fetchAPI';
import {List} from 'antd';
import Image from '../CustomImageAntd'
function ImagePageProfile({idUser}){
    const [listImage, setlistImage] = useState([]);
    const [loadingList, setloadingList] = useState(false);
    useEffect(() => {
        setloadingList(true);
        getImage();
    },[idUser])
    const getImage = async()=>{
        const res = await FetchAPI.postDataAPI("/user/getImagePosted",{"idUser":idUser});
        if(res.msg){
            setlistImage(res.msg)
            setloadingList(false);
        }
    }
    return(
        <div style={{ padding:10 }}> 
        <h3>Ảnh</h3>
        <List 
            dataSource={listImage}
            loading={loadingList}
            grid={{
                gutter: 16,
                xs: 1,
                sm: 2,
                md: 4,
                lg: 4,
                xl: 4,
                xxl: 6,
            }}
            renderItem={item => (
                <List.Item>
                    <Image src={item.url}/>
                </List.Item>
            )}
        />
    </div>
    )
}

export default ImagePageProfile;