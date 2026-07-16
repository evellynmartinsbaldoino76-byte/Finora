const form = document.querySelector('#transaction-form');
const modal = document.querySelector('#transaction-modal');
const openButtons = [document.querySelector('#new-transaction'), document.querySelector('#empty-add')];
const closeButton = document.querySelector('.close');
const list = document.querySelector('#transaction-list');
const emptyState = document.querySelector('#empty-state');
const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
let activeFilter = 'all';
let transactions = JSON.parse(localStorage.getItem('finora-transactions') || '[]');

document.querySelector('#date').value = new Date().toISOString().slice(0, 10);
openButtons.forEach((button) => button?.addEventListener('click', () => modal.showModal()));
closeButton.addEventListener('click', () => modal.close());

function persist() { localStorage.setItem('finora-transactions', JSON.stringify(transactions)); }
function formatDate(date) { return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${date}T12:00:00`)); }

function render() {
  const income = transactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
  const expense = transactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
  const balance = income - expense;
  document.querySelector('#income').textContent = currency.format(income);
  document.querySelector('#expense').textContent = currency.format(expense);
  document.querySelector('#balance').textContent = currency.format(balance);
  document.querySelector('#balance-note').textContent = transactions.length ? (balance >= 0 ? 'Seu saldo está positivo' : 'Atenção ao seu saldo') : 'Comece registrando uma transação';
  const filtered = transactions.filter((item) => activeFilter === 'all' || item.type === activeFilter);
  list.innerHTML = filtered.map((item) => `<article class="transaction ${item.type}"><span class="transaction-icon">${item.type === 'income' ? '↑' : '↓'}</span><div class="transaction-info"><b>${item.description}</b><small>${formatDate(item.date)}</small></div><strong class="transaction-value">${item.type === 'income' ? '+' : '−'} ${currency.format(item.amount)}</strong><button class="delete" data-id="${item.id}" aria-label="Excluir ${item.description}">×</button></article>`).join('');
  emptyState.hidden = transactions.length > 0;
  list.hidden = filtered.length === 0;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  transactions.unshift({ id: crypto.randomUUID(), description: data.get('description').trim(), amount: Number(data.get('amount')), date: data.get('date'), type: data.get('type') });
  persist(); render(); form.reset(); document.querySelector('#date').value = new Date().toISOString().slice(0, 10); modal.close();
});

list.addEventListener('click', ({ target }) => {
  const id = target.dataset.id;
  if (!id) return;
  transactions = transactions.filter((item) => item.id !== id);
  persist(); render();
});

document.querySelectorAll('.filter').forEach((button) => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  document.querySelectorAll('.filter').forEach((item) => item.classList.toggle('active', item === button));
  render();
}));
render();
