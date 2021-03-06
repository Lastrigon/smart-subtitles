sub = {}
//cdict = {}

audioQueue = []

subLanguage = 'zh'
targetLanguage = 'vi'

function prevButtonPressed() {
  //var vid = $('video')[0]
  //vid.pause()
  var pdn = getCurrentDialogNum()
  gotoDialog(pdn - 1)
  //curtime = Math.round(vid.currentTime*10)
  //now.getPrevDialogStartTime(curtime, function(time) {
  //  vid.currentTime = time/10
  //})
}

function nextButtonPressed() {
  //var vid = $('video')[0]
  //vid.pause()
  var pdn = getCurrentDialogNum()
  gotoDialog(pdn + 1)
  //curtime = Math.round(vid.currentTime*10)
  //now.getNextDialogStartTime(curtime, function(time) {
  //  vid.currentTime = time/10
  //})
}

function clearHoverTrans() {
  $('.currentlyHighlighted').css('background-color', '')
  $('.currentlyHighlighted').removeClass('currentlyHighlighted')
  $('#translation').hide()
}

function placeTranslationText(wordid) {
  var chineseChar = $('.'+ wordid + ':not(.pinyinspan)')
  var pos = chineseChar.offset()
  var width = chineseChar.width()
  var height = chineseChar.height()
  $('#translation').show()
  $('#translation').css('position', 'absolute')
  $('#translation').css({'left': (pos.left), 'top': (pos.top + 10 - 300 + $('#bottomFrame').scrollTop() + height), })
  //$('#translationTriangle').appendTo(chineseChar)
  //$('#translationTriangle').css({'left': (pos.left) + 'px', 'top': (pos.top + height) + 'px', 'position': 'absolute', })//.show()
}

function onWordLeave(wordid) {
  $($('.'+ wordid)).css('background-color', '')
  $($('.'+ wordid)).removeClass('currentlyHighlighted')
  now.serverlog('left: wordid=' + wordid + ' word=' + $('#WS' + wordid).text())
  if (autoShowTranslation) {
    if ($('.currentlyHighlighted').length == 0)
      showFullTranslation()
  } else {
    if ($('#translation').attr('translationFor') == wordid)
      $('#translation').hide()
  }
}

function onWordHover(wordid) {
  //var vid = $('video')[0]
  //vid.pause()
  //console.log(wordid)
  clearHoverTrans()
  placeTranslationText(wordid)

  $($('.'+ wordid)).css('background-color', 'yellow')
  $($('.'+ wordid)).addClass('currentlyHighlighted')

  $('#translation').attr('translationFor', wordid)

  var hovertext = $('#WS'+ wordid).attr('hovertext')

  //$('.'+ wordid).css()
  if (subLanguage == 'en') {
    //$('#translation').html(hovertext)
    $('#translation').text(hovertext)
  } else {
    definitions = hovertext.split('/')
    firstDef = definitions[0]
    nextDefs = ' <span id="transAltDefs" style="color: grey">' + definitions.slice(1).join('; ') + '</span>'
    //if (hovertext.indexOf(';') != -1) {
    //  hovertext = hovertext.slice(0, hovertext.indexOf('/'))
    //}
    $('#translation').html(firstDef + nextDefs)
    $('#translation').attr('isFullTranslation', 'false')
  }
  now.serverlog('entered: wordid=' + wordid + ' word=' + $('#WS' + wordid).text())
}

/*
function setHoverTrans(wordid, hovertext) {
$('.'+ wordid).hover(function() {
  onWordHover(wordid)
})
*/
/*
$('.'+ wordid).mouseout(function() {
  $($('.'+ wordid)).css('background-color', '')
  $('#translation').text('')
  $('#translationTriangle').hide()
})
*/

function nextAudioItem() {
  console.log(audioQueue)
  if (audioQueue.length > 0) {
    $('audio')[0].src = audioQueue.pop()
    $('audio')[0].play()
  }
}

function setClickPronounceEN(wordid, word) {
$('.'+ wordid).click(function() {
  var vid = $('video')[0]
  vid.pause()
  now.getPrononciation(word.toLowerCase(), function(nword, prononc, prurl) {
    $('.'+wordid+'.pinyinspan').html(prononc)
    audioQueue = [prurl]
    nextAudioItem()
  })
})
}

