/// CHAT PART /// 

const sendButton = document.querySelector('#send_btn');
const hand_button = document.querySelector('#hand_button');

sendButton.onclick = () => {
    let message = document.getElementById('input_message').value;
    let time = getTimeNow();

    if (message == '') return; // don't send empty messages

    const json = {
        'message': message,
        'name': NAME,
        'time': time,
    }
    var result = JSON.stringify(json);
    socket.emit("chatMessage", result);
    document.getElementById('input_message').value = '';
}

socket.on('message', (message, user, time) => {
    printMessage(message, user, time);
})

function printMessage(message, user, time) {
    var chat = document.getElementById("all_messages");
    if (user == NAME) {
        chat.innerHTML = chat.innerHTML +
            `<div class="user_message">
        <h5>${user.toUpperCase()}</h5>
        <p>${message}</p>
        <span class="time-right">${time}</span>
        </div>`;
    }

    else {
        chat.innerHTML = chat.innerHTML +
            `<div class="user_message darker">
        <h6 class="name_right">${user.toUpperCase()}</h6>
        <p>${message}</p>
        <span class="time-left">${time}</span>
        </div>`;
    }
}


hand_button.onclick = () => {
    let hand = '&#9995;'
    let time = getTimeNow();

    const json = {
        'hand': hand,
        'name': NAME,
        'time': time,
    }
    var result = JSON.stringify(json);
    socket.emit("raiseHand", result);
}

socket.on('hand', (message)=>{
    printHand(message);
})

function printHand(message){
    let li = document.createElement("li");
    li.innerHTML = message;
    let chat = document.getElementById("all_messages");
    chat.appendChild(li);
}



var getTimeNow = () => {
    let d = Date(Date.now());
    d = d.toString()
    let result = d.substring(16, 21);
    return result;
}