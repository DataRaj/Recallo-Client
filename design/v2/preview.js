const directions = ['signal', 'blueprint', 'afterhours'];
const directionButtons = document.querySelectorAll('[data-direction-choice]');
const requestedDirection = new URLSearchParams(location.search).get('direction');

function selectDirection(direction) {
  document.documentElement.dataset.direction = direction;
  for (const button of directionButtons) {
    button.setAttribute('aria-pressed', String(button.dataset.directionChoice === direction));
  }
}

selectDirection(directions.includes(requestedDirection) ? requestedDirection : 'signal');

for (const button of directionButtons) {
  button.addEventListener('click', () => selectDirection(button.dataset.directionChoice));
}

const viewButtons = document.querySelectorAll('[data-view]');
const panels = document.querySelectorAll('[data-panel]');

for (const button of viewButtons) {
  button.addEventListener('click', () => {
    const view = button.dataset.view;
    for (const other of viewButtons) {
      other.setAttribute('aria-pressed', String(other === button));
    }
    for (const panel of panels) {
      panel.hidden = panel.dataset.panel !== view;
    }
  });
}

const dialog = document.querySelector('#preview-dialog');
const dialogTitle = document.querySelector('#preview-dialog-title');
const dialogMessage = document.querySelector('#preview-dialog-message');

for (const button of document.querySelectorAll('[data-preview-action]')) {
  button.addEventListener('click', () => {
    const createsRoom = button.dataset.previewAction === 'create';
    dialogTitle.textContent = createsRoom ? 'Create a room' : 'Join a meeting';
    dialogMessage.textContent = createsRoom
      ? 'In Recallo, sign in or create an account to start a room. This design preview uses sample content.'
      : 'In Recallo, enter a room ID or paste an invitation link to join. This design preview uses sample content.';
    dialog.showModal();
  });
}

document.querySelector('[data-close-dialog]').addEventListener('click', () => dialog.close());
