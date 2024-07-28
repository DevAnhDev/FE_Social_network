import React from 'react';
import { Routes,Route,useNavigate,useLocation} from 'react-router-dom';
import CreateStory from '../component/Story/CreateStory';

function Story(){
    return(
        <div>
            <Routes>
                <Route path="/" element={<CreateStory/>} />
                <Route path="/create" element={<CreateStory/>} />
            </Routes>
        </div>
    )
}

export default Story;