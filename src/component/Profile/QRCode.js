import React from 'react';
import QRCode from "react-qr-code";

function QRCodeComponent ({idUser}){
    return(
        <div style={{ display:'flex', justifyContent:'center',alignItems:'center',marginTop:20}}>
            <QRCode value={JSON.stringify({ "idUser":idUser,type:"space_social" })} />
        </div>
    )
}

export default QRCodeComponent;