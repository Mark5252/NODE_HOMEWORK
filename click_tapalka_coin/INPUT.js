document.querySelector('.button').addEventListener('click', function(e) { 
    e.preventDefault();

    const email = document.querySelector('#email').value.trim();
    const password = document.querySelector('#pass').value.trim();

    fetch('http://localhost:3000/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json().then(data => {
        if (!response.ok) {
            alert(data.message || 'Щось пішло не так');
            return;
        }

        localStorage.setItem('email', email);
        localStorage.setItem('hashedPassword', data.hashedPassword);

        window.location.href = './Sign-in.html';
    }))
    .catch(error => {
        console.error('Помилка:', error);
    });
});
