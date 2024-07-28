import React ,{memo,useEffect} from 'react';
import { Tabs } from 'antd';
import FindFriend from '../component/Friend/FindFriend';
import AddFriendSent from '../component/Friend/AddFriendSent';
import RequestAddFriend from '../component/Friend/RequestAddFriend';
import FullFriend from '../component/Friend/FullFriend';
const { TabPane } = Tabs;

function Friend({socket}){

    useEffect(() => {
        document.title="Bạn bè | Space Social"
        window.scroll(0,0);
    },[])
    function callback(key) {
        console.log(key);
    }

    return(
        <div className="wrapperFriend">
            <Tabs defaultActiveKey="1" onChange={callback}>
                <TabPane tab="Tất cả" key="1">
                    <h3>Xác nhận kết bạn</h3>
                    <RequestAddFriend socket={socket}/>
                    <FindFriend socket={socket}/>
                </TabPane>
                <TabPane tab="Lời mời kết bạn" key="2">
                    <RequestAddFriend socket={socket}/>
                </TabPane>
                <TabPane tab="Lời mời đã gửi" key="3">
                    <AddFriendSent socket={socket}/>
                </TabPane>
                <TabPane tab="Tất cả bạn bè" key="4">
                    <FullFriend socket={socket}/>
                </TabPane>
                <TabPane tab="Tìm bạn bè" key="5">
                    <FindFriend socket={socket}/>
                </TabPane>
            </Tabs>
        </div>
    )
}

export default memo(Friend)