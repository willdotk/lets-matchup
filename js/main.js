let memberList = new Array(),
  playerList = new Array(),
  totalTeamList = new Array(),
  lStorage = window.localStorage,
  memberStorage = lStorage.getItem('members'),
  members = document.getElementById('members'),
  memberObject = JSON.parse(memberStorage),
  teamMatchTolerance = 0.2;

function memberToList(name) {
  let addListElement = document.createElement('li'),
    addCardElement = document.createElement('div'),
    deleteButtonImg = addIcon(
      'img/user-minus-solid.svg',
      'width:3rem; cursor:pointer'
    ),
    switchBtn = switchButton(name),
    memberName = document.createTextNode(name),
    cardContent = document.createElement('card-content'),
    cardFooter = document.createElement('footer'),
    namePElement = document.createElement('p'),
    delBtnItem = document.createElement('div'),
    switchBtnItem = document.createElement('div');

  addCardElement.classList = 'card';
  addCardElement.style = 'margin: 0.5rem;';
  cardContent.classList = 'card-content';
  cardFooter.classList = 'card-footer';
  namePElement.classList = 'subtitle has-text-centered';
  namePElement.style = 'margin-left: 1rem';

  namePElement.appendChild(memberName);
  switchBtnItem.classList = 'card-footer-item';
  switchBtnItem.appendChild(switchBtn);
  delBtnItem.classList = 'card-footer-item';
  deleteButtonImg.addEventListener('click', deleteMember);
  delBtnItem.appendChild(deleteButtonImg);

  cardContent.appendChild(namePElement);
  cardFooter.appendChild(delBtnItem);
  cardFooter.appendChild(switchBtnItem);

  addCardElement.appendChild(cardContent);
  addCardElement.appendChild(cardFooter);
  addListElement.id = name;
  addListElement.appendChild(addCardElement);
  members.appendChild(addListElement);
}
/* Alternative option
function memberToList(name) {
  let addListElement = document.createElement('li'),
    addLevelElement = document.createElement('div'),
    deleteButtonImg = addIcon(
      'img/user-minus-solid.svg',
      'width:3rem; cursor:pointer'
    ),
    switchBtn = switchButton(name),
    memberName = document.createTextNode(name),
    leftLevel = document.createElement('div'),
    rightLevel = document.createElement('div'),
    nameLevelItem = document.createElement('div'),
    namePElement = document.createElement('p'),
    delBtnItem = document.createElement('div'),
    switchBtnItem = document.createElement('div');

  addLevelElement.classList = 'level';
  leftLevel.classList = 'level-left';
  rightLevel.classList = 'level-right';
  nameLevelItem.classList = 'level-item';
  nameLevelItem.style = 'font-size:1.3rem';
  namePElement.appendChild(memberName);
  switchBtnItem.classList = 'level-item';
  switchBtnItem.appendChild(switchBtn);
  delBtnItem.classList = 'level-item';
  deleteButtonImg.addEventListener('click', deleteMember);
  delBtnItem.appendChild(deleteButtonImg);

  nameLevelItem.appendChild(namePElement);
  leftLevel.appendChild(nameLevelItem);
  rightLevel.appendChild(switchBtnItem);
  rightLevel.appendChild(delBtnItem);

  addLevelElement.appendChild(leftLevel);
  addLevelElement.appendChild(rightLevel);
  addListElement.id = name;
  addListElement.classList = 'box';
  addListElement.appendChild(addLevelElement);
  members.appendChild(addListElement);
}
*/

function addIcon(src, style) {
  let spanElement = document.createElement('span'),
    buttonImg = document.createElement('img');

  spanElement.classList = 'icon';
  buttonImg.src = src;
  buttonImg.style = style;

  spanElement.appendChild(buttonImg);
  return spanElement;
}
function switchButton(name) {
  let labelElement = document.createElement('label'),
    inputElement = document.createElement('input'),
    spanElement = document.createElement('span');

  labelElement.classList = 'switch';
  inputElement.type = 'checkbox';
  inputElement.id = name + 'OnOff';
  inputElement.addEventListener('click', attendanceCheck);
  spanElement.classList = 'slider round';

  labelElement.appendChild(inputElement);
  labelElement.appendChild(spanElement);

  return labelElement;
}
function deleteMember(event) {
  const confirmDelete = confirm('Do you want to delete this member?');
  if (confirmDelete === true) {
    const button = event.target,
      li = button.closest('ul > li'),
      id = li.id;
    members.removeChild(li);
    for (let i = 0; i < memberObject.length; i++) {
      if (memberObject[i]['name'] === id) {
        memberObject.splice(i, 1);
      }
    }
    setMemberStorage(memberObject);
  }
}

