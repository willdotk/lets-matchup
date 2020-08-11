let memberList = new Array(),
  storage = window.localStorage,
  memberStorage = storage.getItem('members'),
  memberObject = JSON.parse(memberStorage);

function memberToList(name, level) {
  let members = document.getElementById('members'),
    addListElement = document.createElement('li'),
    addColumns = document.createElement('div'),
    deleteButtonImg = addIcon('img/user-minus-solid.svg', 'width:1rem'),
    memberId = memberObject.length + 1,
    memberName = document.createTextNode(name),
    nameColumn = addColumnDiv(memberName);

  addColumns.classList = 'columns';
  deleteButtonColumn = addColumnDiv(deleteButtonImg);
  addListElement.id = memberId;

  addColumns.appendChild(nameColumn);
  addColumns.appendChild(deleteButtonColumn);
  addListElement.appendChild(addColumns);
  members.appendChild(addListElement);

  setMemberToStorage(name, memberId, level);
}
function addColumnDiv(element) {
  let addDiv = document.createElement('div');
  addDiv.classList = 'column is-two-thirds';
  addDiv.appendChild(element);
  return addDiv;
}
function addIcon(src, style) {
  let spanElement = document.createElement('span'),
    buttonImg = document.createElement('img');

  spanElement.classList = 'icon';
  buttonImg.src = src;
  buttonImg.style = style;

  spanElement.appendChild(buttonImg);
  return spanElement;
}

function sortedObject(object) {
  let lst = [];
  for (let i = 0; i < object.length; i++) {
    let innerObj = {
      name: object[i]['name'],
      id: object[i]['id'],
    };
    lst.push(innerObj);
  }
  lst.sort(function (a, b) {
    return a.name.toLowerCase() > b.name.toLowerCase()
      ? 1
      : a.name.toLowerCase() < b.name.toLowerCase()
      ? -1
      : 0;
  });
  return lst;
}
function initMemberList() {
  for (let i = 0; i < sortedObject(memberObject).length; i++) {
    memberToList(
      sortedObject(memberObject)[i]['name'],
      sortedObject(memberObject)[i]['id']
    );
  }
}

// localstorage

function checkExistingMemberName(name) {
  for (let i = 0; i < sortedObject(memberObject).length; i++) {
    if (name === memberObject[i]['name']) {
      return true;
    } else {
      return false;
    }
  }
}

function setMemberToStorage(name, id, level) {
  let memberObj = new Object();
  memberObj.id = id;
  memberObj.name = name;
  memberObj.level = level;
  memberObj.attendance = false;
  memberObj.onbench = true;
  memberObject.push(memberObj);

  setMemberStorage(storage, memberObject);
}

function setMemberStorage(localstorage, list) {
  localstorage.setItem('members', JSON.stringify(list));
}

function getMemberObject(string) {
  let memberObj = JSON.parse(string);
  return memberObj;
}

// modal
function activeModal() {
  let modal = document.getElementById('addMemberModal'),
    modalContainer = document.querySelector('html'),
    nameInput = document.getElementById('nameInput'),
    levelInput = document.getElementById('levelInput');
  nameInput.value = '';
  levelInput.value = '';
  modal.classList.add('is-active');
  modalContainer.classList.add('is-clipped');
}
function deactiveModal() {
  let modal = document.getElementById('addMemberModal'),
    modalContainer = document.querySelector('html');
  modal.classList.remove('is-active');
  modalContainer.classList.remove('is-clipped');
}
function getNameInput() {
  let nameInput = document.getElementById('nameInput').value;
  return nameInput;
}
function getLevelInput() {
  let levelInput = document.getElementById('levelInput').value;
  return levelInput;
}
function addBtn() {
  if (memberObject === null) {
    let memberObject = new Array();
    memberToList(getNameInput(), getLevelInput());
    deactiveModal();
  }

  if (checkExistingMemberName(getNameInput())) {
    alert('Same named member exist \n' + 'Please use another name');
  } else {
    memberToList(getNameInput(), getLevelInput());
    deactiveModal();
  }
}

function init() {
  if (memberObject !== null) {
    initMemberList();
  } else {
    let memberObject = new Array();
  }
}

init();
