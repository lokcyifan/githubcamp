// ===== 我的待辦清單 =====
// 純前端實作,不使用任何框架或套件。資料存在瀏覽器的 localStorage。

const STORAGE_KEY = 'workshop-todos';
const THEME_STORAGE_KEY = 'workshop-theme';
const THEME_QUERY = '(prefers-color-scheme: dark)';

const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const remainingCount = document.getElementById('remaining-count');
const themeToggle = document.getElementById('theme-toggle');
const filterButtons = document.querySelectorAll('.filter-btn');

let todos = loadTodos();
let currentFilter = 'all';

function loadTodos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('讀取待辦清單失敗,將以空清單開始。', error);
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function getFilteredTodos() {
  if (currentFilter === 'active') {
    return todos.filter((todo) => !todo.completed);
  }

  if (currentFilter === 'completed') {
    return todos.filter((todo) => todo.completed);
  }

  return todos;
}

function updateEmptyState(filteredTodos) {
  if (filteredTodos.length === 0) {
    if (currentFilter === 'all') {
      emptyState.textContent = '還沒有任何待辦事項,新增一個吧!';
    } else if (currentFilter === 'active') {
      emptyState.textContent = '目前沒有未完成的待辦事項。';
    } else {
      emptyState.textContent = '目前沒有已完成的待辦事項。';
    }
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
  }
}

function render() {
  list.replaceChildren();

  const filteredTodos = getFilteredTodos();

  filteredTodos.forEach((todo) => {
    const item = document.createElement('li');
    item.className = todo.completed ? 'todo-item completed' : 'todo-item';
    item.dataset.id = todo.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.setAttribute('aria-label', `標記「${todo.text}」為完成`);

    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'btn-delete';
    deleteButton.textContent = '✕';
    deleteButton.setAttribute('aria-label', `刪除「${todo.text}」`);

    item.append(checkbox, text, deleteButton);
    list.append(item);
  });

  updateEmptyState(filteredTodos);

  const remaining = todos.filter((todo) => !todo.completed).length;
  remainingCount.textContent = `未完成:${remaining} 項`;
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function addTodo(text) {
  todos.push({
    id: createId(),
    text,
    completed: false,
  });
  saveTodos();
  render();
}

function toggleTodo(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  saveTodos();
  render();
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  render();
}

function getPreferredTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }

  return window.matchMedia(THEME_QUERY).matches ? 'dark' : 'light';
}

function applyTheme(theme, shouldPersist = false) {
  const isDark = theme === 'dark';
  document.body.dataset.theme = theme;
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeToggle.setAttribute('aria-label', isDark ? '切換至淺色模式' : '切換至深色模式');
  themeToggle.querySelector('.theme-toggle__icon').textContent = isDark ? '☀️' : '🌙';
  themeToggle.querySelector('.theme-toggle__label').textContent = isDark ? '淺色模式' : '深色模式';

  if (shouldPersist) {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }
}

function initializeTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (savedTheme === 'light' || savedTheme === 'dark') {
    applyTheme(savedTheme, false);
    return;
  }

  const theme = window.matchMedia(THEME_QUERY).matches ? 'dark' : 'light';
  applyTheme(theme, false);
}

function setFilter(filter) {
  currentFilter = filter;

  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === filter;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  render();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  addTodo(text);
  input.value = '';
  input.focus();
});

list.addEventListener('click', (event) => {
  const item = event.target.closest('.todo-item');
  if (!item) return;

  const id = item.dataset.id;

  if (event.target.matches('input[type="checkbox"]')) {
    toggleTodo(id);
  } else if (event.target.matches('.btn-delete')) {
    deleteTodo(id);
  }
});

themeToggle.addEventListener('click', () => {
  const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme, true);
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setFilter(button.dataset.filter);
  });
});

initializeTheme();
render();
