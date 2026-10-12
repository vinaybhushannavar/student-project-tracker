const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const saveButton = document.querySelector('#save-button');
const cancelButton = document.querySelector('#cancel-button');
const message = document.querySelector('#message');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');

const STORAGE_KEY = 'workshop-projects-v1';

let projects = [];
let editingId = null;

// Load projects from localStorage safely
try {
  const storedData = localStorage.getItem(STORAGE_KEY);
  if (storedData !== null) {
    const parsed = JSON.parse(storedData);
    if (Array.isArray(parsed)) {
      projects = parsed;
    } else {
      if (message) {
        message.textContent = 'Warning: Stored data was invalid. Starting with an empty list.';
      }
    }
  }
} catch (error) {
  if (message) {
    message.textContent = 'Error: Could not read saved projects from storage.';
  }
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    if (message) {
      message.textContent = 'Error: Could not save changes to storage.';
    }
  }
}

function render() {
  projectList.innerHTML = '';

  if (projects.length === 0) {
    if (emptyState) {
      emptyState.style.display = 'block';
      emptyState.textContent = 'No projects available.';
    }
    return;
  }

  if (emptyState) {
    emptyState.style.display = 'none';
  }

  projects.forEach(project => {
    const li = document.createElement('li');

    const nameSpan = document.createElement('strong');
    nameSpan.textContent = project.name;

    const statusSpan = document.createElement('span');
    statusSpan.textContent = ` — Status: ${project.status}`;

    // Edit button
    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.textContent = 'Edit';
    editButton.style.marginLeft = '10px';
    editButton.addEventListener('click', () => {
      editingId = project.id;
      nameInput.value = project.name;
      statusInput.value = project.status;
      if (saveButton) saveButton.textContent = 'Save changes';
      if (cancelButton) cancelButton.style.display = 'inline-block';
      if (message) message.textContent = `Editing project: ${project.name}`;
    });

    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';
    deleteButton.style.marginLeft = '5px';
    deleteButton.addEventListener('click', () => {
      const confirmed = confirm(`Are you sure you want to delete "${project.name}"?`);
      if (!confirmed) {
        return;
      }

      if (editingId === project.id) {
        resetForm();
      }

      projects = projects.filter(p => p.id !== project.id);
      saveToStorage();
      render();
    });

    li.appendChild(nameSpan);
    li.appendChild(statusSpan);
    li.appendChild(editButton);
    li.appendChild(deleteButton);
    projectList.appendChild(li);
  });
}

function resetForm() {
  editingId = null;
  form.reset();
  if (saveButton) saveButton.textContent = 'Add project';
  if (cancelButton) cancelButton.style.display = 'none';
  if (message) message.textContent = '';
}

if (cancelButton) {
  cancelButton.style.display = 'none';
  cancelButton.addEventListener('click', () => {
    resetForm();
    if (message) message.textContent = 'Edit cancelled.';
  });
}

form.addEventListener('submit', event => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const status = statusInput.value;

  if (!name) {
    return;
  }

  if (editingId) {
    projects = projects.map(p => {
      if (p.id === editingId) {
        return { ...p, name, status };
      }
      return p;
    });
    if (message) message.textContent = 'Project updated successfully.';
  } else {
    const newProject = {
      id: Date.now().toString(),
      name: name,
      status: status
    };
    projects.push(newProject);
    if (message) message.textContent = 'Project added successfully.';
  }

  saveToStorage();
  resetForm();
  render();
});

// Initial render on load
render();