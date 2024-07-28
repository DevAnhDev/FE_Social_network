export const getAPI = async(url)=>{
    try {
        const res = await fetch(url)
        .then((response)=>response.json())
        .then((responseJson)=>{
            return responseJson;
        })
        .catch((err)=>{
            console.log(err)
        })
        return res;
    } catch (error) {
        
    }
   
}

export const postDataAPI = async(url,data)=>{
    try {
        const res = await fetch(url,{
            method:'POST',
            headers:{
                'Accept':'application/json',
                'Content-Type' :'application/json'
            },
            body: JSON.stringify(data)
        })
        .then((response)=>response.json())
        .then((responseJson)=>{
            return responseJson;
        }
        )
        .catch((err)=>{
          console.log(err)
        })
        return res;
    } catch (error) {
        
    }
   
}

export const dowloadFile = (url,nameFile)=>{
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };
    fetch(`${url}`, requestOptions)
    .then((res) => {
        return res.blob();
    })
    .then((blob) => {
        const href = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.setAttribute('download', nameFile); //or any other extension
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    })
    .catch((err) => {
        return Promise.reject({ Error: 'Something Went Wrong', err });
    })        
}