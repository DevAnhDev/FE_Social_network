import * as FetchAPI from './fetchAPI';
import {updateUser,updateFollowers,updateFollowings} from '../redux/reducers/user.reducer';
import {message} from 'antd';
export const checkAuth = async(dispatch)=>{
    try {
        const token = await localStorage.getItem("token");
        if(token===null||token===undefined){
            return false;
        }
        const data = {"token":token};
        const res = await FetchAPI.postDataAPI("/user/getUser",data);
        if(res.msg){
            if(res.msg.message ==="jwt expired"){
                message.warning("Phiên đăng nhập của bạn đã hết hạn !")
                localStorage.removeItem("token");
                return false;
            }
        }else{
            if(res[0].status===1){
                localStorage.removeItem("token");
                return "block";
            }else{
                const followers = await FetchAPI.postDataAPI("/user/getFollowers",{"idUser":res[0].idUser});
                const followings = await FetchAPI.postDataAPI("/user/getFollowings",{"idUser":res[0].idUser});
                dispatch(updateFollowers(followers.msg));
                dispatch(updateFollowings(followings.msg));
                dispatch(updateUser(res[0]));
                return true  
            }
        }
    } catch (error) {
        console.log(error);
        return false;
    }
   
    
}