document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const input = document.getElementById('todo-input');
  const addBtn = document.getElementById('add-btn');
  const pendingList = document.getElementById('pending-list');
  const completedList = document.getElementById('completed-list');
  const pendingCount = document.getElementById('pending-count');
  const completedCount = document.getElementById('completed-count');
  const progressFill = document.querySelector('.progress-fill');
  const historyContainer = document.querySelector('.history-tasks');
  const clearHistoryBtn = document.getElementById('clear-history');
  const notification = document.getElementById('notification');

  // State
  let todos = [];
  let taskHistory = [];

  // Initialize
  fetchTodos();
  fetchTaskHistory();

  // Event Listeners
  addBtn.addEventListener('click', addTask);
  input.addEventListener('keypress', (e) => e.key === 'Enter' && addTask());
  clearHistoryBtn.addEventListener('click', clearHistory);

  // Functions
  async function fetchTodos() {
    try {
      const response = await fetch('/todos');
      todos = await response.json();
      renderTodos();
      updateCounters();
    } catch (error) {
      showNotification('Failed to load tasks', 'error');
    }
  }

  async function fetchTaskHistory() {
    try {
      const response = await fetch('/todos/history');
      taskHistory = await response.json();
      renderTaskHistory();
    } catch (error) {
      console.error('Error loading task history:', error);
    }
  }

  function renderTodos() {
    pendingList.innerHTML = '';
    completedList.innerHTML = '';

    todos.forEach(todo => {
      const li = document.createElement('li');
      li.className = 'todo-item';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = todo.completed;
      checkbox.addEventListener('change', () => toggleTodo(todo.id, !todo.completed));
      
      const span = document.createElement('span');
      span.textContent = todo.text;
      
      const date = document.createElement('small');
      date.textContent = todo.completed ? 
        `Completed: ${formatDate(todo.completedAt)}` : 
        `Created: ${formatDate(todo.createdAt)}`;
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete';
      deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
      deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
      
      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(date);
      li.appendChild(deleteBtn);
      
      if (todo.completed) {
        completedList.appendChild(li);
      } else {
        pendingList.appendChild(li);
      }
    });
  }

  function renderTaskHistory() {
    historyContainer.innerHTML = '';
    taskHistory.forEach(task => {
      const taskEl = document.createElement('div');
      taskEl.className = 'history-task';
      taskEl.innerHTML = `<i class="fas fa-reply"></i> ${task}`;
      taskEl.addEventListener('click', () => addTaskFromHistory(task));
      historyContainer.appendChild(taskEl);
    });
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function updateCounters() {
    const pending = todos.filter(todo => !todo.completed).length;
    const completed = todos.filter(todo => todo.completed).length;
    const total = pending + completed;
    
    pendingCount.textContent = pending;
    completedCount.textContent = completed;
    progressFill.style.width = total > 0 ? `${(completed / total) * 100}%` : '0%';
  }

  async function addTask() {
    const text = input.value.trim();
    if (text) {
      try {
        await fetch('/todos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
        input.value = '';
        fetchTodos();
        fetchTaskHistory();
        showNotification('Task added successfully!');
      } catch (error) {
        showNotification('Failed to add task', 'error');
      }
    }
  }

  async function addTaskFromHistory(text) {
    try {
      await fetch('/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      fetchTodos();
      showNotification('Task added from history!');
    } catch (error) {
      showNotification('Failed to add task', 'error');
    }
  }

  async function toggleTodo(id, completed) {
    try {
      const response = await fetch(`/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
      });
      
      if (response.ok) {
        const updatedTodo = await response.json();
        const todoIndex = todos.findIndex(t => t.id === id);
        if (todoIndex !== -1) {
          todos[todoIndex] = updatedTodo;
        }
        renderTodos();
        updateCounters();
        showNotification(`Task marked as ${completed ? 'completed' : 'pending'}`);
      }
    } catch (error) {
      showNotification('Failed to update task', 'error');
    }
  }

  async function deleteTodo(id) {
    try {
      await fetch(`/todos/${id}`, { method: 'DELETE' });
      fetchTodos();
      showNotification('Task deleted');
    } catch (error) {
      showNotification('Failed to delete task', 'error');
    }
  }

  async function clearHistory() {
    if (confirm('Are you sure you want to clear your task history?')) {
      try {
        const response = await fetch('/todos/history', { 
          method: 'DELETE' 
        });
        if (response.ok) {
          taskHistory = [];
          renderTaskHistory();
          showNotification('History cleared');
        }
      } catch (error) {
        showNotification('Failed to clear history', 'error');
      }
    }
  }

  function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = 'notification';
    notification.classList.add(type);
    notification.classList.add('show');
    
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }
});