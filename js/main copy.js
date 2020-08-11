let memberList = new Array(),
  lStorage = window.localStorage,
  memberStorage = lStorage.getItem('members'),
  members = document.getElementById('members'),
  memberObject = JSON.parse(memberStorage);

function memberToList(name, id) {
  let addListElement = document.createElement('li'),
    addColumns = document.createElement('div'),
    deleteButtonImg = addIcon(
      'img/user-minus-solid.svg',
      'width:1rem; cursor:pointer'
    ),
    memberName = document.createTextNode(name),
    nameColumn = addColumnDiv(memberName);

  addColumns.classList = 'columns';
  deleteButtonColumn = addColumnDiv(deleteButtonImg);
  addListElement.id = id;
  deleteButtonImg.addEventListener('click', deleteMember);

  addColumns.appendChild(nameColumn);
  addColumns.appendChild(deleteButtonColumn);
  addListElement.appendChild(addColumns);
  members.appendChild(addListElement);
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
function deleteMember(event) {
  const confirmDelete = confirm('Do you want to delete this member?');
  if (confirmDelete === true) {
    const button = event.target,
      li = button.closest('ul > li'),
      id = li.id;
    members.removeChild(li);
    for (let i = 0; i < memberObject.length; i++) {
      if (memberObject[i]['id'] === Number(id)) {
        memberObject.splice(i, 1);
      }
    }
    setMemberStorage(lStorage, memberObject);
  }
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
function checkExistingMemberId(id) {
  for (let i = 0; i < memberObject.length; i++) {
    if (memberObject[i]['id'] === Number(id)) {
      return true;
    } else {
      return false;
    }
  }
}

function setMemberToStorage(name, level) {
  let memberObj = new Object(),
    tempId = memberObject.length + 1;

  if (checkExistingMemberId(tempId) === true) {
    memberObj.id = memberObject.length + 1;
  }

  memberObj.name = name;
  memberObj.level = level;
  memberObj.attendance = false;
  memberObj.onbench = true;
  memberObject.push(memberObj);

  setMemberStorage(lStorage, memberObject);
  memberToList(name, memberObj.id);
}

function setMemberStorage(localstorage, list) {
  localstorage.setItem('members', JSON.stringify(list));
}

function getMemberObject(string) {
  let memberObj = JSON.parse(string);
  return memberObj;
}

function getMemberIdByName(name) {
  for (let i = 0; i < memberObject.length; i++) {
    if (memberObject[i]['name'] === name) {
      return memberObject[i]['id'];
    }
  }
}

function getMemberNameById(id) {
  for (let i = 0; i < memberObject.length; i++) {
    if (memberObject[i]['id'] === Number(id)) {
      return memberObject[i]['name'];
    }
  }
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
  if (checkExistingMemberName(getNameInput())) {
    alert('Same named member exist \n' + 'Please use another name');
  } else {
    setMemberToStorage(getNameInput(), getLevelInput());
    deactiveModal();
  }
}

function init() {
  if (memberObject !== null) {
    initMemberList();
  } else {
    memberObject = new Array();
  }
}

init();