function setClickPronounceZH(wordid, pinyin) {
$('.'+ wordid).click(function() {
  var vid = $('video')[0]
  vid.pause()
  var nqueue = []
  var pinyinWords = pinyin.split(' ')
  for (var i = 0; i < pinyinWords.length; ++i) {
    var piny = pinyinWords[i].toLowerCase()
    var tonenum = getToneNumber(piny)
    if (tonenum == 5)
      tonenum = 1
    var notonemark = removeToneMarks(piny) + tonenum
    nqueue.push('http://transgame.csail.mit.edu/pinyin/' + notonemark + '.mp3')
  }
  nqueue.reverse()
  audioQueue = nqueue
  nextAudioItem()
})
}

/*
function getTransAndSetHover(word) {
  now.getEnglish(word, function(english) {
    setHoverTrans(word, english)
  })
}
*/

function setNewSubPix(subpixPath) {
if (subpixPath == '')
  subpixPath = 'blank.png'
$('#subpDisplay').attr('src', subpixPath)
}

prevDialogNum = -1

dialogStartTimesDeciSeconds = []

function wordClicked(dialogNum) {
  var pd = getCurrentDialogNum()
  gotoDialog(dialogNum)
  var vid = $('video')[0]
  if (dialogNum < pd) {
    vid.pause()
  } else {
    vid.play()
  }
}

function gotoDialog(dialogNum, dontanimate) {
  //skipCurrentTimeChanged = true
  gotoDialogNoVidSeek(dialogNum, dontanimate)
  $('video')[0].currentTime = dialogStartTimesDeciSeconds[dialogNum] / 10
  //setTimeout(function() {skipCurrentTimeChanged = false}, 100)
}

gotoDialogInProgress = false
//skipCurrentTimeChanged = false

function gotoDialogNoVidSeek(dialogNum, dontanimate, automatic) {
  var pdn = getCurrentDialogNum()
  if (dialogNum == pdn) return
  if (dialogNum < 0 || dialogNum >= dialogStartTimesDeciSeconds.length) return
  gotoDialogInProgress = true
  $('html, body').stop(true, true)
  var realPrevDialogNum = pdn
  //prevDialogNum = dialogNum
  
  clearHoverTrans()
  
  location.hash = dialogNum.toString()
  
  $('.pysactive').css('font-size', '18px')
  $('.pysactive').removeClass('pysactive')
  $('.wsactive').css('font-size', '32px')
  $('.wsactive').removeClass('wsactive')
  $('.tbactive').hide()
  $('.tbactive').css('font-size', '32px')
  $('.tbactive').removeClass('tbactive')
  $('.pys' + dialogNum).css('font-size', '28px')
  $('.pys' + dialogNum).addClass('pysactive')
  $('.ws' + dialogNum).css('font-size', '48px')
  $('.ws' + dialogNum).addClass('wsactive')
  $('.tb' + dialogNum).css('font-size', '48px')
  $('.tb' + dialogNum).addClass('tbactive')
  $('.tb' + dialogNum).show()
  //$('#dialogStart' + prevDialogNum).css('background-color', 'black')
  //$('#dialogStartPY' + prevDialogNum).css('background-color', 'black')
  //$('#dialogStart' + dialogNum).css('background-color', 'darkgreen')
  //$('#dialogStartPY' + dialogNum).css('background-color', 'darkgreen')
  /*
  var videoHeight = $('video')[0].videoHeight
  var videoBottom = $('video').offset().top + videoHeight
  var windowBottom = $('#bottomOfScreen').offset().top
  var offset = $('#whitespaceS' + dialogNum).offset()
  */
  //var width = $('#dialogEndSpaceWS' + dialogNum).offset().left - $('#dialogStartSpaceWS' + dialogNum).offset().left// - $('#dialogStartSpaceWS' + dialogNum).width()
  //var videoOffset = $('video').offset()
  //var videoWidth = $('video')[0].videoWidth
  //offset.top = videoOffset.top
  //offset.left -= Math.round(videoWidth/4)
  
  //offset.left -= Math.round(videoWidth/2)
  //offset.left += Math.round(width/2)
  //offset.left = Math.max(0, offset.left)
  
  //$('video').offset(offset)
  
  //window.scroll($('video').offset().left - Math.round(videoWidth/2))
  //window.scroll(offset.left - Math.round($(window).width()/2) + Math.round(width/2))]
  var oldOffset = $('#bottomFrame').scrollTop()
  var newOffset = $('#whitespaceS' + dialogNum).offset().top - $('#bottomFrame').offset().top + $('#bottomFrame').scrollTop() - $('#bottomFrame').height()/2 - $('.tb' + dialogNum).height()/2 - $('#whitespaceS' + dialogNum).height()/2
  if (Math.abs(newOffset - oldOffset) > $(window).width()) {
    //$('html, body').scrollTop(newOffset)
    $('#bottomFrame').animate({scrollTop: newOffset}, 30)
    setTimeout(function() {gotoDialogInProgress = false}, 130)
  } else {
    $('#bottomFrame').animate({scrollTop: newOffset}, 100)
    setTimeout(function() {gotoDialogInProgress = false}, 200)
  }
  /*
  var oldOffset = $('#bottomFrame').scrollTop()
  var newOffset = offset.top //- 48 - videoHeight - (windowBottom - videoBottom)/2
  if (false) {
    $('html, body').scrollTop(newOffset)
    //gotoDialogInProgress = false
    setTimeout(function() {gotoDialogInProgress = false}, 50)
  } else if (Math.abs(newOffset - oldOffset) > $(window).width()) {
    //$('html, body').scrollTop(newOffset)
    $('html, body').animate({scrollTop: newOffset}, 30)
    setTimeout(function() {gotoDialogInProgress = false}, 130)
  } else {
    $('html, body').animate({scrollTop: newOffset}, 100)
    setTimeout(function() {gotoDialogInProgress = false}, 200)
  }
  */
  // - Math.round($(window).width()/2 + width/2)
  
  

  //var oldOffset = $('html, body').scrollLeft()
  //var newOffset = offset.left - Math.round($(window).width()/2) + Math.round(width/2) + Math.round($('#dialogStartSpaceWS' + dialogNum).width()/2)
  //if (Math.abs(newOffset - oldOffset) > $(window).width()) {
  //  $('html, body').animate({scrollLeft: newOffset}, 100)
  //} else {
  //  $('html, body').animate({scrollLeft: newOffset}, 300)
  //}
  //$('body').animate({scrollLeft: Math.round($('#dialogStartSpaceWS' + dialogNum).scrollLeft())}, 10)

  
  now.serverlog('gotodialog: dialogNum=' + dialogNum + ' prevDialogNum=' + realPrevDialogNum + ' automatic=' + automatic)
  if (autoShowTranslation) {
    showFullTranslation(dialogNum)
  }
}

