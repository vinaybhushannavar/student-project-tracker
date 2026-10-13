const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const saveButton = document.querySelector('#save-button');
const cancelButton = document.querySelector('#cancel-button');
const message = document.querySelector('#message');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');

let projects = [];
let editingId = null;

// Helper to display status or error messages
function showMessage(text, isError = false) {
  if (message) {
    message.textContent = text;
    message.style.color = isError ? '#d9534f' : '#222';
  }
}

// Load projects from the Express/SQLite API
async function loadProjects() {
  showMessage('Loading projects...');
  if (emptyState) emptyState.style.display = 'none';

  try {
    const response = await fetch('/api/projects');
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error! status: ${response.status}`);
    }
    projects = await response.json();
    showMessage('');
    render();
  } catch (error) {
    console.error('Failed to load projects:', error);
    showMessage(`Error: Could not load projects from server. (${error.message})`, true);
    // A failed initial load is not an empty-list success
    if (emptyState) emptyState.style.display = 'none';
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
      showMessage(`Editing project: ${project.name}`);
    });

    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';
    deleteButton.style.marginLeft = '5px';
    deleteButton.addEventListener('click', async () => {
      const confirmed = confirm(`Are you sure you want to delete "${project.name}"?`);
      if (!confirmed) {
        return; // Preserves cancelled deletion without sending a mutation request
      }

      showMessage('Deleting project...');
      try {
        const response = await fetch(`/api/projects/${project.id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP error! status: ${response.status}`);
        }

        // Reset edit mode if the record being edited was deleted
        if (editingId === project.id) {
          resetForm();
        }

        showMessage('Project deleted successfully.');
        await loadProjects();
      } catch (error) {
        console.error('Failed to delete project:', error);
        showMessage(`Error: Could not delete project. (${error.message})`, true);
      }
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
  showMessage('');
}

if (cancelButton) {
  cancelButton.style.display = 'none';
  cancelButton.addEventListener('click', () => {
    resetForm();
    showMessage('Edit cancelled.');
  });
}

// Single intended form submit listener handling both Create and Edit
form.addEventListener('submit', async event => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const status = statusInput.value;

  if (!name) {
    return;
  }

  try {
    if (editingId) {
      showMessage('Saving changes...');
      const response = await fetch(`/api/projects/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, status })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
      }

      showMessage('Project updated successfully.');
    } else {
      showMessage('Saving new project...');
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, status })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
      }

      showMessage('Project added successfully.');
    }

    resetForm();
    await loadProjects();
  } catch (error) {
    console.error('Mutation failed:', error);
    showMessage(`Error: Operation failed. (${error.message})`, true);
    // Do not report success or reset unsaved input when the mutation fails
  }
});

// Initial load on application start
loadProjects();