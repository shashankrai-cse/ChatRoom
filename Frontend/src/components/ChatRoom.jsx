import {useEffect, useState, useRef} from 'react'
import { useLocation,useNavigate } from 'react-router-dom'
import {connectWebSocket} from '../ws';
const ChatRoom = () => {
    const navigate = useNavigate();
    const socketRef = useRef(null);
    const location = useLocation()
    const userName = location.state?.name || 'Guest';
    const [timer, setTimer] = useState(setTimeout(console.log(),1000));
    const getTime = ()=>{
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'});
    }
    const [typing, setTyping] = useState({name:userName,is:false});
    const [text,setText] = useState("");
    const [messages, setMessages] = useState([]); //[{user:"system", text: "Welcome to the chat room!",time: getTime()}]
    
    const handleChange = (e)=>{
        const {value} = e.target;
        setText(value);
    }

    const keydown = ()=>{
        socketRef.current.emit("isTyping",{name:userName,is:true});
        clearTimeout(timer);

    }
    const keyup = ()=>{
        setTimer(setTimeout(()=>{socketRef.current.emit("isTyping",{name:userName,is:false})},300));
        

    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const text = formData.get('message')
        if (text) {
            var data = { user: userName, text:text, time:getTime()};
            setMessages((messages)=>[...messages, data]);
            socketRef.current.emit("sendMessage",data);
            setText("");
        }
    }

    useEffect(() => {
        {userName==="Guest"?navigate("/"):null};
        socketRef.current = connectWebSocket();

        socketRef.current.on("connect",()=>{
            socketRef.current.on("isTyping",(data)=>{
                // console.log(data);
                setTyping(data);
            });

            socketRef.current.on("roomNotice", (username) => {
                const msg = {
                    user: "system",
                    text: `${username} joined the chat room!`,
                    time: getTime(),
                };
                setMessages((messages) => [...messages, msg]);
            });

            socketRef.current.on("recieveMessage",(data)=>{
                //push to exitsing messages
                setMessages((messages)=>[...messages, data]);
            });

            socketRef.current.emit('joinRoom',userName);
        })

        
        
    },[])
    

  return (
    <div className="flex flex-col items-center min-h-screen bg-linear-to-br from-slate-900 via-green-800 to-slate-700 px-4 py-10">
        <div className="w-full max-w-4xl rounded-2xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-md">
            <h1 className="text-2xl font-bold text-white">Chat Room</h1>
            <p className="text-slate-300">Welcome to the chat room {userName}!</p>
        </div>
        <div className="w-full max-w-4xl rounded-2xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-md mt-6">
            {messages.map((msg, index) => {
                if (msg.user == userName) {
                    return(
                        <div key={index} className="mb-4 flex justify-end">
                            <div className="inline-block  bg-green-400 p-4 rounded-lg">
                                <p className="text-sm text-black">{msg.user}:</p>
                                <p className="text-white">{msg.text}</p>
                                <p className='text-white text-end mt-2 text-[0.7rem]'>{msg.time}</p>
                            </div>
                            
                        </div>
                    )
                }else if(msg.user == "system") {
                    return(
                        <div key={index} className="mb-4 flex justify-center">
                            <div className="inline-block  bg-fuchsia-400 p-4 rounded-lg">
                                <p className="text-white"><span className='text-[0.7rem]'>{msg.time}</span> {msg.text}</p>
                            </div>
                            
                        </div>
                    )
                }else{
                    return(
                        <div key={index} className="mb-4 flex justify-start">
                            <div className="inline-block  bg-green-400 p-4 rounded-lg">
                                <p className="text-sm text-black">{msg.user}:</p>
                                <p className="text-white">{msg.text}</p>
                                <p className='text-white text-end mt-2 text-[0.7rem]'>{msg.time}</p>
                            </div>
                            
                        </div>
                    )
                }
            })}
            {typing.name!==userName && typing.is? <p className='text-white '>{typing.name} is typing</p> : <p className='h-[1.4rem]'/>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="message"
                    value={text}
                    onChange={handleChange}
                    onKeyDown={keydown}
                    onKeyUp={keyup}
                    placeholder="Type your message..."
                    className="w-full rounded-xl border border-slate-600 bg-slate-900/70 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-400 focus:border-cyan-400"
                />
            </form>
        </div>


    </div>
  )
}

export default ChatRoom