dialogsSetUp = {}

/*
function setupHoverForDialog(dialogNum) {
  if (dialogsSetUp[dialogNum]) return
  dialogsSetUp[dialogNum] = true
  var annotatedWordList = annotatedWordListListG[dialogNum][2]
  for (var i = 0; i < annotatedWordList.length; ++i) {
    var word = annotatedWordList[i][0]
    var pinyin = annotatedWordList[i][1]
    var english = annotatedWordList[i][2]
    //var randid = wordToId[word]
    var randid = 'wid_q_' + dialogNum + '_i_' + i
    setHoverTrans(randid, english)
    if (subLanguage == 'en') {
      //setClickPronounceEN(randid, word)
    } else if (subLanguage == 'zh') {
      //setClickPronounceZH(randid, pinyin)
    }
  }
}
*/

function translateButtonPressed(n) {
  if ($('#translation').attr('isFullTranslation') == 'true' && $('video')[0].paused) {
    $('video')[0].play();
  } else {
    $('video')[0].pause();
  }
  showFullTranslation(n)
}

function showFullTranslation(n) {
  if (typeof n === "undefined" || n === null)
    n = getCurrentDialogNum()
  sentence = $('.tb' + n).attr('currentSentence')
  firstWordId = $('.tb' + n).attr('firstWordId')
  console.log(sentence)
  clearHoverTrans()
  //var currentTimeDeciSecs = Math.round($('video')[0].currentTime*10)
  var currentTimeDeciSecs = $('.tb' + n).attr('startTimeDeciSeconds')
  now.getNativeSubAtTime(currentTimeDeciSecs, function(translation) {
    if ($('.currentlyHighlighted').length != 0) return
    console.log(translation)
    $('#translation').text(translation)
    $('#translation').attr('isFullTranslation', 'true')
    placeTranslationText(firstWordId)
    var offset = $('#translation').offset()
    offset.left = $(window).width()/2 - $('#translation').width()/2
    $('#translation').offset(offset)
    $('#translation').show()
    now.serverlog('translation: firstWordId=' + firstWordId + ' translation=' + translation)
  })
  /*
  now.getTranslations(sentence, function(translation) {
    console.log(translation[0].TranslatedText)
    $('#translation').text(translation[0].TranslatedText)
    placeTranslationText(firstWordId)
    var offset = $('#translation').offset()
    offset.left = $(window).width()/2 - $('#translation').width()/2
    $('#translation').offset(offset)
    $('#translation').show()
  })
  */
}

