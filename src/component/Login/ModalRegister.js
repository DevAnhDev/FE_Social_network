import React, {useEffect,useState} from 'react';
import {Modal,Button,Form,Input,Row,Col,message} from 'antd';
import * as FetchAPI from '../../utils/fetchAPI';

function ModalRegister ({handleCancel,isModalVisible,hideStatusBtn,showStatusBtn,faceioInstance,handleError}){
    const [form_register] = Form.useForm();
    const [registerFace,setRegisterFace] = useState(false);
    const [responseUser,setResponseUser] = useState({})

    const faceRegistration = async () => {
        try {
            handleCancel()
            const dataPayload = {
                email: responseUser?.email,
                userId: responseUser?.idUser,
                username: responseUser?.username,
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
            const status_update = await FetchAPI.postDataAPI('/user/updateFaceId',{"idUser":responseUser?.idUser,"faceId":userInfo.facialId,action:"ADD"})
            if(status_update?.msg == "Success"){
                message.success("Bạn đã đăng ký thành công !!!");
                setTimeout(()=>{
                    window.location.reload();
                },1000)
            }
        } catch (errorCode) {
            console.log(errorCode)
            handleError(errorCode)
        }
    }

    const valueInit = {
        firstName:"",
        lastName:"",
        email:"",
        username:"",
        password:"",
        confirmPassword:""
    };

    const checkUserNameExist = async(_,value)=>{
        const data = {"username":value}
        const res = await FetchAPI.postDataAPI("/user/checkUsername",data);
        if(res.msg){
            if(res.msg==="Continue register"){
                return Promise.resolve();
            }
            else{
                return Promise.reject(new Error('Tên đăng nhập đã tồn tại, vui lòng chọn tên khác  !'));
            }
        }
    }
    const checkEmailExist = async(_,value)=>{
        const data = {"email":value}
        const res = await FetchAPI.postDataAPI("/user/checkEmail",data);
        if(res.msg){
            if(res.msg==="Continue register"){
                return Promise.resolve();
            }
            else{
                return Promise.reject(new Error('Email đã tồn tại trong hệ thống !'));
            }
        }
    }
    const handleRegister = async()=>{
        showStatusBtn();
        const data = {data:form_register.getFieldsValue()};
        const res = await FetchAPI.postDataAPI("/user/register",data);
        if(res.msg){
            if(res.msg==="Success"){
                form_register.setFieldsValue(valueInit);
                hideStatusBtn();
                setRegisterFace(true);
                setResponseUser(res?.data)
                // handleCancel();
            }else{
                message.error("Có lỗi rồi !!!");
                hideStatusBtn();
                handleCancel();
            }
        }
    }

    const RegisterInformation = ()=> (
        <Form 
            form={form_register}
            onFinish={handleRegister}
        >
        <Row style={{display:'felx',flexDirection:'row' }}>
        <Col className="nameUser1" span={12} >
            <Form.Item
                name="firstName"
                rules={[{ required: true, message: 'Nhập họ của bạn!' }]}
            >
                <Input
                    placeholder="Họ"
                />
            </Form.Item>
        </Col>
        <Col className="nameUser2" span={12} >
            <Form.Item
                name="lastName"
                rules={[{ required: true, message: 'Nhập tên của bạn!' }]}
            >
                <Input 
                    placeholder="Tên"
                />
            </Form.Item>
        </Col>
        </Row>
            <Form.Item
                name="email"
                hasFeedback
                rules={[
                    { required: true, message: 'Vui lòng nhập email để đăng ký!' },
                    { type: 'email',message:"Vui lòng nhập đúng định dạng Email"},
                    { validator: checkEmailExist}
                ]}
            >
                <Input 
                    placeholder="Email"
                />
            </Form.Item>
            <Form.Item
                name="username"
                hasFeedback
                rules={[
                    { required: true, message: 'Vui lòng nhập tên đăng nhập để đăng ký!' },
                    { validator: checkUserNameExist}
                ]}
            >
                <Input
                    placeholder="Tên đăng nhập"
                />
            </Form.Item>
            <Form.Item
                name="password"
                rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu!' },
                    { min: 6,message:'Mật khẩu ít nhất 6 ký tự'}
                ]}
            >
                <Input.Password 
                    placeholder="Mật khẩu"
                />
            </Form.Item>
            <Form.Item
                name="confirmPassword"
                rules={[
                    { required: true, message: 'Hãy nhập lại mật khẩu!' },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                        }
                        return Promise.reject(new Error('Mật khẩu nhập lại phải đúng như trên!'));
                        },
                    }),
                ]}
            >
                <Input.Password
                    placeholder="Nhập lại mật khẩu"
                />
            </Form.Item>
            <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Đăng ký
                    </Button>
            </Form.Item>
        </Form>
    )

    const RegisterFace = ()=>(
        <div style={{minHeight:"40vh",justifyContent:'center',display:'flex',flexDirection:'column',alignItems:'center'}}>
            <Button type="primary" onClick={faceRegistration}>Đăng ký khuôn mặt</Button>
            <Button style={{marginTop:10}} onClick={()=>{handleCancel();message.success("Bạn đã đăng ký thành công !!!");}}>Bỏ qua</Button>
        </div>
    )
    return(
        <Modal
            className="modalRegister"
            title="Đăng ký tài khoản Space Social" 
            visible={isModalVisible} 
            onCancel={handleCancel}
            footer={null}
        >
            {registerFace ? 
                <RegisterFace />
                :
                <RegisterInformation/>
            }
      </Modal>
    )
}

export default ModalRegister;