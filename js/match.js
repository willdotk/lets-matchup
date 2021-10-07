// 'use strict';

let memberList = new Array(),
  totalTeamList = new Array(),
  totalMatchTeamList = new Array(),
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
  initPList = playerList(),
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
      '../img/user-minus-solid.svg',
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
  let teamCount = totalTeamList.length;
  teamNumber.innerText = teamCount;
  return Math.floor(teamCount);
}

// Match up team members
function rearrangeTeam() {
  pList = [];
  totalTeamList = [];
  totalMatchTeamList = [];

  removeAllChild('members');
  matchCount();
  removeAllChild('playerOnBench');


  setTimeout(() => {
    initMemberList();
  }, 1);
}
function getTeamAverage(team) {
  return (Number(team[0]['level']) + Number(team[1]['level'])) / 2;
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
function teamListToTeamMatchList(list) {
  for (let i = 0; i < list.length; i++) {
    totalMatchTeamList.push(list[i]);
  }
}

function getTeamList(playerlst) {
  let lst = shuffle(playerlst);
  for (let i = 0; i < lst.length; i++) {
    teamUp(lst, getPlayerLevelAverage());
  }
}

function teamUp(list, playerAverage) {
  if (list.length > 1) {
    for (let i = 0; i < list.length - 1; i++) {
      for (let j = i + 1; j < list.length; j++) {
        let calc =
          playerAverage -
          (Number(list[i]['level']) + Number(list[j]['level'])) / 2;
        for (
          let tolerance = teamMatchTolerance;
          tolerance < 1;
          tolerance += 0.05
        ) {
          if (Math.abs(calc) < tolerance) {
            let tempList = [];
            tempList.push(list[i]);
            tempList.push(list[j]);
            tempList.sort();
            if (
              JSON.stringify(totalTeamList).includes(JSON.stringify(tempList))
            ) {
              continue;
            } else {
              totalTeamList.push(tempList);
            }
          }
        }
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
  // updateTeamListDisplay();
  playerOnCourtHighlight();
  firstCourtInit();
}
function matchCount(){
  const teamListElement = document.getElementById('teamList');
  let matchCount = totalMatchTeamList.length;
  teamListElement.innerText = matchCount;
}

function updateTeamListDisplay() {
  const teamListElement = document.getElementById('teamList');
  matchCount();
  for (let i = 0; i < totalTeamList.length; i++) {
    let teamNameElement = pElement(),
      teamName =
        totalTeamList[i][0]['name'] +
        ' & ' +
        totalTeamList[i][1]['name'],
      teamNameNode = document.createTextNode(teamName);
    teamNameElement.classList = 'is-size-5 is-capitalized';
    teamNameElement.appendChild(teamNameNode);
    teamListElement.appendChild(teamNameElement);
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
function playerOnCourtHighlight() {
  playerDeHighlight();
  playerHighlight();
}

// Match list
function getSingleMatchList() {
  for (let i = 0; i < totalTeamList.length - 1; i++) {
    for (let j = i + 1; j < totalTeamList.length; j++) {
        let tempList = [];
        tempList.push(totalTeamList[i]);
        tempList.push(totalTeamList[j]);
        tempList.sort();
        totalMatchTeamList.push(tempList);
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
  playerOnCourtHighlight();
  courtNumberUpdate();
  setCourtCount();
}
function downArrow() {
  let currentNumberElement = document.getElementById('courtNumber'),
    currentNumber = Number(currentNumberElement.innerText),
    newNumber = currentNumber - 1;
  setCourtNumber(newNumber);
  extractCourt();
  playerOnCourtHighlight();
  courtNumberUpdate();
  setCourtCount();
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
  let lst = shuffle(totalMatchTeamList);
  for (let i = 0; i < lst.length; i++) {
    if (
      lst[i][0][0]['oncourt'] !== true &&
      lst[i][0][1]['oncourt'] !== true &&
      lst[i][1][0]['oncourt'] !== true &&
      lst[i][1][1]['oncourt'] !== true &&
      lst[i][0][0]['name'] !== lst[i][1][0]['name'] &&
        lst[i][0][0]['name'] !== lst[i][1][1]['name'] &&
        lst[i][0][1]['name'] !== lst[i][1][0]['name'] &&
        lst[i][0][1]['name'] !== lst[i][1][1]['name'] &&
        Math.abs(
          getTeamAverage(lst[i][0]) -
            getTeamAverage(lst[i][1])
        ) <= 0.5
    ) {
      let firstTeamName =
          lst[i][0][0]['name'] +
          ' & ' +
          lst[i][0][1]['name'],
        secondTeamName =
          lst[i][1][0]['name'] +
          ' & ' +
          lst[i][1][1]['name'],
        tempPlayerList = [];

      tempPlayerList.push(lst[i][0][0]['name']);
      tempPlayerList.push(lst[i][0][1]['name']);
      tempPlayerList.push(lst[i][1][0]['name']);
      tempPlayerList.push(lst[i][1][1]['name']);
      for (let k = 0; k < memberObject.length; k++) {
        for (let j = 0; j < tempPlayerList.length; j++) {
          if (memberObject[k]['name'] === tempPlayerList[j]) {
            memberObject[k]['oncourt'] = true;
          }
        }
      }
      setMemberStorage(memberObject);
      displayTeamOnCourt(firstTeamName, secondTeamName);
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
      selectedTeams[0].toLowerCase(),
      selectedTeams[1].toLowerCase(),
      selectedTeams[2].toLowerCase(),
      selectedTeams[3].toLowerCase(),
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
  } 
  else {
    return;
  }
}
function displayTeamOnCourt(firstTeam, secondTeam) {
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
  courtTile = document.getElementById('courtTile'),
  courtcount = Number(getObject('courtcount'));
  sec = playSecond

  let timerInterval = setInterval(() => {
    if (sec === 0) {
      timeElement.innerText = '0:00';
      clearInterval(timerInterval);
      beepEffect();
      do {
        deleteCourt();
      } while (courtTile.childElementCount > 0);
      matchCount();

      if (courtTile.childElementCount === 0) {
        for(let i = 0; i < courtcount; i++){
          addCourt();
        }
      }
      playerOnCourtHighlight();
      courtNumberUpdate();
    } else {
      let minutes = Math.floor(sec / 60),
        seconds = sec % 60;
      timeElement.innerText = `${minutes}:${
        seconds < 10 ? `0${seconds}` : `${seconds}`
      }`;
      sec--;
    }
  }, 1000);

}

function removeAllChild(parentid) {
  let parentElement = document.getElementById(parentid);
  while (parentElement.firstChild) {
    parentElement.removeChild(parentElement.lastChild);
  }
}

function timerReset(){
  let timer = document.getElementById('timer'),
  newTimeCount = pElement();
  newTimeCount.id = 'timecount';
  newTimeCount.classList = 'is-size-3';
  removeAllChild('timer');
  timer.appendChild(newTimeCount);
  initialTimeCount();
  playSecond = playMinute * 60;
}

function finishGame() {
  const confirmDelete = confirm('Do you want to finish this game?'),
    courtTile = document.getElementById('courtTile');

  let courtcount = Number(getObject('courtcount'));
  timerReset();
  if (confirmDelete === true){
    do {
      deleteCourt();
    } while (courtTile.childElementCount > 0);
    matchCount();

    if (courtTile.childElementCount === 0) {
      for(let i = 0; i < courtcount; i++){
        addCourt();
      }
    }
    playerOnCourtHighlight();
    courtNumberUpdate();

  }
}

function deleteCourt() {
  const courtTile = document.getElementById('courtTile');
  let firstCourt = courtTile.firstChild,
    selectedTeams = getSelectedTeams(firstCourt),
    tempPlayerList = [
      selectedTeams[0].toLowerCase(),
      selectedTeams[1].toLowerCase(),
      selectedTeams[2].toLowerCase(),
      selectedTeams[3].toLowerCase(),
    ];

  if (tempPlayerList) {
    for (let i = 0; i < memberObject.length; i++) {
      for (let j = 0; j < tempPlayerList.length; j++) {
        if (memberObject[i]['name'] === tempPlayerList[j]) {
          memberObject[i]['oncourt'] = false;
        }
      }
    }
    for(let k = 0; k < totalMatchTeamList.length; k++){
      console.log(tempPlayerList[1]);
      if(totalMatchTeamList[k][0][0]['name'] === tempPlayerList[0] &&
      totalMatchTeamList[k][0][1]['name'] === tempPlayerList[1] &&
      totalMatchTeamList[k][1][0]['name'] === tempPlayerList[2] &&
      totalMatchTeamList[k][1][1]['name'] === tempPlayerList[3]){
        totalMatchTeamList.splice(k,1);
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

function setOnBench() {
  for (let i = 0; i < memberObject.length; i++) {
    memberObject[i]['onbench'] = '0';
  }
  setMemberStorage(memberObject);
}

function setMemberStorage(list) {
  lStorage.setItem('members', JSON.stringify(list));
}
function setClubName() {
  let clubname = document.getElementById('clubname').value;
  lStorage.setItem('clubname', JSON.stringify(clubname));
}
function setCourtCount() {
  let courtcount = document.getElementById('courtNumber').innerText;
  lStorage.setItem('courtcount', JSON.stringify(courtcount));
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
  setOnBench();
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
  teamListDisplay(pList);
  teamNumber();
  playerOncourtInit();
  getSingleMatchList();
  matchCount();
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
  displayTeamOnCourt(firstTeam, secondTeam);
}

function firstCourtInit() {
  // matchList[nth match][nth team(0 or 1)][nth person(0 or 1)]['name']
  if (totalTeamList.length !== 0) {
    for (let k = 0; k < totalMatchTeamList.length; k++) {
      if (
        totalMatchTeamList[k][0][0]['oncourt'] !== true &&
        totalMatchTeamList[k][0][1]['oncourt'] !== true &&
        totalMatchTeamList[k][1][0]['oncourt'] !== true &&
        totalMatchTeamList[k][1][1]['oncourt'] !== true &&
        totalMatchTeamList[k][0][0]['name'] !== totalMatchTeamList[k][1][0]['name'] &&
        totalMatchTeamList[k][0][0]['name'] !== totalMatchTeamList[k][1][1]['name'] &&
        totalMatchTeamList[k][0][1]['name'] !== totalMatchTeamList[k][1][0]['name'] &&
        totalMatchTeamList[k][0][1]['name'] !== totalMatchTeamList[k][1][1]['name'] &&

        Math.abs(
          getTeamAverage(totalMatchTeamList[k][0]) -
            getTeamAverage(totalMatchTeamList[k][1])
        ) < 0.5
      ) {
        let firstTeamName =
            totalMatchTeamList[k][0][0]['name'] +
            ' & ' +
            totalMatchTeamList[k][0][1]['name'],
          secondTeamName =
            totalMatchTeamList[k][1][0]['name'] +
            ' & ' +
            totalMatchTeamList[k][1][1]['name'],
          tempPlayerList = [
            totalMatchTeamList[k][0][0]['name'],
            totalMatchTeamList[k][0][1]['name'],
            totalMatchTeamList[k][1][0]['name'],
            totalMatchTeamList[k][1][1]['name'],
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
        return;
      }
    }
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
