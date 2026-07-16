const session = JSON.parse(localStorage.getItem('finora-session') || 'null');
if (!session) window.location.replace('login.html');
