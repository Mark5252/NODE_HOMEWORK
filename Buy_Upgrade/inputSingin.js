document.querySelector('.signup').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.querySelector('input[type="email"]').value;
    const password = document.querySelector('input[type="password"]').value;

    fetch('http://localhost:3000/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json().then(data => {
        if (!response.ok) {
            alert(data.message || 'Помилка входу');
            return;
        }

        localStorage.setItem('email', email);
        localStorage.setItem('hashedPassword', data.hashedPassword);

        window.location.href = './TAPALKA/tapalka.html';
    }))
    .catch(error => {
        console.error('Помилка:', error);
        alert('Сталася помилка. Спробуйте пізніше.');
    });
});
