import React, { useState, useEffect } from 'react'

function CallTime({ times }) {

    const [mins, setMins] = useState(0)
    const [second, setSecond] = useState(0)
    const [hour, setHour] = useState(0)

    useEffect(() => {
        
        setSecond(times % 60);
        setMins(Math.floor(times / 60) % 60);
        setHour(Math.floor(times / 3600)% 24);
        
    }, [times])

    return <div className="time">
        <span>
            {hour.toString().length < 2 ? '0' + hour : hour} Giờ :&nbsp;
        </span>
        <span>
            {mins.toString().length < 2 ? '0' + mins : mins} Phút :&nbsp;
        </span>
        <span>
            {second.toString().length < 2 ? '0' + second : second} Giây
        </span>
    </div>
}

export default CallTime