// Player
function attendanceCheck(event) {
  const inputId = event.target.id,
    li = event.target.closest('ul > li'),
    name = li.id,
    checker = document.getElementById(inputId);
  if (checker.checked === true) {
    for (let i = 0; i < memberObject.length; i++) {
      if (memberObject[i]['name'] === name) {
        memberObject[i]['attend'] = true;
        playerOnBench(name);
      }
    }
  } else {
    for (let i = 0; i < memberObject.length; i++) {
      if (memberObject[i]['name'] === name) {
        memberObject[i]['attend'] = false;
        playerAbsent(name);
      }
    }
  }
  setMemberStorage(memberObject);
  playerNumber();
  teamNumber();
}
function playerOnBench(name) {
  const getGridDiv = document.getElementById('playerOnBench'),
    addPElement = document.createElement('p');
  addPElement.classList =
    'button is-capitalized is-info is-inverted is-outlined';
  addPElement.id = name + 'Player';
  addPElement.innerHTML = name;
  getGridDiv.append(addPElement);
}
function playerAbsent(name) {
  const getGridDiv = document.getElementById('playerOnBench'),
    absentPlayer = document.getElementById(name + 'Player');
  getGridDiv.removeChild(absentPlayer);
}
function playerNumber() {
  const playerNumber = document.getElementById('playerNumber');
  let playerCount = 0;
  for (let i = 0; i < memberObject.length; i++) {
    if (memberObject[i]['attend'] === true) {
      playerCount++;
    }
  }
  playerNumber.innerText = playerCount;
  return playerCount;
}
function teamNumber() {
  const teamNumber = document.getElementById('teamNumber');
  let teamCount = playerNumber() / 2;
  teamNumber.innerText = teamCount;
  return Math.floor(teamCount);
}

// Match up team members
function getTeamList(playerlist) {
  let sList = shuffle(playerlist);
  do {
    addTeamToList(sList);
    teamMatchTolerance += 0.1;
  } while (totalTeamList.length < teamNumber());
  return totalTeamList;
}
function addTeamToList(playerlist) {
  let playerAverage = getPlayerLevelAverage(playerlist);
  if (teamUp(playerlist, playerAverage)) {
    totalTeamList.push(teamUp(playerlist, playerAverage));
  }
  if (totalTeamList) {
    for (let i = 0; i < totalTeamList.length; i++) {
      for (let j = 0; j < playerlist.length; j++) {
        totalTeamList[i].forEach((element) => {
          if (element['name'] === playerlist[j]['name']) {
            playerlist.splice(j, 1);
          }
        });
      }
    }
  }
  return totalTeamList;
}
function teamUp(list, playerAverage) {
  if (list.length > 1) {
    for (let i = 1; i < list.length; i++) {
      let calc =
        playerAverage -
        (Number(list[0]['level']) + Number(list[i]['level'])) / 2;
      if (Math.abs(calc) < teamMatchTolerance) {
        let tempList = [];
        tempList.push(list[0]);
        tempList.push(list[i]);
        return tempList;
      }
    }
  }
}
function getPlayerList() {
  let playerList = new Array();
  for (let i = 0; i < memberObject.length; i++) {
    if (memberObject[i]['attend'] === true) {
      playerList.push(memberObject[i]);
    }
  }
  return playerList;
}
function getPlayerLevelAverage(playerlist) {
  let totalLevel = 0;
  for (let i = 0; i < playerlist.length; i++) {
    totalLevel += Number(playerlist[i]['level']);
  }
  return totalLevel / playerlist.length;
}
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

/* not used
function averageCalcResult(playerAverage, firstPlayer, secondPlayer) {
  return (
    Number(playerAverage) - (Number(firstPlayer) + Number(secondPlayer)) / 2
  );
}
function getPlayerLevel(index) {
  let playerLevel,
    playerlist = getPlayerList();
  for (let i = 0; i < playerlist.length; i++) {
    if (i === index) {
      playerLevel = Number(playerlist[index]['level']);
    }
  }
  return playerLevel;
}
*/

