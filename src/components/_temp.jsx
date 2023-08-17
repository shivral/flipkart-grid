import React, { useContext, useState } from 'react'
import Img from "../img/img.png"
import Attach from "../img/attach.png"
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';
import { Timestamp, arrayUnion, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { v4 as uuid } from "uuid";
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
const API_TOKEN = process.env.REACT_APP_HUGGING_FACE_API_TOKEN;
const Input = () => {
    const [text, setText] = useState("");
    const [img, setImg] = useState(null);
    const[output,setOutput]=useState(null);
    const { currentUser } = useContext(AuthContext);
    const { data } = useContext(ChatContext);
    

    const handleSend = async () => {
        // if (img) {

        //     try {
        //         const x = uuid();
        //         const date = new Date().getTime();
        //         const storageRef = ref(storage, `${x + date}`);
        //         console.log(storageRef);
        //         const uploadTask = uploadBytesResumable(storageRef, img);

        //         uploadTask.on('state_changed',
        //             (snapshot) => {
        //                 // Observe state change events such as progress, pause, and resume
        //                 // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        //                 const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        //                 console.log('Upload is ' + progress + '% done');
        //                 switch (snapshot.state) {
        //                     case 'paused':
        //                         console.log('Upload is paused');
        //                         break;
        //                     case 'running':
        //                         console.log('Upload is running');
        //                         break;
        //                 }
        //             },
        //             (error) => {

        //                 //setErr(true);
        //             },
        //             () => {
        //                 console.log(uploadTask);
        //                 getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
        //                     console.log(downloadURL);
        //                     await updateDoc(doc(db, "chats", data.chatId), {
        //                         messages: arrayUnion({
        //                             id: uuid(),
        //                             text,
        //                             senderId: currentUser.uid,
        //                             date: Timestamp.now(),
        //                             img: downloadURL,
        //                         }),
        //                     });
        //                 });
        //             }
        //         );
        //     } catch (err) {

        //     }
        //     setImg(null);

        // } 
        // else {
            try{
            console.log(API_TOKEN)
            const response = await fetch(
                "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_TOKEN}`,
                  },
                  body: JSON.stringify({ inputs: text }),
                }
              );
            console.log(response);
            const blob = await response.blob();
            handleImage(blob);
            setImg(URL.createObjectURL(blob));
            // console.log(blob,"ss");
            // await updateDoc(doc(db, "chats", data.chatId), {
            //     messages: arrayUnion({
            //         id: uuid(),
            //         text,
            //         senderId: currentUser.uid,
            //         date: Timestamp.now(),
            //     })
            // });
        // }

        await updateDoc(doc(db, "userChats", currentUser.uid), {
            [data.chatId + ".lastMessage"]: {
                text
            },
            [data.chatId + ".data"]: serverTimestamp()
        });

        await updateDoc(doc(db, "userChats", data.user.uid), {
            [data.chatId + ".lastMessage"]: {
                text
            },
            [data.chatId + ".data"]: serverTimestamp(),
        });
        setText("");
    }
    catch(error){
        
    }


    }

    const handleImage=async(img)=>{
        if (img) {
            console.log("sshere ",img)
            // setText("");

            try {
                const x = uuid();
                const date = new Date().getTime();
                const storageRef = ref(storage, `${x + date}`);
                console.log(storageRef);
                const uploadTask = uploadBytesResumable(storageRef, img);

                uploadTask.on('state_changed',
                    (snapshot) => {
                        // Observe state change events such as progress, pause, and resume
                        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log('Upload is ' + progress + '% done');
                        switch (snapshot.state) {
                            case 'paused':
                                console.log('Upload is paused');
                                break;
                            case 'running':
                                console.log('Upload is running');
                                break;
                        }
                    },
                    (error) => {

                        //setErr(true);
                    },
                    () => {
                        console.log(uploadTask);
                        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                            console.log(downloadURL);
                            await updateDoc(doc(db, "chats", data.chatId), {
                                messages: arrayUnion({
                                    id: uuid(),
                                    text,
                                    senderId: currentUser.uid,
                                    date: Timestamp.now(),
                                    img: downloadURL,
                                }),
                            });
                        });
                    }
                );
            await updateDoc(doc(db, "userChats", currentUser.uid), {
                [data.chatId + ".lastMessage"]: {
                    text
                },
                [data.chatId + ".data"]: serverTimestamp()
            });
    
            await updateDoc(doc(db, "userChats", data.user.uid), {
                [data.chatId + ".lastMessage"]: {
                    text
                },
                [data.chatId + ".data"]: serverTimestamp(),
            });
            // setImg(null);
        }
        catch(error){

        }

    }
    }

    return (

        <div className='input'>
            {/* <img src={Img} alt="artwork" style={{ width: '256px', height: '256px', border: '1px solid black', padding: '5px'}} /> */}

            <input type='text' placeholder='Type something...' onChange={e => setText(e.target.value)} value={text} />
            <div className='send'>
                <img src={Attach} alt='' />
                <input type="file" style={{ display: "none" }} id="file" onChange={e => setImg(e.target.files[0])} />
                <label htmlFor='file'>
                    <img src={Img} alt='' />
                </label>
                <button onClick={handleSend}>Send</button>
            </div>

        </div>
    )
}

export default Input
