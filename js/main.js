// 'use strict';

let memberList = new Array(),
  playerList = new Array(),
  totalTeamList = new Array(),
  matchList = new Array(),
  lStorage = window.localStorage,
  members = document.getElementById('members'),
  memberObject = getObject('members'),
  tileAncestor = document.getElementById('courtTile'),
  teamMatchTolerance = 0.1,
  playMinute = 0.1,
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
function matchNumber() {
  const matchNumber = document.getElementById('matchNumber');
  let matchCount = matchList.length;
  matchNumber.innerText = matchCount;
  return Math.floor(matchCount);
}

// Match up team members
function getTeamList(playerlist) {
  let sList = shuffle(playerlist);
  do {
    for (let i = 0; i < playerlist.length; i++) {
      addTeamToList(sList);
    }
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
        totalTeamList[i][0]['name'] + ' & ' + totalTeamList[i][1]['name'],
      teamNameNode = document.createTextNode(teamName);
    teamNameElement.classList = 'is-size-5 is-capitalized';
    teamNameElement.appendChild(teamNameNode);
    teamListElement.appendChild(teamNameElement);
  }
  playerOnCourtHighlight();
  getMatchList();
  firstCourtInit();
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
      playerElement.classList =
        'button is-capitalized is-info is-inverted is-outlined';
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
      playerElement.classList =
        'button is-capitalized is-info is-inverted is-outlined is-hovered';
    }
  }
}
function playerOnCourtHighlight() {
  playerDeHighlight();
  playerHighlight();
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
  for (let i = 0; i < matchList.length; i++) {
    matchList[i][2] = i;
  }
  return matchList;
}
function getSelectedMatch(tileparentid) {
  let selectedMatch;
  for (let i = 0; i < matchList.length; i++) {
    if (Number(matchList[i][2]) === Number(tileparentid)) {
      selectedMatch = matchList[i];
    }
  }
  return selectedMatch;
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
      matchListId = matchList[i][2];
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
    selectedMatch = getSelectedMatch(courtTileLast.id),
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
    addTileChild = document.createElement('article'),
    courtHero = addCourtHero(firstTeam, secondTeam);

  addTileChild.classList = 'tile is-child box';
  addTileChild.style = 'padding: 0;';
  addTileParent.classList = 'tile is-parent';

  addTileChild.appendChild(courtHero);
  addTileParent.appendChild(addTileChild);
  addTileParent.id = matchlistindex;
  tileAncestor.appendChild(addTileParent);
  matchNumber();
}
function addCourtHero(firstTeam, secondTeam) {
  let courtHero = divElement(),
    courtHeroHead = addCourtHeroHead(),
    courtHeroBody = addCourtHeroBody(firstTeam, secondTeam),
    courtHeroFoot = addCourtHeroFoot();
  courtHero.classList = 'hero';
  courtHero.appendChild(courtHeroHead);
  courtHero.appendChild(courtHeroBody);
  courtHero.appendChild(courtHeroFoot);
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
function addCourtHeroFoot() {
  let courtHeroFoot = divElement(),
    columns = divElement(),
    timeColumn = divElement(),
    startColumn = divElement(),
    finishColumn = divElement(),
    timeElement = pElement(),
    startBtn = document.createElement('button'),
    finishBtn = document.createElement('button');
  courtHeroFoot.classList = 'hero-foot';
  courtHeroFoot.style = 'margin: 0.5rem;';

  columns.classList = 'columns';
  timeColumn.classList = 'column';
  timeColumn.style = 'min-width: 7rem;';
  startColumn.classList = 'column';
  finishColumn.classList = 'column';
  timeElement.classList = 'is-size-3';
  // timeElement.innerText = '10:00';
  // timeElement.innerText =
  //   Math.floor(playSecond / 60) +
  //   ':' +
  //   (playSecond % 60 < 10 ? `0${playSecond % 60}` : `${playSecond % 60}`);
  startBtn.classList = 'button is-success is-medium is-fullwidth';
  startBtn.innerText = 'Start';
  // startBtn.addEventListener('click', startCountDown);
  finishBtn.classList = 'button is-danger is-medium is-fullwidth';
  finishBtn.innerText = 'Finish';
  finishBtn.addEventListener('click', finishGame);

  timeColumn.appendChild(timeElement);
  startColumn.appendChild(startBtn);
  finishColumn.appendChild(finishBtn);
  columns.appendChild(timeColumn);
  columns.appendChild(startColumn);
  columns.appendChild(finishColumn);
  courtHeroFoot.appendChild(columns);

  return courtHeroFoot;
}
function startCountDown(event) {
  setInterval(() => {
    timeCountDown(event, playSecond);
  }, 1000);
}
function timeCountDown(event, playsecond) {
  let startButton = event.target,
    column = startButton.closest('.columns').firstChild,
    minutes = Math.floor(playsecond / 60),
    seconds = playsecond % 60;
  if (minutes <= 0 && seconds === 0) {
    column.firstChild.innerText = '0:00';
    return;
  } else {
    column.firstChild.innerText = `${minutes}:${
      seconds < 10 ? `0${seconds}` : `${seconds}`
    }`;
    playSecond--;
  }
}
function removeAllChild(parentid) {
  let parentElement = document.getElementById(parentid);
  while (parentElement.firstChild) {
    parentElement.removeChild(parentElement.lastChild);
  }
}

function finishGame(event) {
  const confirmDelete = confirm('Do you want to finish this game?');
  if (confirmDelete === true) {
    deleteCourt(event);
    playerOnCourtHighlight();
    courtNumberUpdate();
    matchNumber();
  }
}
function deleteCourt(event) {
  const courtTile = document.getElementById('courtTile');
  const button = event.target,
    tileParent = button.closest('#courtTile > div'),
    tileParentId = tileParent.id;
  let court = document.getElementById(tileParentId),
    selectedMatch = getSelectedMatch(tileParentId),
    tempPlayerList = [
      selectedMatch[0][0]['name'],
      selectedMatch[0][1]['name'],
      selectedMatch[1][0]['name'],
      selectedMatch[1][1]['name'],
    ];

  if (courtTile.childElementCount > 1) {
    for (let i = 0; i < memberObject.length; i++) {
      for (let j = 0; j < tempPlayerList.length; j++) {
        if (memberObject[i]['name'] === tempPlayerList[j]) {
          memberObject[i]['oncourt'] = false;
        }
      }
    }
    setMemberStorage(memberObject);
    court.remove();

    for (let i = 0; i < matchList.length; i++) {
      if (Number(matchList[i][2]) === Number(tileParentId)) {
        matchList.splice(i, 1);
      }
    }
    addCourt();
  } else {
    return;
  }
}
function courtNumberUpdate() {
  const courtTile = document.getElementById('courtTile').childElementCount;
  let courtNumber = document.getElementById('courtNumber');
  courtNumber.innerText = courtTile;
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
function setClubName() {
  let clubname = document.getElementById('clubname').value;
  lStorage.setItem('clubname', JSON.stringify(clubname));
}
function setMatchListStorage(list) {
  lStorage.setItem('matchlist', JSON.stringify(list));
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
  initClubName();
  if (memberObject !== null) {
    initMemberList();
  } else {
    memberObject = new Array();
  }
}
init();
