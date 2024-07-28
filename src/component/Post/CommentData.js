import React, { useState,useEffect } from 'react';
import { timeAgo } from '../../utils/timeAgo';
import { deCode } from '../../utils/crypto';
import avatarDefault from '../../assets/logo/avatar.jpg'

export default function CommentData({dataComment,currentUser,id}){
    const [currentTime,setcurrentTime] = useState(new Date())

    useEffect(() => {
        const interval = setInterval(()=>{
            setcurrentTime(new Date());
        },1000)
        return () => clearInterval(interval);
    },[])

    return(
        <div className='wrapperComment'>
        {dataComment.map(e=>{
            if(e.idPost===id){
                if(e.data.length===0){
                    return(
                        <p style={{ color:'gray',textAlign:'center' }}>Bài đăng chưa có bình luận nào...</p>
                    )
                }else{
                    return(
                        e.data.map(z=>{
                            if(z.idUser===currentUser.idUser){
                                return(
                                <div className="comment">
                                    <div className="content">
                                        {z.avatar !== null ?<img className="avatar" src={z.avatar} />:
                                        <img className="avatar" src={avatarDefault} alt="avatar"/>
                                        }
                                        <span>{`${z.firstName} ${z.lastName}`}</span>
                                        <p>{deCode(z.comment)}</p>
                                    </div>
                                    <div className="time">
                                        {`${timeAgo(currentTime,z.create_at)}`}
                                    </div>
                                </div>
                                )
                            }else{
                                return(
                                    <div className="comment right-comment">
                                        <div className="content">
                                            {z.avatar !== null ?<img className="avatar" src={z.avatar} />:
                                            <img className="avatar" src={avatarDefault} alt="avatar"/>
                                            }
                                            <span>{`${z.firstName} ${z.lastName}`}</span>
                                            <p>{deCode(z.comment)}</p>
                                        </div>
                                        <div className="time">
                                            {`${timeAgo(currentTime,z.create_at)}`}
                                        </div>
                                    </div>
                                )
                            }
                        })
                    )
                }
            }
        })}
        </div>
    )
}