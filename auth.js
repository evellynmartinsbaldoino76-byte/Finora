const USERS_KEY = 'finora-users';
const SESSION_KEY = 'finora-session';
const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
const setUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));
function showError(message) { document.querySelector('#form-error').textContent = message; }
function setSession(user) { localStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id, name: user.name, email: user.email })); }
document.querySelectorAll('.toggle-password').forEach((button) => button.addEventListener('click', () => { const input = document.querySelector(`#${button.dataset.target}`); const hidden = input.type === 'password'; input.type = hidden ? 'text' : 'password'; button.textContent = hidden ? 'Ocultar' : 'Mostrar'; }));
const registerForm = document.querySelector('#register-form');
registerForm?.addEventListener('submit', (event) => { event.preventDefault(); const data = new FormData(registerForm); const name = data.get('name').trim(); const email = data.get('email').trim().toLowerCase(); const password = data.get('password'); if (name.length < 3) return showError('Digite seu nome completo.'); if (!/^\S+@\S+\.\S+$/.test(email)) return showError('Digite um e-mail válido.'); if (password.length < 6) return showError('A senha deve ter pelo menos 6 caracteres.'); if (password !== data.get('confirmation')) return showError('As senhas não coincidem.'); const users = getUsers(); if (users.some((user) => user.email === email)) return showError('Este e-mail já possui uma conta.'); const user = { id: crypto.randomUUID(), name, email, password }; users.push(user); setUsers(users); setSession(user); window.location.href = 'index.html'; });
const loginForm = document.querySelector('#login-form');
loginForm?.addEventListener('submit', (event) => { event.preventDefault(); const data = new FormData(loginForm); const email = data.get('email').trim().toLowerCase(); const user = getUsers().find((item) => item.email === email && item.password === data.get('password')); if (!user) return showError('E-mail ou senha incorretos.'); setSession(user); window.location.href = 'index.html'; });