function setNewSubtitles(annotatedWordList) {
  setNewSubtitleList([[0, 1, annotatedWordList]])
}

annotatedWordListListG = []

function setNewSubtitleList(annotatedWordListListOrig) {
  var annotatedWordListList = []
  for (var q = 0; q < annotatedWordListListOrig.length; ++q) {
    if (annotatedWordListListOrig[q][2].length > 0) {
      annotatedWordListList.push(annotatedWordListListOrig[q]);
    }
  }
  setNewSubtitleListReal(annotatedWordListList);
}

function setNewSubtitleListReal(annotatedWordListList) {
annotatedWordListListG = annotatedWordListList
//console.log(annotatedWordList.toString())
//if (annotatedWordList.length == 0) return
$('#translationTriangle').hide()
$('#translation').text('')
$('#translation').attr('isFullTranslation', 'false')
var nhtml = []

dialogStartTimesDeciSeconds = []

var wordToId = {}

//$('video').css('left', Math.round($(window).width()/2 - $('video')[0].videoWidth/2).toString())

//pinyinRow.push('<td style="display:-moz-inline-box;display:inline-block;width:' + ($('video').offset().left + Math.round($('video')[0].videoWidth/2))+ 'px;"></td>')
//wordRow.push('<td style="display:-moz-inline-box;display:inline-block;width:' + ($('video').offset().left + Math.round($('video')[0].videoWidth/2)) + 'px;"></td>')

for (var q = 0; q < annotatedWordListList.length; ++q) {
var startTimeDeciSeconds = annotatedWordListList[q][0]
var endTimeDeciSeconds = annotatedWordListList[q][1]
dialogStartTimesDeciSeconds[q] = startTimeDeciSeconds
var startHMS = toHourMinSec(Math.round(startTimeDeciSeconds/10))
var annotatedWordList = annotatedWordListList[q][2]

nhtml.push('<table border="0" cellspacing="0">')

var pinyinRow = []
var wordRow = []
var whitespaceRow = []

//console.log(annotatedWordList)

//pinyinRow.push('<td id="dialogStartSpacePYS' + q + '" style="background-color: white; color: black; text-align: center; font-size: 18px" class="spacingPYS" onclick="gotoDialog(' + q + ')"></td>')
//wordRow.push('<td id="dialogStartSpaceWS' + q + '" style="background-color: white; color: black; text-align: center; font-size: 32px" class="spacingWS" onclick="gotoDialog(' + q + ')">　</td>')

var allWords = []
for (var i = 0; i < annotatedWordList.length; ++i) {
  allWords.push(annotatedWordList[i][0])
}
var currentSentence = escapeHtmlQuotes(allWords.join(''))

var firstWordId = ''

for (var i = 0; i < annotatedWordList.length; ++i) {
var word = annotatedWordList[i][0]
var pinyin = annotatedWordList[i][1]
var english = annotatedWordList[i][2]
if (english == null) english = ''
else english = escapeHtmlQuotes(english)

if (wordToId[word] == null)
  wordToId[word] = Math.round(Math.random() * 1000000)
//var randid = wordToId[word]
var randid = 'wid_q_' + q + '_i_' + i
if (i == 0) firstWordId = randid;

coloredSpans = []
var pinyinspan = '<td style="font-size: xx-small"></td>'
if (pinyin) {
pinyinWords = pinyin.split(' ')

for (var j = 0; j < pinyinWords.length; ++j) {
  var curWord = pinyinWords[j]
  var tonecolor = ['red', '#AE5100', 'green', 'blue', 'black'][getToneNumber(curWord)-1]
  coloredSpans.push('<span style="color: ' + tonecolor + '">' + curWord.toLowerCase() + '</span>')
}
pinyinspan = '<td nowrap="nowrap" style="text-align: center;" class="' + randid + ' hoverable pinyinspan pys' + q + '" onmouseover="onWordHover(\'' + randid + '\')" onmouseout="onWordLeave(\'' + randid + '\')" onclick="wordClicked(' + q + ')">' + coloredSpans.join(' ') + '</td>'
}

var wordspan = '<td nowrap="nowrap" dialognum=' + q + ' style="text-align: center;" hovertext="' + english + '" id="WS' + randid + '" class="' + randid + ' hoverable wordspan ws' + q + '" onmouseover="onWordHover(\'' + randid + '\')" onmouseout="onWordLeave(\'' + randid + '\')" onclick="wordClicked(' + q + ')">' + word + '</td>'
if (word == ' ') {
  wordspan = '<td style="font-size: xx-small">　</td>'
}

pinyinRow.push(pinyinspan)
wordRow.push(wordspan)
whitespaceRow.push('<td id="whitespaceS' + q + '" style="font-size: 32px">　</td>')

}

wordRow.push('<td id="translate"' + q + '" style="font-size: 32px">　</td>')
wordRow.push('<td><button id="translate"' + q + '" style="font-size: 32px; display: none; white-space: nowrap" dialogNum="' + q + '" class="translateButton tb' + q + '" startTimeDeciSeconds="' + startTimeDeciSeconds + '" endTimeDeciSeconds="' + endTimeDeciSeconds + '" currentSentence="' + currentSentence + '" firstWordId="' + firstWordId + '" onclick="translateButtonPressed(' + q + ')">translate</button></td>')

//pinyinRow.push('<td id="dialogEndSpacePYS' + q + '" style="background-color: white; color: black; text-align: center; font-size: 18px" class="spacingPYS" onclick="gotoDialog(' + q + ')"></td>')
//wordRow.push('<td id="dialogEndSpaceWS' + q + '" style="background-color: white; color: black; text-align: center; font-size: 32px" class="spacingWS" onclick="gotoDialog(' + q + ')">　</td>')

nhtml.push('<col>' + pinyinRow.join('') + '</col>')
nhtml.push('<col>' + wordRow.join('') + '</col>')
nhtml.push('<col>' + whitespaceRow.join('') + '</col>')

nhtml.push('</table>')

}

$('#caption').html(nhtml.join(''))

/*
for (var q = 0; q < annotatedWordListList.length; ++q) {
var annotatedWordList = annotatedWordListList[q][2]
for (var i = 0; i < annotatedWordList.length; ++i) {
  var word = annotatedWordList[i][0]
  var pinyin = annotatedWordList[i][1]
  var english = annotatedWordList[i][2]
  //var randid = wordToId[word]
  var randid = 'wid_q_' + q + '_i_' + i
  //setHoverTrans(randid, english)
  if (subLanguage == 'en') {
    setClickPronounceEN(randid, word)
  } else if (subLanguage == 'zh') {
    //setClickPronounceZH(randid, pinyin)
  }
}
}
*/

//gotoDialogNoVidSeek(0, false, true)
//$('video')[0].play()
}

