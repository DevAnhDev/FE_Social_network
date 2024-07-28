import React ,{useEffect,useState,memo,useRef} from 'react';
import {LikeOutlined,CommentOutlined,ShareAltOutlined,LoadingOutlined,SmileOutlined} from '@ant-design/icons';
import {Dropdown,Input,Button,Menu,notification} from 'antd';
import moment from 'moment';
import avatarDefault from '../assets/logo/avatar.jpg'
import {updateListLike,updatePostShowingLike} from '../redux/reducers/post.reducer';
import {useDispatch,useSelector} from 'react-redux';
import * as FetchAPI from '../utils/fetchAPI';
import {updateDataComment} from '../redux/reducers/post.reducer';
import {endCode} from '../utils/crypto';
import Picker, { SKIN_TONE_MEDIUM_DARK } from 'emoji-picker-react';
import LayoutImage from './LayoutImage';
import {like,love,haha,wow,sad,angry} from '../assets/images'
import CommentData from './Post/CommentData';
import { useNavigate } from 'react-router-dom';
// const mobilenet = require('@tensorflow-models/mobilenet')

function PostScreen ({item,socket,showModalLike,currentUser}){
    const dispatch = useDispatch();
    const {dataComment} = useSelector(e=>e.PostReducer);
    const [showComment, setshowComment] = useState(false);
    const [loadingComment, setloadingComment] = useState(false);
    const [text, setText] = useState("");
    const [showEmoji, setshowEmoji] = useState(false);
    const [showFullText, setshowFullText] = useState(false);
    const [listSuggestionComment,setlistSuggestionComment] = useState([]);
    const navigate = useNavigate();
    const pickerEmojiRef = useRef();

    useEffect(()=>{
        if( item.arr_img?.length > 0 ) {
            let list_tmp = []
            item.arr_img.forEach(item=>{
                if(item.suggestionComment != null){
                    const suggestion = JSON.parse(item.suggestionComment);
                    list_tmp = list_tmp.concat(suggestion)
                }
            })
            setlistSuggestionComment(list_tmp)
        }
    },[item.arr_img])
    //click outside for picker emoji
    useEffect(() => {
        if(pickerEmojiRef.current!==undefined&&pickerEmojiRef.current!== null){
            document.addEventListener('mousedown', clickOutside);
        }
        // clean up function before running new effect
        return () => {
            document.removeEventListener('mousedown', clickOutside);
        }
    }, [pickerEmojiRef.current])

    const clickOutside = (e)=>{
        if(pickerEmojiRef.current!==null){
            if(pickerEmojiRef.current.contains(e.target)) {
                // inside click
                return;
            }
        }
        setshowEmoji(false);
    }

    const onEmojiClick = (_,emojiObject) => {
      let string = text;
      string += emojiObject.emoji;
      setText(string);
    };

    const handleLike = async(id)=>{
        const data = {"idPost":id,"idUser":currentUser.idUser,"emotion":1};
        const res = await FetchAPI.postDataAPI("/post/likePost",data);
        if(res.msg){
            if(res.msg==="Success"){
                socket.emit("likePost",{
                    id:id,
                    idUser:currentUser.idUser,
                    firstName:currentUser.firstName,
                    lastName: currentUser.lastName,
                    avatar: currentUser.avatar,
                    emotion:1,
                    plusLike:item.statusLike===null||item.statusLike===0
                })
            }
        }
    }

    const handleEmotion = async(id,type)=>{
        const data = {"idPost":id,"idUser":currentUser.idUser,"emotion":type};
        if(type!==item.statusLike){
            const res = await FetchAPI.postDataAPI("/post/likePost",data);
            if(res.msg){
                if(res.msg==="Success"){
                    socket.emit("likePost",{
                        id:id,
                        idUser:currentUser.idUser,
                        firstName:currentUser.firstName,
                        lastName: currentUser.lastName,
                        avatar: currentUser.avatar,
                        emotion:type,
                        plusLike:item.statusLike===null||item.statusLike===0
                    })
                }
            }
        }else{
            handleUnlike(id)
        }
    }

    const handleUnlike = async(id)=>{
        const data = {"idPost":id,"idUser":currentUser.idUser};
        const res = await FetchAPI.postDataAPI("/post/unlikePost",data);
        if(res.msg){
            if(res.msg==="Success"){
                socket.emit("unlikePost",{
                    id:id,
                    idUser:currentUser.idUser,
                    firstName:currentUser.firstName,
                    lastName: currentUser.lastName,
                    avatar: currentUser.avatar,
                })
            }
        }
    }

    const handleShowLike = async()=>{
        const data = {"idPost":item.id};
        const res = await FetchAPI.postDataAPI("/post/getListLike",data)
        if(res.msg){
            dispatch(updatePostShowingLike(item.id))
            dispatch(updateListLike(res.msg));
            showModalLike();
        }
    }

    const handleShowCommnet = async(id)=>{
        setshowComment(!showComment);
        setloadingComment(true);
        if(!showComment){
            const data = {"idPost":id}
            const res = await FetchAPI.postDataAPI("/post/getCommentByIdPost",data);
            if(res.msg){
                let currentData = JSON.parse(JSON.stringify(dataComment));
                const check = currentData.findIndex(e=>e.idPost===id);
                if(check!==-1){
                    currentData.splice(check,1);
                }
                const arr = {"idPost":id,"data":res.msg};
                currentData.push(arr);
                dispatch(updateDataComment(currentData));
                setloadingComment(false);
            }
        }else{
            let currentData = JSON.parse(JSON.stringify(dataComment));
            const index = currentData.findIndex(e=>e.idPost===id);
            if(index!==-1){
                currentData.splice(index,1);
                dispatch(updateDataComment(currentData));
            }
        }
    }

    const postComment = async(comment=null)=>{
        if(comment == null){
            if (text !== "") {
                const encode_text = endCode(text);
                const data = {"idUser":currentUser.idUser,"idPost":item.id,"text":encode_text,"typeComment":0};
                const res = await FetchAPI.postDataAPI("/post/addComment",data);
                if(res.msg){
                    if(res.msg==="Success"){
                        socket.emit("comment", {"text":encode_text,"idPost":item.id,"typeComment":0});
                        setText("");
                        setshowEmoji(false);
                    }
                }
            }
        }else{
            const encode_text = endCode(comment);
            const data = {"idUser":currentUser.idUser,"idPost":item.id,"text":encode_text,"typeComment":0};
            const res = await FetchAPI.postDataAPI("/post/addComment",data);
            if(res.msg){
                if(res.msg==="Success"){
                    socket.emit("comment", {"text":encode_text,"idPost":item.id,"typeComment":0});
                    setshowEmoji(false);
                }
            }
        }
    }
    
    const truncateText = (text)=>{
        if(text.length>200){
            return(
                <div style={{ marginBottom:10 }}>
                    <p>
                        {showFullText ? 
                            text
                        :
                            text.substring(0,200) + "..."
                        }
                    </p>
                    <a onClick={()=>setshowFullText(!showFullText)}>
                        {showFullText ?
                        "Ẩn bớt"
                        :
                        "Xem thêm"
                        }
                    </a>
                </div>
            )
        }else{
            return(
                <p>{text}</p>
            )
        }
    }

    const openNotification = (placement,description,type) => {
        notification[type]({
          message: `Chia sẻ bài viết`,
          description:description,
          placement,
        });
      };

    const handleSharePost = async() => {
        if(currentUser.idUser === item.idUser){
            openNotification('bottomRight',"Bạn không thể chia sẻ bài viết của chính mình !","warning")
        }else{
            const data = {
                idUser: currentUser.idUser,
                idPost: item.id,
                feelingPost: null,
                type: 0
            }
            const res = await FetchAPI.postDataAPI("/post/sharePost",data);
            if(res?.msg === "Success"){
                openNotification('bottomRight',"Bài viết đã được đăng lên tường của bạn.","success")
            }else if(res?.msg === "shared"){
                openNotification('bottomRight',"Bài viết này bạn đã chia sẻ rồi.","warning")
            }
        }
    }
    const MenuShare = (
        <Menu>
        <Menu.Item>
          <a target="_blank" rel="noopener noreferrer" onClick={handleSharePost}>
            Chia sẻ về trang cá nhân
          </a>
        </Menu.Item>
      </Menu>
    )

    const menuEmotion = (
        <div className='wrapperEmotion'>
            <img src={like} onClick={()=>handleEmotion(item.id,1)} className={item.statusLike===1?"emotion active":"emotion"}/>
            <img src={love} onClick={()=>handleEmotion(item.id,2)} className={item.statusLike===2?"emotion active":"emotion"}/>
            <img src={haha} onClick={()=>handleEmotion(item.id,3)} className={item.statusLike===3?"emotion active":"emotion"}/>
            <img src={sad} onClick={()=>handleEmotion(item.id,4)} className={item.statusLike===4?"emotion active":"emotion"}/>
            <img src={wow} onClick={()=>handleEmotion(item.id,5)} className={item.statusLike===5?"emotion active":"emotion"}/>
            <img src={angry} onClick={()=>handleEmotion(item.id,6)} className={item.statusLike===6?"emotion active":"emotion"}/>
        </div>
    )
    return(
        <div className="wrapperPost">
            <div className="user">
                {item.avatar!==null ?
                    <img onClick={()=>navigate(`/profile/${item.idUser}`)} className="avatar" src={item.avatar} alt="avatar"/>
                    :
                    <img onClick={()=>navigate(`/profile/${item.idUser}`)} className="avatar" src={avatarDefault} />
                }
                <div className="bottom">
                    <p className="name">{`${item.firstName} ${item.lastName}`}</p>
                    <p>{`Đăng ${moment(item.create_at).fromNow()}`}</p>
                </div>
            </div>
            <div className="contentPost">
                {truncateText(item.message)}
                <LayoutImage arr_img={item.arr_img}/>
                {/* <Image className="imgPost" src={item.image_description} alt="img"/> */}
            </div>
            <div className="resultPost">
                <span 
                    className="result_like" 
                    onClick={handleShowLike}
                >
                        {`${item.numberEmotion===null ? 0:item.numberEmotion} tương tác`}
                </span>
                <span>{`${item.numberComment===null ? 0:item.numberComment} bình luận`}</span>
            </div>
            <div className="actionWithPost">
                <Dropdown 
                    overlay={menuEmotion} 
                    placement="topLeft" 
                    arrow={{ pointAtCenter: true }}
                    loading={2}
                >
                {item.statusLike===0||item.statusLike===null ?
                    <div className="like" onClick={()=>handleLike(item.id)}>
                        <LikeOutlined /> <span>Thích</span>
                    </div>
                :
                    <div className="liked" onClick={()=>handleUnlike(item.id)}>
                        {item.statusLike===1 &&
                        <>
                            <LikeOutlined /> <span className='like'>Đã thích</span>
                        </>
                        }
                        {item.statusLike===2 &&
                        <>
                            <img src={love} width={25} height={25}/> <span className='love'>Yêu thương</span>
                        </>
                        }
                        {item.statusLike===3 &&
                        <>
                            <img src={haha} width={25} height={25}/> <span className='haha'>Ha ha</span>
                        </>
                        }
                        {item.statusLike===4 &&
                        <>
                            <img src={sad} width={25} height={25}/> <span className='sad'>Buồn</span>
                        </>
                        }
                        {item.statusLike===5 &&
                        <>
                            <img src={wow} width={25} height={25}/> <span className='wow'>Bất ngờ</span>
                        </>
                        }
                        {item.statusLike===6 &&
                        <>
                            <img src={angry} width={25} height={25}/> <span className='angry'>Tức giận</span>
                        </>
                        }
                    </div>
                }
                </Dropdown>
              
                <div className="comment" onClick={()=>handleShowCommnet(item.id)}>
                    <CommentOutlined /> <span>Bình luận</span>
                </div>
                <Dropdown overlay={MenuShare} placement="bottomRight" arrow={{ pointAtCenter: true }} >
                <div className="share">
                    <ShareAltOutlined /> <span>Chia sẻ</span>

                </div>
                </Dropdown>
            </div>
            {showComment && 
            <div className="actionComment">
                <div className="writeComment">
                {currentUser.avatar!==null ?
                    <img className="avatar" src={currentUser.avatar} alt="avatar"/>
                    :
                    <img className="avatar" src={avatarDefault} />
                }
                <Input 
                    className="commnetInput" 
                    placeholder="Viết bình luận của bạn ..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === "Enter") {
                            postComment();
                        }
                    }}
                />
                {showEmoji &&
                <div ref={pickerEmojiRef} className="wrapperEmoji">
                    <Picker
                        onEmojiClick={onEmojiClick}
                        disableAutoFocus={true}
                        skinTone={SKIN_TONE_MEDIUM_DARK}
                        groupNames={{ smileys_people: 'PEOPLE' }}
                        native
                    />
                </div>
                }
                <Button className="btn_emoji" onClick={()=>setshowEmoji(!showEmoji)}>
                    <SmileOutlined />
                </Button>
                </div>
                {listSuggestionComment.length > 0 &&
                <div style={{display:'flex',flexDirection:'row',flexWrap:'wrap',paddingBlock:5,gap:10,justifyContent:'center',paddingInline:20}}>
                    {listSuggestionComment.map(suggest_comment => 
                        <div 
                            style={{
                                marginInline:10,
                                borderRadius:10,
                                borderWidth:.5,
                                borderColor:'gray',
                                borderStyle:'solid',
                                cursor:'pointer',
                                paddingInline:5
                            }}
                            onClick={()=>postComment(suggest_comment)}
                        >
                            <span>{suggest_comment}</span>
                        </div>
                    ) 
                    }
                </div>
                }
                <>
                {loadingComment ? 
                <div className="loading">
                    <LoadingOutlined />
                </div>
                :
                <div style={{width:'100%'}}>
                    <CommentData dataComment={dataComment} currentUser={currentUser} id={item.id}/>
                </div>
                }
                </>
              
            </div>
            }
           
        </div>
    )
}

export default memo(PostScreen);