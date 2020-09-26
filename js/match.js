// 'use strict';

let memberList = new Array(),
  totalTeamList = new Array(),
  playerList = () => {
    let lst = new Array();
    for (let i = 0; i < memberObject.length; i++) {
      if (memberObject[i]['attend'] === true) {
        lst.push(memberObject[i]);
      }
    }
    return lst;
  },
  pList = new Array(),
  lStorage = window.localStorage,
  members = document.getElementById('members'),
  memberObject = getObject('members'),
  courtField = document.getElementById('courtTile'),
  levelAverage,
  teamMatchTolerance = 0.1,
  playMinute = 10,
  playSecond = playMinute * 60;

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
  addListElement.id = name + 'Member';
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
      if (memberObject[i]['name'] === id.slice(0, -6)) {
        memberObject.splice(i, 1);
      }
    }
    setMemberStorage(memberObject);
    rearrangeTeam();
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
      if (memberObject[i]['name'] === name.slice(0, -6)) {
        memberObject[i]['attend'] = true;
        playerOnBench(name.slice(0, -6));
      }
    }
  } else {
    for (let i = 0; i < memberObject.length; i++) {
      if (memberObject[i]['name'] === name.slice(0, -6)) {
        memberObject[i]['attend'] = false;
        playerAbsent(name.slice(0, -6));
      }
    }
  }
  setPlayerList();
  setMemberStorage(memberObject);
  playerNumber();
  teamNumber();
  rearrangeTeam();
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
function rearrangeTeam() {
  removeAllChild('members');
  removeAllChild('teamList');
  removeAllChild('playerOnBench');

  pList = [];
  totalTeamList = [];

  setTimeout(() => {
    initMemberList();
  }, 1);
}

function verifyTeamLevel(playerAverage) {
  for (let i = 0; i < totalTeamList.length; i++) {
    if (Math.abs(getTeamAverage(totalTeamList[i]) - playerAverage) > 0.5) {
      totalTeamList[i].forEach((element) => {
        element['oncourt'] = false;
      });
      totalTeamList.splice(i, 1);
    }
  }
}
function getTeamAverage(list) {
  return (Number(list[0]['level']) + Number(list[1]['level'])) / 2;
}
function getTeamList(playerlst) {
  do {
    for (let i = 0; i < playerlst.length; i++) {
      addTeamToList(playerlst);
    }
    teamMatchTolerance += 0.05;
  } while (totalTeamList.length < teamNumber());
  verifyTeamLevel(getPlayerLevelAverage());
  teamMatchTolerance = 0.1;
  return totalTeamList;
}

