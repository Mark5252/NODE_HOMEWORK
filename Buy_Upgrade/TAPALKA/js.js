document.addEventListener('DOMContentLoaded', function() {
    const balanceSpan = document.getElementById('balance');
    const totalStat = document.getElementById('total');
    const perClickStat = document.getElementById('per-click');
    const passiveStat = document.getElementById('passive');
    const button = document.getElementById('click-button');
    const buyButtons = document.querySelectorAll('.buyButton');
  
    const email = localStorage.getItem('email');
    const hashedPassword = localStorage.getItem('hashedPassword');
  
    if (!email || !hashedPassword) {
      window.location.href = '../Sign-in.html';
      return;
    }
  
    const nameHeader = document.querySelector('.name');
    if (nameHeader) {
      nameHeader.textContent = email;
    }
  
    const upgrades = [
      { id: 1, name: "Click Accelerator", price: 40000 },
      { id: 2, name: "Coin Multiplier", price: 40000 },
      { id: 3, name: "Power Tap", price: 20000 },
      { id: 4, name: "Golden Touch", price: 40000 },
      { id: 5, name: "Coin Stream", price: 40000 },
      { id: 6, name: "Mining Drone", price: 100000 },
    ];
  
    function updateStats() {
      fetch(`http://localhost:3000/user-stats?email=${email}&hashedPassword=${hashedPassword}`)
        .then(res => res.json())
        .then(data => {
          balanceSpan.textContent = Math.floor(data.balance);
          totalStat.textContent = Math.floor(data.balance);
          perClickStat.textContent = data.coinsPerClick;
          passiveStat.textContent = data.passiveIncomePerSecond + '/sec';
  
          if (data.boughtUpgrades) {
            buyButtons.forEach((button, index) => {
              const upgradeId = upgrades[index].id;
              if (data.boughtUpgrades.includes(upgradeId)) {
                button.disabled = true;
                button.textContent = 'bought';
                button.classList.add('disabled');
              } else {
                button.disabled = false;
                button.textContent = 'Buy';
                button.classList.remove('disabled');
              }
            });
          }
        })
        .catch(error => {
          console.error('Error fetching stats:', error);
        });
    }
  
    function handleClick() {
      fetch('http://localhost:3000/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, hashedPassword })
      })
      .then(() => updateStats())
      .catch(error => console.error('Error sending click:', error));
    }
  
    function handlePassiveIncome() {
      fetch('http://localhost:3000/passive-income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, hashedPassword })
      })
      .then(() => updateStats())
      .catch(error => console.error('Error sending passive income:', error));
    }
  
    // Обработчики кнопок покупки
    buyButtons.forEach((button, index) => {
      const upgrade = upgrades[index];
  
      button.addEventListener('click', () => {
        fetch('http://localhost:3000/buy-upgrade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            hashedPassword,
            upgradeId: upgrade.id
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            alert(data.error);
          } else {
            console.log(`bought: ${upgrade.name}`);
            button.disabled = true;
            button.textContent = 'bought';
            button.classList.add('disabled');
            updateStats();
          }
        })
        .catch(error => {
          console.error('Error purchasing upgrade:', error);
        });
      });
    });
  
    button.addEventListener('click', handleClick);
    setInterval(handlePassiveIncome, 1000);
    updateStats();
  });