function videoLoaded() {
  var videoWidth = $('video')[0].videoWidth
  $('video').css('left', '50%')
  $('video').css('margin-left', - Math.round(videoWidth/2))
  //var videoHeight = $('video')[0].videoHeight
  //$('#videoSpacing').css('margin-top', ($('video').offset().top + videoHeight))
  
  //$('#whiteRegion').css('height', videoHeight)
  //var videoOffset = $('video').offset()
  //videoOffset.left = Math.round($(window).width()/2 - $('video')[0].videoWidth/2)
  //$('video').offset(videoOffset)
}

function dialogEndTimeSec(dialogNum) {
  if (typeof dialogNum === "undefined" || dialogNum === null)
    dialogNum = getCurrentDialogNum()
  return parseFloat($('.tb'+dialogNum).attr('endTimeDeciSeconds')) / 10.0
}

function dialogStartTimeSec(dialogNum) {
  if (typeof dialogNum === "undefined" || dialogNum === null)
    dialogNum = getCurrentDialogNum()
  return parseFloat($('.tb'+dialogNum).attr('startTimeDeciSeconds')) / 10.0
}

function onTimeChanged(s) {
  if (gotoDialogInProgress) return
  if (s.currentTime > dialogEndTimeSec()) {
    var sinceEndOfDialog = s.currentTime - dialogEndTimeSec()
    var toNextDialog = dialogStartTimeSec(getCurrentDialogNum() + 1) - s.currentTime
    var betweenDialogs = Math.min(sinceEndOfDialog, toNextDialog)
    var pbrate = 0.8 + betweenDialogs/10.0
    console.log('end of dialog')
    $('video')[0].playbackRate = Math.min(1.0, pbrate)
  } else {
    console.log('in dialog')
    $('video')[0].playbackRate = 0.8
  }
  var targetTimeDeciSecs = Math.round(s.currentTime*10)
  var lidx = 0
  var ridx = dialogStartTimesDeciSeconds.length-1
  while (lidx < ridx+1) {
    var midx = Math.floor((lidx + ridx)/2)
    var ctime = dialogStartTimesDeciSeconds[midx]
    if (ctime > targetTimeDeciSecs)
      ridx = midx - 1
    else
      lidx = midx + 1
  }
  if (ridx < 0) ridx = 0
  if (gotoDialogInProgress) return
  gotoDialogNoVidSeek(ridx, false, true)
//now.getAnnotatedSubAtTime(Math.round(s.currentTime*10), setNewSubtitles)
//now.getSubPixAtTime(Math.round(s.currentTime*10), setNewSubPix)
}

