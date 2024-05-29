const correctPassword = "01/12/2022";
let username = "";

function authenticate() {
    const passwordInput = document.getElementById('password').value;
    const errorElement = document.getElementById('error');

    if (passwordInput === correctPassword) {
        errorElement.classList.add('hidden');
        document.getElementById('auth').classList.add('hidden');
        document.getElementById('nameEntry').classList.remove('hidden');
    } else {
        errorElement.classList.remove('hidden');
    }
}

function setName() {
    const usernameInput = document.getElementById('username').value.trim();
    const nameErrorElement = document.getElementById('nameError');

    if (usernameInput !== "") {
        username = usernameInput;
        nameErrorElement.classList.add('hidden');
        document.getElementById('nameEntry').classList.add('hidden');
        document.getElementById('chat').classList.remove('hidden');

        loadMessages();
    } else {
        nameErrorElement.classList.remove('hidden');
    }
}

function sendMessage() {
    const messageInput = document.getElementById('message');
    const messageText = messageInput.value.trim();

    if (messageText !== "") {
        const messageData = {
            type: 'text',
            username: username,
            message: messageText,
            timestamp: Date.now()
        };
        database.ref('messages').push(messageData);
        messageInput.value = "";
    }
}

function sendImage() {
    const fileInput = document.getElementById('imageInput');
    const file = fileInput.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const imageData = event.target.result;
            const messageData = {
                type: 'image',
                username: username,
                imageData: imageData,
                timestamp: Date.now()
            };
            database.ref('messages').push(messageData);
        };
        reader.readAsDataURL(file);
    }
}

function displayMessage(username, messageText) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('bg-gray-700', 'p-2', 'rounded');
    messageElement.innerHTML = `<strong>${username}: </strong>${messageText}`;
    document.getElementById('messages').appendChild(messageElement);
    messageElement.scrollIntoView();
}

function displayImage(username, imageData) {
    const imageElement = document.createElement('div');
    imageElement.classList.add('bg-gray-700', 'p-2', 'rounded');
    imageElement.innerHTML = `<strong>${username}: </strong><img src="${imageData}" onclick="openPopup('${imageData}')">`;
    document.getElementById('messages').appendChild(imageElement);
    imageElement.scrollIntoView();
}

function openPopup(imageData) {
    const popup = document.getElementById('imagePopup');
    const popupImage = document.getElementById('popupImage');
    popupImage.src = imageData;
    popup.classList.remove('hidden');
}

function closePopup() {
    document.getElementById('imagePopup').classList.add('hidden');
}

function clearChat() {
    database.ref('messages').remove();
    clearMessages();
}

function clearMessages() {
    document.getElementById('messages').innerHTML = '';
}

function loadMessages() {
    database.ref('messages').on('child_added', function(snapshot) {
        const messageData = snapshot.val();
        if (messageData.type === 'text') {
            displayMessage(messageData.username, messageData.message);
        } else if (messageData.type === 'image') {
            displayImage(messageData.username, messageData.imageData);
        }
    });

    database.ref('messages').on('child_removed', function() {
        clearMessages();
    });
}
