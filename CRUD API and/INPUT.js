document.querySelector('.button').addEventListener('click', (e) => {
    e.preventDefault();

    const email = document.querySelector('#email').value.trim();
    const password = document.querySelector('#pass').value.trim();

    fetch('http://localhost:3000/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(async response => {
        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Щось пішло не так');
            return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('email', email);
    })
    .catch(err => console.error('Помилка:', err));
});
