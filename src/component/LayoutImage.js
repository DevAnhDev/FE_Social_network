import React ,{useState,memo} from 'react';
import {Row,Col,Modal} from 'antd';
import ImageGallery from 'react-image-gallery';
import Image from './CustomImageAntd'
function LayoutImage ({arr_img}){
    const [showImage, setshowImage] = useState(false);
    let images = [];
    arr_img.map(e=>{
        images.push({original:e.url,thumbnail:e.url})
    })
    return(
        <div>
            <Modal
                visible={showImage}
                onCancel={()=>setshowImage(false)}
                cancelText="Thoát"
                onOk={()=>setshowImage(false)}
                closable={false}
            >
                <ImageGallery items={images} />
            </Modal>
            {arr_img.length===1&&
                <Image className="imgPost" src={arr_img[0].url} alt="img"/>
            }
            {arr_img.length===2&&
                <div className="layputImage2" style={{ display:'flex',flexDirection:'row' }}>
                    <Image className="imgPost" src={arr_img[0].url} alt="img"/>
                    <Image className="imgPost" src={arr_img[1].url} alt="img"/>
                </div>
            }
            {arr_img.length===3&&
            <div className="layputImage3" style={{display:'flex', flexDirection:'row' }}>
                <div style={{ marginRight:10 }}>
                    <Image className="imgPost" src={arr_img[0].url} alt="img"/>
                    <div style={{width:"100%",height:5}}/>
                    <Image className="imgPost" src={arr_img[1].url} alt="img"/>
                </div>
                <Image className="imgPost" src={arr_img[2].url} alt="img"/>
            </div>
            }
            {arr_img.length===4&&
            <div className="layputImage4" style={{display:'flex', flexDirection:'row' }}>
            <Row>
               <Col span={12}>
                   <Image className="imgPost" src={arr_img[0].url} alt="img"/>
                   <div style={{width:"100%",height:5}}/>
                   <Image className="imgPost" src={arr_img[1].url} alt="img"/>
               </Col>
                <Col span={12} >
                    <Image className="imgPost" src={arr_img[2].url} alt="img"/>
                    <div style={{width:"100%",height:5}}/>
                    <Image className="imgPost" src={arr_img[3].url} alt="img"/>
               </Col>
            </Row>
            </div>
            }
            {arr_img.length>4&&
            <div className="layputImage5" style={{display:'flex', flexDirection:'row' }}>
            <Row>
               <Col span={12}>
                   <Image className="imgPost" src={arr_img[0].url} alt="img"/>
                   <div style={{width:"100%",height:5}}/>
                   <Image className="imgPost" src={arr_img[1].url} alt="img"/>
               </Col>
                <Col span={12} >
                    <Image className="imgPost" src={arr_img[2].url} alt="img"/>
                    <div style={{width:"100%",height:5}}/>
                    <div className="darkNessImgLast" onClick={()=>setshowImage(true)}>
                        <Image className="imgPost" src={arr_img[3].url} alt="img" preview={false}/>
                        <h2>{`+ ${arr_img.length-4}`}</h2>
                    </div>
               </Col>
            </Row>
            </div>
            }
        </div>
    )
}

export default memo(LayoutImage);