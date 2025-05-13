document.querySelector('.signup').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.querySelector('input[type="email"]').value;
    const password = document.querySelector('input[type="password"]').value;

    fetch('http://localhost:3000/sign-in', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(async response => {
        const data = await response.json();

        if (!response.ok) {
            console.log(data.message || 'Помилка входу');
            return;
        }

        window.location.href = 'file:///C:/Users/User/Desktop/Sing-in/TAPALKA/tapalka.html';
    })
    .catch(error => {
        console.log('Помилка:', error);
        console.log('Сталася помилка. Спробуйте пізніше.');
    });
});
