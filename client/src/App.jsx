import { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io.connect("http://localhost:3000");

function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");

      window.scrollTo(0, document.body.scrollHeight);
      document.body.scrollTop = document.body.scrollHeight;
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });
  }, [socket]);

  return (
    <div className="chat-window max-w-md mx-auto">
      <div className="chat-header">
        <p className="text-3xl font-bold underline text-center">
          Live Chat for Room: {room}
        </p>
      </div>
      <div className="chat-body">
        {messageList.map((messageContent) => {
          return (
            <div
              className="message"
              id={username === messageContent.author ? "you" : "other"}
            >
              <div className="my-2 bg-gray-100">
                <div className="message-content p-2">
                  <span>{messageContent.message}</span>
                </div>
                <div className="message-meta text-right p-2">
                  <span id="time" className="text-xs text-slate-400">
                    {messageContent.time}
                  </span>
                  -
                  <span
                    id="author"
                    className="text-sm text-green-600 font-bold"
                  >
                    {messageContent.author}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="chat-footer max-w-md bg-zinc-200 p-2 flex">
        <input
          type="text"
          className="p-2 w-max rounded-md flex-1 mr-2"
          value={currentMessage}
          placeholder="message..."
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />
        <button
          className="p-2 bg-blue-500 rounded-lg flex-none"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  const joinRoom = () => {
    serverRooms.map((a) => {
      if (a.name === room) {
        console.log("room already exists");
        return "room already exists";
      }
    });
    fetch(`http://localhost:3000/add?name=${room}&creator=${username}`, {
      method: "POST",
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setServerRooms(data);
      });
    if (username !== "" && room !== "") {
      socket.emit("join_room", room);
      setShowChat(true);
    }
  };

  const getRooms = async () => {
    const room = await fetch("http://localhost:3000/");
    console.log(room.text());
    setServerRooms(room);
    return <div>{serverRooms}</div>;
  };

  const FetchRoomData = () => {
    const [serverRooms, setServerRooms] = useState([]);
    const fetcher = () => {
      fetch("http://localhost:3000/")
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          console.log(data);
          setServerRooms(data);
        });
    };

    useEffect(() => {
      fetcher();
    }, [setServerRooms]);

    return (
      <div>
        <p className="text-center text-2xl underline">Available Rooms:</p>
        {serverRooms.map((a) => (
          <div className="mx-auto text-center">
            <span>{a.name}</span> - BY:<span> {a.creator}</span>
          </div>
        ))}
      </div>
    );
  };

  const JoinChat = () => {
    return (
      <>
        <FetchRoomData />

        <div className="text-center text-2xl underline">
          Create OR Join a Room
        </div>
        <form className="max-w-md mx-auto my-10">
          <div className="mb-6 ">
            <label className="block mb-2 text-sm font-medium text-gray-900 ">
              Your Name
            </label>
            <input
              onChange={(event) => {
                setUsername(event.target.value);
              }}
              className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              placeholder="Mike..."
              required
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-900 ">
              Room
            </label>
            <input
              placeholder="Room ID..."
              onChange={(event) => {
                setRoom(event.target.value);
              }}
              className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              required
            />
          </div>

          <button
            onClick={joinRoom}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center "
          >
            Create OR Join Room
          </button>
        </form>
      </>
    );
  };

  return (
    <>
      <div>
        {!showChat ? (
          <JoinChat />
        ) : (
          <Chat socket={socket} username={username} room={room} />
        )}
      </div>
    </>
  );
}