/*
var curSub = sub.subtitleAtTime(Math.round(currentTime))
var wordsInSub = curSub.split('')

$('#translation').text('')
now.getPinyin(curSub, function(pinyin) {
if (pinyin == '') $('#pinyin').text('')
else $('#pinyin').text(toneNumberToMark(pinyin).toLowerCase())
})


for (var i = 0; i < wordsInSub.length; ++i) {
var word = wordsInSub[i]
nhtml.push('<span class="hoverable" id="' + word + '">' + word + '</span>')
}

$('#caption').html(nhtml.join(''))

for (var i = 0; i < wordsInSub.length; ++i) {
var word = wordsInSub[i]
getTransAndSetHover(word)
}

}
*/

function relMouseCoords(event, htmlelem){
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = htmlelem;

    do{
        totalOffsetX += currentElement.offsetLeft;
        totalOffsetY += currentElement.offsetTop;
    }
    while(currentElement = currentElement.offsetParent)

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return {x:canvasX, y:canvasY}
}

/*
$('body').mousemove(function(x) {
var vid = $('video')[0]
var mouseCoords = relMouseCoords(x, vid)
if (mouseCoords.y < $('video').height() && mouseCoords.x < $('video').width()) return
vid.pause()
})
*/

function flipPause() {
  var vid = $('video')[0]
  if (vid.paused) {
    vid.play()
    playedVideo()
  } else {
    vid.pause()
    pausedVideo()
  }
}

function playedVideo() {
  now.serverlog('playing: currentIdx=' )
}

function pausedVideo() {
  now.serverlog('paused: currentIdx=' )
}

function videoPlaying() {
//$('#playPauseButton').text('Pause (Space)')
//$('#prevLineButton').show()
//$('#nextLineButton').show()
//$('video').width($('video')[0].videoWidth)
//$('video').height($('video')[0].videoHeight)
}

function videoPaused() {
//$('#playPauseButton').text('Play (Space)')
//$('#prevLineButton').show()
//$('#nextLineButton').show()
}

/*
function videoClicked() {
  var vid = $('video')[0]
  if (vid.paused)
    vid.play()
  else
    vid.pause()
}
*/



/*
$(document).click(function(x) {
var vid = $('video')[0]
var videoLeft = $('video').offset().left
var videoTop = $('video').offset().top
var videoWidth = $('video')[0].videoWidth
var videoHeight = $('video')[0].videoHeight
if (x.pageX < videoLeft || x.pageX > videoLeft + videoWidth) return true
if (x.pageY < videoTop || x.pageY > videoTop + videoHeight - 40) return true
//var mouseCoords = relMouseCoords(x, vid)
//if (mouseCoords.y > $('video')[0].videoHeight - 30 || mouseCoords.x > $('video')[0].videoWidth) return true
if (vid.paused) {
  vid.play()
  playedVideo()
} else {
  vid.pause()
  pausedVideo()
}
return false
})
*/

/*
$(document).click(function(x) {
var vid = $('video')[0]
var mouseCoords = relMouseCoords(x, vid)
if (mouseCoords.y > $('video')[0].videoHeight - 30 || mouseCoords.x > $('video')[0].videoWidth) return true
if (vid.paused)
  vid.play()
else
  vid.pause()
return false
})
*/

