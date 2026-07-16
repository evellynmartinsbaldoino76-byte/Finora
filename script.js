const form = document.querySelector('#transaction-form');
const modal = document.querySelector('#transaction-modal');
const openButtons = [document.querySelector('#new-transaction'), document.querySelector('#empty-add')];
const closeButton = document.querySelector('.close');
const list = document.querySelector('#transaction-list');
const emptyState = document.querySelector('#empty-state');
const dateInput = document.querySelector('#date');
const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
let activeFilter = 'all';

function getTransactions() {
  try {
    const savedTransactions = JSON.parse(localStorage.getItem('finora-transactions') || '[]');
    return Array.isArray(savedTransactions) ? savedTransactions : [];
  } catch {
    return [];
  }
}

let transactions = getTransactions();

function setToday() {
  if (dateInput) dateInput.value = new Date().toISOString().slice(0, 10);
}

function openModal() {
  if (modal?.showModal) modal.showModal();
}

function closeModal() {
  if (modal?.open) modal.close();
}

function persist() {
  localStorage.setItem('finora-transactions', JSON.stringify(transactions));
}

function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${date}T12:00:00`));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}

function render() {
  const income = transactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const expense = transactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const balance = income - expense;

  document.querySelector('#income').textContent = currency.format(income);
  document.querySelector('#expense').textContent = currency.format(expense);
  document.querySelector('#balance').textContent = currency.format(balance);
  document.querySelector('#balance-note').textContent = transactions.length ? (balance >= 0 ? 'Seu saldo está positivo' : 'Atenção ao seu saldo') : 'Comece registrando uma transação';

  const filtered = transactions.filter((item) => activeFilter === 'all' || item.type === activeFilter);
  list.innerHTML = filtered.map((item) => `<article class="transaction ${item.type}"><span class="transaction-icon">${item.type === 'income' ? '↑' : '↓'}</span><div class="transaction-info"><b>${escapeHtml(item.description)}</b><small>${formatDate(item.date)}</small></div><strong class="transaction-value">${item.type === 'income' ? '+' : '−'} ${currency.format(item.amount)}</strong><button class="delete" type="button" data-id="${item.id}" aria-label="Excluir ${escapeHtml(item.description)}">×</button></article>`).join('');
  emptyState.hidden = transactions.length > 0;
  list.hidden = filtered.length === 0;
}

setToday();
openButtons.forEach((button) => button?.addEventListener('click', openModal));
closeButton?.addEventListener('click', closeModal);
modal?.addEventListener('click', (event) => {
  if (event.target === modal) closeModal();
});

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const description = data.get('description').trim();
  const amount = Number(data.get('amount'));
  const date = data.get('date');

  if (!description || !Number.isFinite(amount) || amount <= 0 || !date) return;

  transactions.unshift({
    id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
    description,
    amount,
    date,
    type: data.get('type'),
  });
  persist();
  render();
  form.reset();
  setToday();
  closeModal();
});

list?.addEventListener('click', ({ target }) => {
  const id = target.dataset.id;
  if (!id) return;
  transactions = transactions.filter((item) => item.id !== id);
  persist();
  render();
});

document.querySelectorAll('.filter').forEach((button) => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  document.querySelectorAll('.filter').forEach((item) => item.classList.toggle('active', item === button));
  render();
}));

render();
