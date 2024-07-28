/* eslint-disable no-undef */
import React ,{useEffect,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Row,Col,Form,Input,Button,message} from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import {ModalRegister} from '../component';
import * as FetchAPI from '../utils/fetchAPI';
import logo from '../assets/logo/logo_space.png';
import { useSelector } from 'react-redux';
function Login ({user,confirmUser}){
    const [statusBtn, setstatusBtn] = useState(false);
    const [visibleModal, setvisibleModal] = useState(false);
    const handleCloseModal = ()=>setvisibleModal(false);
    const navigate = useNavigate();
    const [form_login] = Form.useForm();
    const handleHideLoadBtn = ()=>setstatusBtn(false);
    const handleShowLoadBtn = ()=>setstatusBtn(true);
    const {faceioInstance} = useSelector(e=>e.FaceIOReducer)

    const faceSignIn = async () => {
        try {
            // const logo = document.getElementsByClassName("fio-ui-modal__header")
            // console.log(logo); 
            const userData = await faceioInstance.authenticate({
            locale: "auto",
            })
            console.log(userData)
            console.log('Unique Facial ID: ', userData.facialId)
            console.log('PayLoad: ', userData.payload)
            const data = {"idUser":userData.payload?.userId}
            console.log(data);
            const res = await FetchAPI.postDataAPI("/user/loginface",data);
            if(res.msg){
            if(res.msg==="Success"){
                setTimeout(()=>{
                    message.success("Đăng nhập thành công");
                    localStorage.setItem("token",res.token);
                    navigate("/");
                    confirmUser();
                    // setTimeout(()=>{
                    //     window.location.reload();
                    // },1000)
                },2000);
            }
        }
        } catch (errorCode) {
            console.log(errorCode)
            handleError(errorCode)
        }
    }

    useEffect(()=>{
        document.title="Đăng nhập | Space Social"
        if(user){
            navigate("/")
        }
    },[])

    const handleLogin = async()=>{
        handleShowLoadBtn();
        const data = {data:form_login.getFieldsValue()};
        const res = await FetchAPI.postDataAPI("/user/login",data);
        if(res.msg){
            if(res.msg==="Invalid account"){
                message.error("Tài khoản không tồn tại");
            }else if(res.msg==="Incorrect password"){
                message.error("Mật khẩu chưa đúng");
            }else if(res.msg==="Success"){
                message.success("Đăng nhập thành công");
                localStorage.setItem("token",res.token);
                navigate("/");
                confirmUser();
            }
            handleHideLoadBtn();
        }else{
            handleHideLoadBtn();
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
    return(
        <div className="wrapperLogin">
            <ModalRegister 
                isModalVisible={visibleModal} 
                handleCancel={handleCloseModal}
                statusBtn={statusBtn}
                hideStatusBtn={handleHideLoadBtn}
                showStatusBtn={handleShowLoadBtn}
                faceioInstance={faceioInstance}
                handleError={handleError}
            />
            <Row style={{display:'felx',justifyContent:'center'}}>
                <Col className="Left" xl={12} md={8} sm={0} xs={0}>
                    <img src={logo} className="logo_left" alt="logo"/>
                    <p className="title">SPACE SOCIAL</p>
                    <p style={{ textAlign:'center' }}>
                        Kết nối và chia sẻ với mọi người trong cuộc sống của bạn dù ở nơi đâu.
                    </p>
                </Col>
                <Col className="Right" xl={12} md={16} sm={24} xs={24}>
                <Form
                    form={form_login}
                    name="normal_login"
                    className="login-form"
                    initialValues={{ remember: true }}
                    onFinish={handleLogin}
                >
                    <h1>Đăng nhập</h1>
                    <Form.Item
                        label="Tên đăng nhập"
                        name="username"
                        rules={[{ required: true, message: 'Vui lòng điền tên đăng nhập!' }]}
                    >
                        <Input 
                            prefix={<UserOutlined className="site-form-item-icon" />} 
                            placeholder="Tên đăng nhập"
                            style={{ width:350,borderRadius:20 }}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Mật khẩu"
                        name="password"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu!' },
                            {min:6,message:'Mật khẩu ít nhất 6 ký tự'}
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="site-form-item-icon" />}
                            type="password"
                            placeholder="Nhập mật khẩu"
                            style={{ width:350,borderRadius:20 }}
                        />
                    </Form.Item>
                    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                        <Button type="primary" htmlType="submit" loading={statusBtn}>
                            Đăng nhập
                        </Button>
                    </Form.Item>
                    <span style={{color:'blue',cursor:'pointer'}} onClick={faceSignIn}>Đăng nhập bằng khuôn mặt.</span><br/>
                    <span>Bạn chưa có tài khoản? <a onClick={()=>setvisibleModal(true)}>Đăng ký ngay.</a></span>
                </Form>
                </Col>
           </Row>
        </div>
    )
};

export default Login;