function checkKey(x) {
  var vid = $('video')[0]
  console.log(x.keyCode)
  if (x.keyCode == 32) { // space
    if (vid.paused) {
      vid.play()
      playedVideo()
    } else {
      vid.pause()
      pausedVideo()
    }
    x.preventDefault()
    return false
  } else if (x.keyCode == 37) { // left arrow
    if (x.ctrlKey) {
      prevButtonPressed()
    } else {
      vid.currentTime -= 5
    }
    x.preventDefault()
    return false
  } else if (x.keyCode == 39) { // right arrow
    if (x.ctrlKey) {
      nextButtonPressed()
    } else {
      vid.currentTime += 5
    }
    x.preventDefault()
    return false
  } else if (x.keyCode == 38 || x.keyCode == 33) { // up arrow, page up
    prevButtonPressed()
    x.preventDefault()
  } else if (x.keyCode == 40 || x.keyCode == 34) { // down arrow, page down
    nextButtonPressed()
    x.preventDefault()
  }
}

$(document).keydown(checkKey)

function getCurrentDialogNum() {
  return parseInt($('.tbactive').attr('dialogNum'))
}

mouseWheelMoveInProgress = false

function mouseWheelMove(event, delta) {
  event.preventDefault()
  if (gotoDialogInProgress) {
    return false
  }
  mouseWheelMoveInProgress = true
  //console.log('mousewheel move - prevDialogNum: ' + prevDialogNum)
  var currentDialogNum = getCurrentDialogNum()
  if (delta > 0) {
    gotoDialog(currentDialogNum - 1)
  } else {
    gotoDialog(currentDialogNum + 1)
  }
  mouseWheelMoveInProgress = false
  return false
}

$(document).mousewheel(mouseWheelMove)

//pausedFromLeftButtonHold = false


function mouseDown(event) {
  if (event.which == 2) { // middle button
    flipPause()
    event.preventDefault()
  }
  if (event.which == 3) { // right button
    flipPause()
    event.preventDefault()
  }
  /*
  if (event.which == 1 && !$('video')[0].paused) { // left button
    $('video')[0].pause()
    pausedFromLeftButtonHold = true
    $('body').addClass('unselectable')
    //$('video').trigger(event)
    //event.preventDefault()
    //event.stopImmediatePropagation()
    //event.stopPropagation()
  }
  */
}

//$(document).mousedown(mouseDown)

/*
function mouseUp(event) {
  if (event.which == 1 && pausedFromLeftButtonHold) { // left button, resume
    pausedFromLeftButtonHold = false
    $('body').removeClass('unselectable')
    $('video')[0].play()
  }
}

$(document).mouseup(mouseUp)
*/

function videoClicked(x) {
  var vid = $('video')[0]
  if (vid.paused) {
    vid.play()
    playedVideo()
  } else {
    vid.pause()
    pausedVideo()
  }
  return false
}

callOnceElementAvailable('video', function() {
  $('video').click(videoClicked)
})

function onScroll() {
  //$('video')[0].pause()
  console.log('scrolling!')
  if (gotoDialogInProgress || mouseWheelMoveInProgress) return
  $.doTimeout('scroll', 100, function() {
    if (gotoDialogInProgress || mouseWheelMoveInProgress) return
    /*
    var videoHeight = $('video')[0].videoHeight
    var videoBottom = $('video').offset().top + videoHeight
    var windowBottom = $('#bottomOfScreen').offset().top
    var windowTop = $(window).scrollTop()
    var center = (windowBottom + videoBottom) / 2
    */
    //console.log(center)
    //console.log($.nearest({x: $(window).width()/2, y: center}, '.wordspan')[0])
    //var dialognum = $($.nearest({x: $(window).width()/2, y: center}, '.wordspan')[0]).attr('dialognum')
    var dialognum = $($.nearest({x: $(window).width()/2, y: $(window).height() - $('#bottomFrame').height()/2}, '.wordspan')[0]).attr('dialognum')
    console.log(dialognum)
    gotoDialog(dialognum, true)
  })
}

callOnceElementAvailable('#bottomFrame', function() {
  $('#bottomFrame').scroll(onScroll)
})

$(document)[0].addEventListener('contextmenu', function(event) {
  event.preventDefault()
})

$(window).bind('hashchange',function(event){
    var anchorhash = location.hash.replace('#', '');
    if (anchorhash == '')
      return
    if (gotoDialogInProgress)
      return
    gotoDialog(parseInt(anchorhash))
});

