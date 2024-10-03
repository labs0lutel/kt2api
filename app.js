let currentCoordinates = null;
let db;

const request = indexedDB.open('CommentsDB', 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    db.createObjectStore('comments', { keyPath: 'id', autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.result;
    console.log('IndexedDB открыта');
};

request.onerror = function(event) {
    console.error('Ошибка при открытии IndexedDB:', event);
};

document.getElementById('getLocationBtn').onclick = function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            currentCoordinates = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
            document.getElementById('coordinates').innerText = 
                `Широта: ${currentCoordinates.latitude}, Долгота: ${currentCoordinates.longitude}`;
        }, error => {
            console.error(error);
            alert('Ошибка получения местоположения.');
        });
    } else {
        alert('Geolocation не поддерживается вашим браузером.');
    }
};

document.getElementById('commentForm').onsubmit = function(event) {
    event.preventDefault();
    const comment = document.getElementById('commentInput').value;

    if (currentCoordinates) {
        const data = {
            comment: comment,
            coordinates: currentCoordinates
        };
        let comments = JSON.parse(localStorage.getItem('comments')) || [];
        comments.push(data);
        localStorage.setItem('comments', JSON.stringify(comments));
        document.getElementById('commentInput').value = '';
        displayComments();
    } else {
        alert('Сначала определите местоположение.');
    }
};

function displayComments() {
    const comments = JSON.parse(localStorage.getItem('comments')) || [];
    const commentsList = document.getElementById('commentsList');
    commentsList.innerHTML = '';

    comments.forEach((item, index) => {
        commentsList.innerHTML += `<div class="comment-item">Комментарий: ${item.comment}, Координаты: ${item.coordinates.latitude}, ${item.coordinates.longitude}</div>`;
    });
}

document.getElementById('saveToIndexedDBBtn').onclick = function() {
    const comment = document.getElementById('commentInput').value;

    if (currentCoordinates && comment) {
        const transaction = db.transaction('comments', 'readwrite');
        const store = transaction.objectStore('comments');

        const data = {
            comment: comment,
            coordinates: currentCoordinates
        };

        const request = store.add(data);
        request.onsuccess = function() {
            console.log('Комментарий добавлен в IndexedDB');
            document.getElementById('commentInput').value = '';
        };

        request.onerror = function(event) {
            console.error('Ошибка при добавлении в IndexedDB:', event);
        };
    } else {
        alert('Сначала определите местоположение и введите комментарий.');
    }
};

document.getElementById('viewFromIndexedDBBtn').onclick = function() {
    const transaction = db.transaction('comments', 'readonly');
    const store = transaction.objectStore('comments');
    const request = store.getAll();

    request.onsuccess = function(event) {
        const items = event.target.result;
        const indexedDBList = document.getElementById('indexedDBList');
        indexedDBList.innerHTML = '';

        items.forEach(item => {
            indexedDBList.innerHTML += `<div class="comment-item">Комментарий: ${item.comment}, Координаты: ${item.coordinates.latitude}, ${item.coordinates.longitude}</div>`;
        });
    };

    request.onerror = function(event) {
        console.error('Ошибка при получении данных из IndexedDB:', event);
    };
};
