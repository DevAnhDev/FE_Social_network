import React, { useState,useEffect } from "react";
import { Button, Modal, message } from "antd";
import * as FetchAPI from '../../utils/fetchAPI'
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../../redux/reducers/user.reducer";

export default function SecurityProfile({idUser,currentUser}){
    const [isModalOpen, setIsModalOpen] = useState(false);
    const dispatch = useDispatch()
    const {faceioInstance} = useSelector(e=>e.FaceIOReducer);

    const faceRegistration = async () => {
        try {
            handleCancel()
            const dataPayload = {
                email: currentUser?.email,
                userId: currentUser?.idUser,
                username: currentUser?.username,
            }
            console.log(dataPayload);
            const userInfo = await faceioInstance.enroll({
                locale: "auto",
                payload: dataPayload,
            })
            console.log(userInfo)
            console.log('Unique Facial ID: ', userInfo.facialId)
            console.log('Enrollment Date: ', userInfo.timestamp)
            console.log('Gender: ', userInfo.details.gender)
            console.log('Age Approximation: ', userInfo.details.age)
            const status_update = await FetchAPI.postDataAPI('/user/updateFaceId',{"idUser":currentUser?.idUser,"faceId":userInfo.facialId,action:"ADD"})
            if(status_update?.msg == "Success"){
                message.success("Bạn đã đăng ký đăng nhập khuôn mặt thành công !!!");
                setTimeout(()=>{
                    window.location.reload();
                },1000)
            }
        } catch (errorCode) {
            console.log(errorCode)
            handleError(errorCode)
        }
    }

    const deleteFace = async ()=>{
        try {
          const status_update = await FetchAPI.postDataAPI('/user/updateFaceId',{"idUser":currentUser?.idUser,"faceId":currentUser?.faceId,action:"DELETE"})
          if(status_update?.msg == "Success"){
            dispatch(updateUser({...currentUser,faceId:null}))
            message.success("Gỡ bỏ đăng nhập bằng khuôn mặt thành công !")
          }
        } catch (error) {
          console.log(error);
        }
    }
    
    const handleError = (errCode) => {
        // Log all possible error codes during user interaction..
        // Refer to: https://faceio.net/integration-guide#error-codes
        // for a detailed overview when these errors are triggered.
        const fioErrCode={PERMISSION_REFUSED:1,NO_FACES_DETECTED:2,UNRECOGNIZED_FACE:3,MANY_FACES:4,PAD_ATTACK:5,FACE_MISMATCH:6,NETWORK_IO:7,WRONG_PIN_CODE:8,PROCESSING_ERR:9,UNAUTHORIZED:10,TERMS_NOT_ACCEPTED:11,UI_NOT_READY:12,SESSION_EXPIRED:13,TIMEOUT:14,TOO_MANY_REQUESTS:15,EMPTY_ORIGIN:16,FORBIDDDEN_ORIGIN:17,FORBIDDDEN_COUNTRY:18,UNIQUE_PIN_REQUIRED:19,SESSION_IN_PROGRESS:20},fioState={UI_READY:1,PERM_WAIT:2,PERM_REFUSED:3,PERM_GRANTED:4,REPLY_WAIT:5,PERM_PIN_WAIT:6,AUTH_FAILURE:7,AUTH_SUCCESS:8}
        switch (errCode) {
          case fioErrCode.PERMISSION_REFUSED:
            console.log("Access to the Camera stream was denied by the end user")
            break
          case fioErrCode.NO_FACES_DETECTED:
            console.log("No faces were detected during the enroll or authentication process")
            break
          case fioErrCode.UNRECOGNIZED_FACE:
            console.log("Unrecognized face on this application's Facial Index")
            break
          case fioErrCode.MANY_FACES:
            console.log("Two or more faces were detected during the scan process")
            break
          case fioErrCode.PAD_ATTACK:
            console.log("Presentation (Spoof) Attack (PAD) detected during the scan process")
            break
          case fioErrCode.FACE_MISMATCH:
            console.log("Calculated Facial Vectors of the user being enrolled do not matches")
            break
          case fioErrCode.WRONG_PIN_CODE:
            console.log("Wrong PIN code supplied by the user being authenticated")
            break
          case fioErrCode.PROCESSING_ERR:
            console.log("Server side error")
            break
          case fioErrCode.UNAUTHORIZED:
            console.log("Your application is not allowed to perform the requested operation (eg. Invalid ID, Blocked, Paused, etc.). Refer to the FACEIO Console for additional information")
            break
          case fioErrCode.TERMS_NOT_ACCEPTED:
            console.log("Terms & Conditions set out by FACEIO/host application rejected by the end user")
            break
          case fioErrCode.UI_NOT_READY:
            console.log("The FACEIO Widget code could not be (or is being) injected onto the client DOM")
            break
          case fioErrCode.SESSION_EXPIRED:
            console.log("Client session expired. The first promise was already fulfilled but the host application failed to act accordingly")
            break
          case fioErrCode.TIMEOUT:
            console.log("Ongoing operation timed out (eg, Camera access permission, ToS accept delay, Face not yet detected, Server Reply, etc.)")
            break
          case fioErrCode.TOO_MANY_REQUESTS:
            console.log("Widget instantiation requests exceeded for freemium applications. Does not apply for upgraded applications")
            break
          case fioErrCode.EMPTY_ORIGIN:
            console.log("Origin or Referer HTTP request header is empty or missing")
            break
          case fioErrCode.FORBIDDDEN_ORIGIN:
            console.log("Domain origin is forbidden from instantiating fio.js")
            break
          case fioErrCode.FORBIDDDEN_COUNTRY:
            console.log("Country ISO-3166-1 Code is forbidden from instantiating fio.js")
            break
          case fioErrCode.SESSION_IN_PROGRESS:
            console.log("Another authentication or enrollment session is in progress")
            break
          case fioErrCode.NETWORK_IO:
          default:
            console.log("Error while establishing network connection with the target FACEIO processing node")
            break
        }
    }
    const showModal = () => {
        setIsModalOpen(true);
    };
    
    const handleOk = () => {
        console.log("zo");
        deleteFace()
        setIsModalOpen(false);
    };
    
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const ModalConfirm = ()=> (
        <Modal
            title="Gỡ bỏ đăng nhập bằng khuôn mặt" 
            visible={isModalOpen} 
            onOk={handleOk}
            onCancel={handleCancel}
            footer={[
                <Button key="back" onClick={handleCancel}>
                  Để sau
                </Button>,
                <Button key="submit" type="primary" onClick={handleOk}>
                  Đồng ý
                </Button>,
            ]}
        >
            <h3>Bạn có chắc chắn muốn gỡ đăng nhập bằng khuôn mặt</h3>
        </Modal>
    )

    return(
        <div style={{paddingLeft:10}}>
            <ModalConfirm />
            {currentUser?.faceId == null ?
            <div style={{display:'flex',justifyContent:'center',alignItems:'center',flexDirection:'column'}}>
            <h3>Bạn chưa đăng ký nhận diện khuôn mặt để đăng nhập</h3>
            <Button onClick={faceRegistration} type="primary">Đăng ký ngay</Button>
            </div>
            :
            <div style={{display:'flex',justifyContent:'center',alignItems:'center',flexDirection:'column'}}>
            <h3>Tài khoản của bạn đã được đăng ký đăng nhập bằng khuôn mặt.</h3>
            <Button type="primary" onClick={showModal} danger>Gỡ bỏ</Button>
            </div>
            }
        </div>
    )
}