function startPlayback() {
  if (isLocalFile()) {
    var file = $('#videoInputFile')[0].files[0]
    var type = file.type
    var videoNode = $('video')[0]
    var canPlay = videoNode.canPlayType(type)
    canPlay = (canPlay === '' ? 'no' : canPlay)
    var isError = canPlay === 'no'
    var URL = window.URL
    if (!URL)
      URL = window.webkitURL
    var fileURL = URL.createObjectURL(file)
    videoNode.src = fileURL
  } else {
    var videoSource = $('#videoInputURL').val().trim()
    $('video')[0].src = videoSource
  }
  $('#inputRegion').hide()
  $('#viewingRegion').show()
  var subtitleText = $('#subtitleInput').val().trim()
  var nativeSubtitleText = $('#nativeSubtitleInput').val().trim()
  now.initializeSubtitleText(subtitleText, subLanguage, targetLanguage, function() {
    now.getFullAnnotatedSub(setNewSubtitleList)
    now.initializeNativeSubtitleText(nativeSubtitleText)
  })
  var subpixSource = getUrlParameters()['subpix']
  if (subpixSource != null) {
    now.initializeSubPix(subpixSource)
  }
}

function isLocalFile() {
  return ($('#urlOrFile').val() == 'file')
}

function loadVideo(videourl, suburl) {
  if (videourl.indexOf('{m4v|webm}') != -1) {
    if (Modernizr.video.webm && !Modernizr.video.h264) {
      videourl = videourl.replace('{m4v|webm}', 'webm')
    } else {
      videourl = videourl.replace('{m4v|webm}', 'm4v')
    }
  }
  if (videourl.indexOf('{mp4|webm}') != -1) {
    if (Modernizr.video.webm && !Modernizr.video.h264) {
      videourl = videourl.replace('{mp4|webm}', 'webm')
    } else {
      videourl = videourl.replace('{mp4|webm}', 'mp4')
    }
  }
  $('#urlOrFile').val('url')
  urlOrFileChanged()
  $('#videoInputURL').val(videourl)
  $('#subtitleInput').val('')
  textChanged()
  $('#subtitleInput').val('Loading subtitles from ' + suburl)
  now.downloadSubtitleText(suburl, function(subText) {
    $('#subtitleInput').val(subText)
    textChanged()
  })
}

function urlOrFileChanged() {
  if (isLocalFile()) {
    $('#videoInputURL').hide()
    $('#videoInputFile').show()
  } else {
    $('#videoInputFile').hide()
    $('#videoInputURL').show()
  }
}

function subtitleUploaded() {
var reader = new FileReader()
reader.onloadend = function( ){
  $('#subtitleInput').val(reader.result)
  textChanged()
}
var srtfile = $('#srtInputFile')[0].files[0]
reader.readAsText(srtfile)
}


function nativeSubtitleUploaded() {
var reader = new FileReader()
reader.onloadend = function( ){
  $('#nativeSubtitleInput').val(reader.result)
  textChanged()
}
var srtfile = $('#nativeSrtInputFile')[0].files[0]
reader.readAsText(srtfile)
}

function textChanged() {
  if (isLocalFile()) {
    if ($('#videoInputFile').val() && $('#subtitleInput').val()) {
      $('#startPlaybackButton')[0].disabled = false
    } else {
      $('#startPlaybackButton')[0].disabled = true
    }
  } else {
    if ($('#videoInputURL').val() && $('#subtitleInput').val()) {
      $('#startPlaybackButton')[0].disabled = false
    } else {
      $('#startPlaybackButton')[0].disabled = true
    }
  }
}

function onVideoError(s) {
  var videoPlaybackError = s.error
  if (videoPlaybackError) {
    var videoSource = s.src
    var errorMessage = ''
    if (videoPlaybackError.code == 0) errorMessage = 'MEDIA_ERR_ABORTED - fetching process aborted by user'
    if (videoPlaybackError.code == 1) errorMessage = 'MEDIA_ERR_NETWORK - error occurred when downloading'
    if (videoPlaybackError.code == 3) errorMessage = 'MEDIA_ERR_DECODE - error occurred when decoding'
    if (videoPlaybackError.code == 4) errorMessage = 'MEDIA_ERR_SRC_NOT_SUPPORTED - audio/video format not supported by browser'
    var printableError =  JSON.stringify(videoPlaybackError, null, 4)
    $('#errorRegion').text('Error playing ' + videoSource + ': ' + errorMessage + ' ' + printableError)
  }
}

function getUrlParameters() {
var map = {};
var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
map[key] = value;
});
return map; 
}

now.clientlog = function(text) {
  //console.log((new Date().getTime()/1000).toString() + ' | ' + text)
  console.log(text)
}

