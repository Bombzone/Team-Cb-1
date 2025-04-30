import ReactDOM from "react-dom/client";
import Estimation from "./estimation";
import "../../../client/dist/css/common.css"
import { BrowserRouter, Route, Routes } from "react-router-dom";
import JoinRoom, { CreateRoom } from "./home";
import { useEffect, useState } from "react";
const App = () => { // displays page based on functions and url
    
    const [uid, setUid] = useState("");
    const [Name, setName] = useState("");
	const [clickUid, setClickUid] = useState("");
	const [allClick, setallClick] = useState("");
    const [ws, setWs] = useState({} as WebSocket);
	let connectedUsers: any = {};

	let connection: WebSocket;
	if (window.location.protocol == "https:") {
		connection = new WebSocket(`wss://${window.location.host.split(":")[0]}:3030`);
	} else {
		connection = new WebSocket(`ws://${window.location.host.split(":")[0]}:3030`);
	}
    useEffect(() => {
        connection.onopen = () => {
			console.log("connection opened to the server...");
		};
		// Handle error
		connection.onerror = () => {
			console.log("WS error");
		};
        // Handle server message
		connection.onmessage = (inMessage: any) => {
			console.log(inMessage.data);
			// Split message into underscores
			const messageParts: string[] = inMessage.data.split("_");
			// index 0 is message type
			const messageType = messageParts[0];
			switch (messageType) {
				case "connected":
                    const storedUID = localStorage.getItem("UID")
					if (storedUID == null) {
						localStorage.setItem("UID", messageParts[1]);
						setUid(messageParts[1]);
					}
					break;
				case "update":
					setClickUid(messageParts[1]);
					break;
				case "estimated":
					setallClick(messageParts[1]);
					break;
                case "name":
                    const storedName = localStorage.getItem("name")
					if (storedName == null) {
						setName("Unspecified");
					} else {
						setName(storedName);
					}
					break;
				default:
                    
					break;
			}
		};
		setWs(connection);
    },[]);

	const sendMessage = (message:string) => {
		console.log(`WS message sent: ${message}`);
		ws.send(message);
	};

    return (
        <BrowserRouter>
            <Routes>
            <Route path="/" element={<JoinRoom sendMessage={sendMessage} />} />
                    <Route path="/create-room" element={<CreateRoom sendMessage={sendMessage}/>} />
                    <Route path="/estimate" element={<Estimation connection={ws} sendMessage={sendMessage} />} />            </Routes>
        </BrowserRouter>
    )
};
const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);
