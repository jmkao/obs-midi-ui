/* eslint-disable indent */
// Input: midiData {channel, control, value} or {channel, note}
// Output: [ eventName, eventData ]

const FADER_CHANNEL = 1;
const FADER_CONTROLS = [11, 12, 13, 14];

const SCENE_BTN_CHANNEL = 8;
const SCENE_ZERO_NOTE = 0;
const SCENE_MAX_NOTE = 100;

const SOURCE_BTN_CHANNEL = 10;
const SOURCE_ZERO_NOTE = 0;
const SOURCE_MAX_NOTE = 100;

const TIMETABLE_FWD_CHANNEL = 1;
const TIMETABLE_FWD_NOTE = 121;

const TIMETABLE_REV_CHANNEL = 1;
const TIMETABLE_REV_NOTE = 10;

const TRANSITION_CHANNEL = 7;
const TRANSITION_NOTE = 70;

const SCREENSHOT_CHANNEL = 1;
const SCREENSHOT_NOTE = 20;

const ZERO_TO_SCENE = [
  12, 13, 14, 15,
  8, 9, 10, 11,
  4, 5, 6, 7,
  0, 1, 2, 3
]

const ZERO_TO_SOURCE = [
  12, 13, 14, 15,
  8, 9, 10, 11,
  4, 5, 6, 7,
  0, 1, 2, 3
]

function mfRemap (data) {
  if (data.channel === SCENE_BTN_CHANNEL && typeof data.note !== 'undefined') {
    mapNote = ZERO_TO_SCENE.indexOf(data.note)
    console.log(`mfRemap() scene note ${data.note} to ${mapNote}`)
    if (mapNote != -1) {
      data.note = mapNote + SCENE_ZERO_NOTE
    }
  } else if (data.channel === SOURCE_BTN_CHANNEL && typeof data.note !== 'undefined') {
    mapNote = ZERO_TO_SOURCE.indexOf(data.note)
    console.log(`mfRemap() source note ${data.note} to ${mapNote}`)
    if (mapNote != -1) {
      data.note = mapNote + SOURCE_ZERO_NOTE
    }
  }

  return data
}

midiData = mfRemap(midiData)

var eventName = null;
var eventData = null;

if (midiData.channel === FADER_CHANNEL) {
    var i = FADER_CONTROLS.indexOf(midiData.control);
    if (i > -1) {
        eventName = 'midiFader'+i;
        eventData = midiData;
        eventData.index = i;
    }
}
if (midiData.channel === SCENE_BTN_CHANNEL) {
    if (midiData.note >= SCENE_ZERO_NOTE && midiData.note <= SCENE_MAX_NOTE) {
        eventName = 'scene' + (midiData.note - SCENE_ZERO_NOTE);
        eventData = midiData;
        console.log("Midi Emit: "+eventName);
    }
}
if (midiData.channel === SOURCE_BTN_CHANNEL) {
    if (midiData.note >= SOURCE_ZERO_NOTE && midiData.note <= SOURCE_MAX_NOTE) {
        eventName = 'source' + (midiData.note - SOURCE_ZERO_NOTE);
        eventData = midiData;
        console.log("Midi Emit: "+eventName);
    }
}
if (midiData.channel === TIMETABLE_FWD_CHANNEL) {
    if (midiData.note === TIMETABLE_FWD_NOTE) {
        eventName = 'timetable';
        eventData = 'advance';
        console.log("Midi Emit: "+eventName);
    }
}
if (midiData.channel === TIMETABLE_REV_CHANNEL) {
    if (midiData.note === TIMETABLE_REV_NOTE) {
        eventName = 'timetable';
        eventData = 'retract';
        console.log("Midi Emit: "+eventName);
    }
}
if (midiData.channel === SCREENSHOT_CHANNEL) {
    if (midiData.note === SCREENSHOT_NOTE) {
        eventName = 'screenshot';
        eventData = 'active';
        console.log("Midi Emit: "+eventName)
    }
}
if (midiData.channel === TRANSITION_CHANNEL) {
    if (midiData.note === TRANSITION_NOTE) {
        eventName = 'transition';
        console.log("Midi Emit: "+eventName);
    }
}

return [eventName, eventData];