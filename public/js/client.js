const socket = io()

var username;
var chats = document.querySelector(".chats");
var users_list = document.querySelector(".users-list");
var users_count = document.querySelector(".users-count");
var msg_send = document.querySelector("#user-send")
var user_msg = document.querySelector("#user-msg")

do{
    username= prompt("Enter your name: ");
}while(!username);

// It will be called whne a user will join
socket.emit("new-user-joined",username) // socket variable on client side is informing the server that new user has joined through this
           // event    ,      name


// function to check the join/ left status
function userJoinLeft(name,status){ // this fuction helps to create a new div {with class user-join} in the {div with class chats}  and set its content to {username has joined/left the chat}
    let div = document.createElement("div");
    div.classList.add('user-join');
    let content = `<p><b>${name}</b> ${status} the chat</p>`;
    div.innerHTML = content;
    chats.appendChild(div);
    chats.scrollTop = chats.scrollHeight;
}

// This is to notify whn a new user join the chat
socket.on('user-connected',(socket_name)=>{ // here client has recived the event the server has sent i.e user-connected  and username sent gets stored in socket_name variable
    userJoinLeft(socket_name,'joined'); // so when user-connected is called we call back other custom function {user-JoinedLeft} and in this username/socket_name and status i.e joined is passed as parameters
    
});

// This is to notify whn a user leaves the chat
socket.on("user-disconnected",(user)=>{  // same as user-conected but for diconneceting user
    userJoinLeft(user,'Left');
    
})

// this is to update the users list and their count
socket.on("user-list", (users)=>{
    users_list.innerHTML = "";  // initially the user-list is empty
    users_arr = Object.values(users); // now users_arr array has all the values in the users object
    for(i=0; i<users_arr.length; i++){
        let p = document.createElement('p');
        p.innerText = users_arr[i];
        users_list.append(p);
    }
    users_count.innerHTML = users_arr.length;
})

msg_send.addEventListener('click',()=>{
    let data = {
        user: username,
        msg: user_msg.value
    };

    if(user_msg.value != ''){
        appendMessage(data,'outgoing');
        socket.emit('message',data);
        user_msg.value = '';
    }
});

function appendMessage(data,status){
    let div = document.createElement("div");
    div.classList.add('message',status);
    let content = `
        <h5>${data.user}</h5>
        <p>${data.msg}</p>
    `;
    div.innerHTML = content;
    chats.appendChild(div); 
    chats.scrollTop = chats.scrollHeight;
}

socket.on('message',(data)=>{ // this is called when server has broadcast the messages sent by users and it shows the message to all other users
    appendMessage(data,'incoming')
})

// io. is used if want to apply something to all