// Team list display
function teamListDisplay() {
  const teamListElement = document.getElementById('teamList');
  getTeamList(getPlayerList());
  for (let i = 0; i < totalTeamList.length; i++) {
    let teamNameElement = document.createElement('p'),
      teamName =
        totalTeamList[i][0]['name'] + ' & ' + totalTeamList[i][1]['name'];
    teamNameNode = document.createTextNode(teamName);
    teamNameElement.classList = 'is-size-5 is-capitalized';
    teamNameElement.appendChild(teamNameNode);
    teamListElement.appendChild(teamNameElement);
  }
  playerDeHighlight();
  playerHighlight();
}
function playerDeHighlight() {
  let playerList = getPlayerList();
  for (let i = 0; i < playerList.length; i++) {
    let name = playerList[i]['name'],
      playerId = name + 'Player',
      playerElement = document.getElementById(playerId);
    playerElement.classList =
      'button is-capitalized is-info is-inverted is-outlined';
  }
}
function playerHighlight() {
  for (let i = 0; i < totalTeamList.length; i++) {
    for (let j = 0; j < totalTeamList[i].length; j++) {
      let name = totalTeamList[i][j]['name'],
        playerId = name + 'Player',
        playerElement = document.getElementById(playerId);
      playerElement.classList =
        'button is-capitalized is-info is-inverted is-outlined is-hovered';
    }
  }
}

// Court
function upArrow() {
  let currentNumberElement = document.getElementById('courtNumber'),
    currentNumber = currentNumberElement.innerText,
    newNumber = Number(currentNumber) + 1;
  setCourtNumber(newNumber);
}
function downArrow() {
  let currentNumberElement = document.getElementById('courtNumber'),
    currentNumber = currentNumberElement.innerText,
    newNumber = Number(currentNumber) - 1;
  setCourtNumber(newNumber);
}
function setCourtNumber(number) {
  let currentNumberElement = document.getElementById('courtNumber');
  if (number >= 1) {
    currentNumberElement.innerHTML = number;
  } else {
    currentNumberElement.innerHTML = 1;
  }
}
function setCourtTile(firstTeam, secondTeam) {
  let tileParent = document.getElementById('courtTile'),
    addArticleElement = document.createElement('article'),
    addFirstTeamElement = document.createElement('p'),
    addVsElement = document.createElement('p'),
    addSecondTeamElement = document.createElement('p');

  addArticleElement.classList = 'tile is-child box';
  addFirstTeamElement.classList = 'subtitle';
  addVsElement.classList = 'subtitle is-size-6';
  addSecondTeamElement.classList = 'subtitle';

  addArticleElement.appendChild(addFirstTeamElement);
  addArticleElement.appendChild(addVsElement);
  addArticleElement.appendChild(addSecondTeamElement);
  tileParent.appendChild(addArticleElement);
}
function addCourt() {
  let courtNumber = document.getElementById('courtNumber').innerHTML,
    tileNumber = document.getElementById('courtTile').childElementCount;
}

// Localstorage
function checkExistingMemberName(name) {
  for (let i = 0; i < sortedObject(memberObject).length; i++) {
    if (name === memberObject[i]['name']) {
      return true;
    } else {
      return false;
    }
  }
}
function setMemberToStorage(name, level) {
  let memberObj = new Object();
  memberObj.name = name.toLowerCase();
  memberObj.level = level;
  memberObj.attend = false;
  memberObj.oncourt = false;
  memberObject.push(memberObj);

  setMemberStorage(memberObject);
  memberToList(name);
}

function setMemberStorage(list) {
  lStorage.setItem('members', JSON.stringify(list));
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
  if (checkExistingMemberName(getNameInput())) {
    alert('Same named member exist \n' + 'Please use another name');
  } else {
    setMemberToStorage(getNameInput(), getLevelInput());
    deactiveModal();
  }
}

// Initialise member and player list on start
function sortedObject(object) {
  let lst = [];
  for (let i = 0; i < object.length; i++) {
    lst.push(object[i]['name']);
  }
  lst.sort();
  return lst;
}
function initMemberList() {
  for (let i = 0; i < sortedObject(memberObject).length; i++) {
    memberToList(sortedObject(memberObject)[i]);
  }
  initPlayerList();
}
function initPlayerList() {
  const getGridDiv = document.getElementById('playerOnBench');
  for (let i = 0; i < memberObject.length; i++) {
    if (memberObject[i]['attend'] === true) {
      let name = memberObject[i]['name'],
        inputId = name + 'OnOff',
        inputElement = document.getElementById(inputId),
        addPElement = document.createElement('p');
      addPElement.classList =
        'button is-capitalized is-info is-inverted is-outlined';
      addPElement.innerHTML = name;
      addPElement.id = name + 'Player';
      getGridDiv.appendChild(addPElement);
      inputElement.checked = true;
    }
  }
  playerNumber();
  teamNumber();
  teamListDisplay();
}
function init() {
  if (memberObject !== null) {
    initMemberList();
  } else {
    memberObject = new Array();
  }
}
init();
