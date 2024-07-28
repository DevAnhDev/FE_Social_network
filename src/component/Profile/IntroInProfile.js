import React from 'react';

function IntroInProfile({dataUser}){

    return(
        <div className='wrapperIntroAndProfile'>
            {dataUser.idUser!==undefined && 
                <>
                    {dataUser.intro===null||dataUser.intro==="" ?
                        <div className='wrapperIntro'>
                           <span>{`Hiện ${dataUser.firstName} ${dataUser.lastName} chưa có giới thiệu về bản thân.`}</span>
                        </div>
                        :
                        <div>
                            {dataUser.intro}
                        </div>
                    }
                    {dataUser.profile===null||dataUser.profile==="" ?
                        <div className='wrapperProfile'>
                            <span>{`Hiện ${dataUser.firstName} ${dataUser.lastName} chưa có thông tin chi tiết về bản thân.`}</span>
                        </div>
                        :
                        <div>
                            {dataUser.profile}
                        </div>
                    }
                </>
            }
        </div>
    )
}

export default IntroInProfile;