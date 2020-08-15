let memberList = new Array(),
  playerList = new Array(),
  totalTeamList = new Array(),
  matchList = new Array(),
  lStorage = window.localStorage,
  members = document.getElementById('members'),
  memberObject = getObject('members'),
  teamlistObject = getObject('teamlist'),
  matchlistObject = getObject('matchlist'),
  tileAncestor = document.getElementById('courtTile'),
  teamMatchTolerance = 0.2;

// General element creation
function divElement() {
  return document.createElement('div');
}
function pElement() {
  return document.createElement('p');
}

// Generate and display member list on side menu
function memberToList(name) {
  let addListElement = document.createElement('li'),
    addCardElement = divElement(),
    deleteButtonImg = addIcon(
      'img/user-minus-solid.svg',
      'width:3rem; cursor:pointer'
    ),
    switchBtn = switchButton(name),
    memberName = document.createTextNode(name),
    cardContent = document.createElement('card-content'),
    cardFooter = document.createElement('footer'),
    namePElement = pElement(),
    delBtnItem = divElement(),
    switchBtnItem = divElement();

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
    location.reload();
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
    addPElement = pElement();
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

// Team list display
function teamListDisplay() {
  const teamListElement = document.getElementById('teamList');
  getTeamList(getPlayerList());
  for (let i = 0; i < totalTeamList.length; i++) {
    let teamNameElement = pElement(),
      teamName =
        totalTeamList[i][0]['name'] + ' & ' + totalTeamList[i][1]['name'];
    teamNameNode = document.createTextNode(teamName);
    teamNameElement.classList = 'is-size-5 is-capitalized';
    teamNameElement.appendChild(teamNameNode);
    teamListElement.appendChild(teamNameElement);
  }
  playerDeHighlight();
  playerHighlight();
  getMatchList();
  firstCourtInit();
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
    currentNumber = Number(currentNumberElement.innerText),
    newNumber = currentNumber + 1;
  setCourtNumber(newNumber);
  addCourt();
}
function downArrow() {
  let currentNumberElement = document.getElementById('courtNumber'),
    currentNumber = Number(currentNumberElement.innerText),
    newNumber = currentNumber - 1;

  setCourtNumber(newNumber);
  extractCourt();
}
function setCourtNumber(newnumber) {
  let currentNumberElement = document.getElementById('courtNumber'),
    number;
  if (newnumber > Math.floor(teamNumber() / 2)) {
    number = Math.floor(teamNumber() / 2);
  } else {
    number = newnumber;
  }
  if (number >= 1) {
    currentNumberElement.innerHTML = number;
  } else {
    currentNumberElement.innerHTML = 1;
  }
}

function getMatchList() {
  for (let i = 0; i < totalTeamList.length; i++) {
    for (let j = i + 1; j < totalTeamList.length; j++) {
      let tempList = [];
      tempList.push(totalTeamList[i]);
      tempList.push(totalTeamList[j]);
      tempList.sort();
      matchList.push(tempList);
    }
  }
  Array.from(new Set(matchList));
  return matchList;
}

function addCourt() {
  let matchListId;
  for (let i = 0; i < matchList.length; i++) {
    if (
      matchList[i][0][0]['oncourt'] !== true &&
      matchList[i][0][1]['oncourt'] !== true &&
      matchList[i][1][0]['oncourt'] !== true &&
      matchList[i][1][1]['oncourt'] !== true
    ) {
      let firstTeamName =
          matchList[i][0][0]['name'] + ' & ' + matchList[i][0][1]['name'],
        secondTeamName =
          matchList[i][1][0]['name'] + ' & ' + matchList[i][1][1]['name'],
        tempPlayerList = [
          matchList[i][0][0]['name'],
          matchList[i][0][1]['name'],
          matchList[i][1][0]['name'],
          matchList[i][1][1]['name'],
        ];
      matchListId = i;
      for (let i = 0; i < memberObject.length; i++) {
        for (let j = 0; j < tempPlayerList.length; j++) {
          if (memberObject[i]['name'] === tempPlayerList[j]) {
            memberObject[i]['oncourt'] = true;
          }
        }
      }
      setMemberStorage(memberObject);
      arrangeTeamOnCourt(firstTeamName, secondTeamName, matchListId);
      return;
    }
  }
}
function extractCourt() {
  let courtTile = document.getElementById('courtTile'),
    courtTileLast = courtTile.lastChild,
    selectedMatch = matchList[courtTileLast.id],
    tempPlayerList = [
      selectedMatch[0][0]['name'],
      selectedMatch[0][1]['name'],
      selectedMatch[1][0]['name'],
      selectedMatch[1][1]['name'],
    ];

  if (courtTile.childElementCount > 1) {
    courtTile.removeChild(courtTile.lastChild);
    for (let i = 0; i < memberObject.length; i++) {
      for (let j = 0; j < tempPlayerList.length; j++) {
        if (memberObject[i]['name'] === tempPlayerList[j]) {
          memberObject[i]['oncourt'] = false;
        }
      }
    }
    setMemberStorage(memberObject);
  } else {
    return;
  }
}

function arrangeTeamOnCourt(firstTeam, secondTeam, matchlistindex) {
  let addTileParent = divElement(),
    addArticleElement = document.createElement('article'),
    addFirstTeamElement = pElement(),
    firstTeamNode = document.createTextNode(firstTeam),
    addVsElement = pElement(),
    vsNode = document.createTextNode('VS'),
    addSecondTeamElement = pElement(),
    secondTeamNode = document.createTextNode(secondTeam);

  addArticleElement.classList = 'tile is-child box has-background-warning';
  addFirstTeamElement.classList = 'subtitle is-capitalized';
  addVsElement.classList = 'subtitle is-size-6';
  addSecondTeamElement.classList = 'subtitle is-capitalized';
  addTileParent.classList = 'tile is-parent';

  addFirstTeamElement.appendChild(firstTeamNode);
  addVsElement.appendChild(vsNode);
  addSecondTeamElement.appendChild(secondTeamNode);
  addArticleElement.appendChild(addFirstTeamElement);
  addArticleElement.appendChild(addVsElement);
  addArticleElement.appendChild(addSecondTeamElement);
  addTileParent.appendChild(addArticleElement);
  addTileParent.id = matchlistindex;
  tileAncestor.appendChild(addTileParent);
}
function removeAllChild(parentid) {
  let parentElement = document.getElementById(parentid);
  while (parentElement.firstChild) {
    parentElement.removeChild(parentElement.lastChild);
  }
}
function matchListComparison(firstcourtmatch, secondcourtmatch) {
  for (let i = 0; i < firstcourtmatch.length; i++) {
    for (let j = 0; j < secondcourtmatch.length; j++) {
      if (firstcourtmatch[i] === secondcourtmatch[j]) {
        return true;
      }
    }
  }
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
function setTeamListStorage(list) {
  lStorage.setItem('teamlist', JSON.stringify(list));
}
function setMatchListStorage(list) {
  lStorage.setItem('matchlist', JSON.stringify(list));
}

function getObject(object) {
  let lStorageObject = lStorage.getItem(object);
  parsedObj = JSON.parse(lStorageObject);
  return parsedObj;
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
    location.reload();
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
        addPElement = pElement();
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
  playerOncourtInit();
  firstCourtInit();
}
function playerOncourtInit() {
  for (let i = 0; i < memberObject.length; i++) {
    memberObject[i]['oncourt'] = false;
  }
}

function initCourtTile(firstTeam, secondTeam) {
  removeAllChild('courtTile');
  arrangeTeamOnCourt(firstTeam, secondTeam, 0);
}
function firstCourtInit() {
  // matchList[nth match][nth team(0 or 1)][nth person(0 or 1)]['name']
  let firstTeamName =
      matchList[0][0][0]['name'] + ' & ' + matchList[0][0][1]['name'],
    secondTeamName =
      matchList[0][1][0]['name'] + ' & ' + matchList[0][1][1]['name'],
    tempPlayerList = [
      matchList[0][0][0]['name'],
      matchList[0][0][1]['name'],
      matchList[0][1][0]['name'],
      matchList[0][1][1]['name'],
    ];

  for (let i = 0; i < memberObject.length; i++) {
    for (let j = 0; j < tempPlayerList.length; j++) {
      if (memberObject[i]['name'] === tempPlayerList[j]) {
        memberObject[i]['oncourt'] = true;
      }
    }
  }
  setMemberStorage(memberObject);
  initCourtTile(firstTeamName, secondTeamName);
}

function init() {
  if (memberObject !== null) {
    initMemberList();
  } else {
    memberObject = new Array();
  }
}
init();