function addTeamToList(playerlst) {
  let playerAverage = getPlayerLevelAverage();
  for (let k = 0; k < playerlst.length; k++) {
    let upTeam = teamUp(playerlst, playerAverage);
    if (upTeam) {
      totalTeamList.push(upTeam);
      for (let i = 0; i < totalTeamList.length; i++) {
        for (let j = 0; j < pList.length; j++) {
          totalTeamList[i].forEach((element) => {
            if (element['name'] === pList[j]['name']) {
              pList.splice(j, 1);
              return upTeam;
            }
          });
        }
      }
    }
  }
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
function setPlayerList() {
  pList = [];
  for (let i = 0; i < memberObject.length; i++) {
    if (memberObject[i]['attend'] === true) {
      pList.push(memberObject[i]);
    }
  }
  return pList;
}
function getPlayerLevelAverage() {
  let totalLevel = 0;
  for (let i = 0; i < playerList().length; i++) {
    totalLevel += Number(playerList()[i]['level']);
  }
  return totalLevel / playerList().length;
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
function teamListDisplay(playerlst) {
  getTeamList(playerlst);
  updateTeamListDisplay();
  playerOnCourtHighlight();
  firstCourtInit();
}
function updateTeamListDisplay() {
  const teamListElement = document.getElementById('teamList');
  singleTeamToPlayerList();
  removeAllChild('teamList');
  for (let i = 0; i < totalTeamList.length; i++) {
    let teamNameElement = pElement(),
      teamName =
        totalTeamList[i][0]['name'] + ' & ' + totalTeamList[i][1]['name'],
      teamNameNode = document.createTextNode(teamName);
    teamNameElement.classList = 'is-size-5 is-capitalized';
    teamNameElement.appendChild(teamNameNode);
    teamListElement.appendChild(teamNameElement);
  }
}
function singleTeamToPlayerList() {
  if (totalTeamList.length === 1) {
    for (let i = 0; i < totalTeamList[0].length; i++) {
      pList.unshift(totalTeamList[0][i]);
    }
    totalTeamList.splice(0, 1);
    getTeamList(pList);
    updateTeamListDisplay();
    playerOnCourtHighlight();
    firstCourtInit();
  }
  if (totalTeamList.length < 1) {
    getTeamList(pList);
    updateTeamListDisplay();
    playerOnCourtHighlight();
    firstCourtInit();
  }
}
function playerDeHighlight() {
  for (let i = 0; i < memberObject.length; i++) {
    if (
      memberObject[i]['oncourt'] !== true &&
      memberObject[i]['attend'] === true
    ) {
      let name = memberObject[i]['name'],
        playerId = name + 'Player',
        playerElement = document.getElementById(playerId);
      if (playerElement) {
        playerElement.classList =
          'button is-capitalized is-info is-inverted is-outlined';
        playerElement.style = '';
      }
    }
  }
}
function playerHighlight() {
  for (let i = 0; i < memberObject.length; i++) {
    if (
      memberObject[i]['oncourt'] === true &&
      memberObject[i]['attend'] === true
    ) {
      let name = memberObject[i]['name'],
        playerId = name + 'Player',
        playerElement = document.getElementById(playerId);
      if (playerElement) {
        playerElement.classList =
          'button is-capitalized is-info is-inverted is-outlined is-hovered';
      }
    }
  }
}
function playerNotInTeam() {
  if (pList) {
    for (let i = 0; i < pList.length; i++) {
      let name = pList[i]['name'],
        playerId = name + 'Player',
        playerElement = document.getElementById(playerId);
      if (playerElement) {
        playerElement.classList = 'button is-capitalized is-info is-outlined';
        playerElement.style =
          'color: hsl(0, 0%, 71%); border-color: hsl(0, 0%, 71%)';
      }
    }
  }
}

function playerOnCourtHighlight() {
  playerDeHighlight();
  playerHighlight();
  playerNotInTeam();
}

// Court
function upArrow() {
  let currentNumberElement = document.getElementById('courtNumber'),
    currentNumber = Number(currentNumberElement.innerText),
    newNumber = currentNumber + 1;
  setCourtNumber(newNumber);
  addCourt();
  playerOnCourtHighlight();
  courtNumberUpdate();
}
function downArrow() {
  let currentNumberElement = document.getElementById('courtNumber'),
    currentNumber = Number(currentNumberElement.innerText),
    newNumber = currentNumber - 1;
  setCourtNumber(newNumber);
  extractCourt();
  playerOnCourtHighlight();
  courtNumberUpdate();
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

function addCourt() {
  for (let i = 0; i < totalTeamList.length; i += 2) {
    if (
      totalTeamList[i][0]['oncourt'] !== true &&
      totalTeamList[i][1]['oncourt'] !== true &&
      totalTeamList[i + 1][0]['oncourt'] !== true &&
      totalTeamList[i + 1][1]['oncourt'] !== true
    ) {
      let firstTeamName =
          totalTeamList[i][0]['name'] + ' & ' + totalTeamList[i][1]['name'],
        secondTeamName =
          totalTeamList[i + 1][0]['name'] +
          ' & ' +
          totalTeamList[i + 1][1]['name'],
        tempPlayerList = [
          totalTeamList[i][0]['name'],
          totalTeamList[i][1]['name'],
          totalTeamList[i + 1][0]['name'],
          totalTeamList[i + 1][1]['name'],
        ];
      for (let i = 0; i < memberObject.length; i++) {
        for (let j = 0; j < tempPlayerList.length; j++) {
          if (memberObject[i]['name'] === tempPlayerList[j]) {
            memberObject[i]['oncourt'] = true;
          }
        }
      }
      setMemberStorage(memberObject);
      arrangeTeamOnCourt(firstTeamName, secondTeamName);
      return;
    }
  }
}
let getSelectedTeams = (element) => {
  let playerNames = element.querySelector('.hero-body'),
    firstTeam = playerNames.firstChild.innerText.split(' & '),
    secondTeam = playerNames.lastChild.innerText.split(' & '),
    playerlst = [];
  firstTeam.forEach((element) => {
    playerlst.push(element);
  });
  secondTeam.forEach((element) => {
    playerlst.push(element);
  });
  return playerlst;
};
function extractCourt() {
  let courtField = document.getElementById('courtTile'),
    courtTileLast = courtField.lastChild,
    selectedTeams = getSelectedTeams(courtTileLast),
    tempPlayerList = [
      selectedTeams[0],
      selectedTeams[1],
      selectedTeams[2],
      selectedTeams[3],
    ];

  if (courtField.childElementCount > 1) {
    courtField.removeChild(courtTileLast);
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
function arrangeTeamOnCourt(firstTeam, secondTeam) {
  let addCourt = document.createElement('article'),
    courtHero = addCourtHero(firstTeam, secondTeam);

  addCourt.appendChild(courtHero);
  courtField.appendChild(addCourt);
}
let initialTimeCount = () => {
  let timeElement = document.getElementById('timecount'),
    minutes = Math.floor(playSecond / 60),
    seconds = playSecond % 60;
  timeElement.innerText = `${minutes}:${
    seconds < 10 ? `0${seconds}` : `${seconds}`
  }`;
};

function addCourtHero(firstTeam, secondTeam) {
  let courtHero = divElement(),
    courtHeroHead = addCourtHeroHead(),
    courtHeroBody = addCourtHeroBody(firstTeam, secondTeam);
  courtHero.classList = 'hero has-text-centered box';
  courtHero.style = 'margin: 0.5rem; padding: 0';
  courtHero.appendChild(courtHeroHead);
  courtHero.appendChild(courtHeroBody);
  return courtHero;
}
function addCourtHeroHead() {
  let courtHeroHead = divElement(),
    courtHeadLabel = pElement(),
    courtHeadNumber = pElement();

  courtHeroHead.classList = 'hero-head';
  courtHeadLabel.classList = 'label is-size-4';
  courtHeadLabel.innerText = 'Court Number';
  courtHeadNumber.classList = 'courtnumber is-size-4';
  courtHeadNumber.contentEditable = 'true';

  courtHeroHead.appendChild(courtHeadLabel);
  courtHeroHead.appendChild(courtHeadNumber);
  return courtHeroHead;
}
function addCourtHeroBody(firstTeam, secondTeam) {
  let courtHeroBody = divElement(),
    addFirstTeamElement = pElement(),
    firstTeamNode = document.createTextNode(firstTeam),
    addVsElement = pElement(),
    vsNode = document.createTextNode('VS'),
    addSecondTeamElement = pElement(),
    secondTeamNode = document.createTextNode(secondTeam);

  courtHeroBody.classList = 'hero-body has-background-warning';
  addFirstTeamElement.classList = 'subtitle is-capitalized is-size-4';
  addVsElement.classList = 'subtitle is-size-6';
  addSecondTeamElement.classList = 'subtitle is-capitalized is-size-4';

  addFirstTeamElement.appendChild(firstTeamNode);
  addVsElement.appendChild(vsNode);
  addSecondTeamElement.appendChild(secondTeamNode);
  courtHeroBody.appendChild(addFirstTeamElement);
  courtHeroBody.appendChild(addVsElement);
  courtHeroBody.appendChild(addSecondTeamElement);
  return courtHeroBody;
}

function startCountDown() {
  let timeElement = document.getElementById('timecount'),
    playtime = playSecond;

  let timerInterval = setInterval(() => {
    if (playtime === 0) {
      timeElement.innerText = '0:00';
      clearInterval(timerInterval);
      beepEffect();
      do {
        deleteCourt();
      } while (courtTile.childElementCount > 0);
      removeAllChild('teamList');
      updateTeamListDisplay();
      playerOnCourtHighlight();
      courtNumberUpdate();
    } else {
      console.log(playtime);
      console.log(playSecond);
      let minutes = Math.floor(playtime / 60),
        seconds = playtime % 60;
      timeElement.innerText = `${minutes}:${
        seconds < 10 ? `0${seconds}` : `${seconds}`
      }`;
      playtime--;
    }
  }, 1000);
}

function removeAllChild(parentid) {
  let parentElement = document.getElementById(parentid);
  while (parentElement.firstChild) {
    parentElement.removeChild(parentElement.lastChild);
  }
}

function finishGame() {
  const confirmDelete = confirm('Do you want to finish this game?'),
    courtTile = document.getElementById('courtTile');

  if (confirmDelete === true) {
    do {
      deleteCourt();
    } while (courtTile.childElementCount > 0);
    removeAllChild('teamList');
    updateTeamListDisplay();
    addCourt();
    playerOnCourtHighlight();
    courtNumberUpdate();
  }
}
function deleteCourt() {
  const courtTile = document.getElementById('courtTile');
  let firstCourt = courtTile.firstChild,
    selectedTeams = getSelectedTeams(firstCourt),
    tempPlayerList = [
      selectedTeams[0],
      selectedTeams[1],
      selectedTeams[2],
      selectedTeams[3],
    ];

  if (tempPlayerList) {
    for (let i = 0; i < memberObject.length; i++) {
      for (let j = 0; j < tempPlayerList.length; j++) {
        if (memberObject[i]['name'] === tempPlayerList[j]) {
          memberObject[i]['oncourt'] = false;
        }
      }
    }
    for (let k = 0; k < totalTeamList.length; k++) {
      for (let l = 0; l < tempPlayerList.length; l += 2) {
        if (
          totalTeamList[k][0]['name'] === tempPlayerList[l] &&
          totalTeamList[k][1]['name'] === tempPlayerList[l + 1]
        ) {
          pList.push(totalTeamList[k][0]);
          pList.push(totalTeamList[k][1]);
          totalTeamList.splice(k, 1);
        }
      }
    }
    setMemberStorage(memberObject);
    firstCourt.remove();
  } else {
    return;
  }
}
function courtNumberUpdate() {
  const courtTile = document.getElementById('courtTile').childElementCount;
  let courtNumber = document.getElementById('courtNumber');
  courtNumber.innerText = courtTile;
}
function beepEffect() {
  let beep = new Audio();
  beep.src = 'media/beep.mp3';
  beep.play();
}

// modal

function toggleMemberList() {
  let memberListElement = document.getElementById('memberlist'),
    dashboardElement = document.getElementById('dashboard');
  memberListElement.classList.toggle('memberlist');
  dashboardElement.classList.toggle('memberlist');
  memberButton();
}

function memberButton() {
  let memberListElement = document.getElementById('memberlist'),
    arrowPath = document.getElementById('arrowPath');
  arrowbutton = document.getElementById('arrowBtn');

  if (memberListElement.classList.contains('memberlist')) {
    arrowbutton.style = 'margin-left:1rem; transform: translateY(-30%)';
    arrowPath.setAttribute(
      'd',
      'M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41z'
    );
  } else {
    arrowbutton.style = 'margin-left:1rem; transform: translateY(30%)';
    arrowPath.setAttribute(
      'd',
      'M279 224H41c-21.4 0-32.1-25.9-17-41L143 64c9.4-9.4 24.6-9.4 33.9 0l119 119c15.2 15.1 4.5 41-16.9 41z'
    );
  }
}
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
function checkExistingMemberName(name) {
  for (let i = 0; i < sortedObject(memberObject).length; i++) {
    if (name === memberObject[i]['name']) {
      return true;
    }
  }
}
function addBtn() {
  if (checkExistingMemberName(getNameInput()) === true) {
    alert('Same named member exist \n' + 'Please use another name');
  } else {
    setMemberToStorage(getNameInput(), getLevelInput());
    deactiveModal();
  }
}

// Localstorage
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
function setClubName() {
  let clubname = document.getElementById('clubname').value;
  lStorage.setItem('clubname', JSON.stringify(clubname));
}
function getObject(object) {
  let lStorageObject = lStorage.getItem(object),
    parsedObj = JSON.parse(lStorageObject);
  return parsedObj;
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
function initClubName() {
  let clubname = document.getElementById('clubname');
  if (getObject('clubname')) {
    clubname.value = getObject('clubname');
  } else {
    clubname.value = 'Enter your club name.';
  }
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
      pList.push(memberObject[i]);
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
  teamListDisplay(shuffle(pList));
  playerOncourtInit();
  firstCourtInit();
  playerOnCourtHighlight();
  initialTimeCount();
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
  if (totalTeamList.length !== 0) {
    let firstTeamName =
        totalTeamList[0][0]['name'] + ' & ' + totalTeamList[0][1]['name'],
      secondTeamName =
        totalTeamList[1][0]['name'] + ' & ' + totalTeamList[1][1]['name'],
      tempPlayerList = [
        totalTeamList[0][0]['name'],
        totalTeamList[0][1]['name'],
        totalTeamList[1][0]['name'],
        totalTeamList[1][1]['name'],
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
}

function init() {
  initClubName();
  if (memberObject !== null) {
    initMemberList();
  } else {
    memberObject = [
      { name: 'member1', level: '7', attend: true, oncourt: false },
      { name: 'member2', level: '9', attend: false, oncourt: false },
      { name: 'member3', level: '4', attend: true, oncourt: false },
      { name: 'member4', level: '3', attend: false, oncourt: false },
      { name: 'member5', level: '4', attend: true, oncourt: true },
      { name: 'member6', level: '5', attend: true, oncourt: false },
      { name: 'member7', level: '3', attend: true, oncourt: true },
      { name: 'member8', level: '3', attend: true, oncourt: false },
      { name: 'member9', level: '6', attend: true, oncourt: true },
      { name: 'member10', level: '5', attend: true, oncourt: true },
      { name: 'member11', level: '6', attend: true, oncourt: true },
      { name: 'member12', level: '7', attend: true, oncourt: true },
    ];
    setMemberStorage(memberObject);
    initMemberList();
  }
}
init();
