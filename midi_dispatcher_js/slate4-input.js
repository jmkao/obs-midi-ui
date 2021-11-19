/* eslint-disable semi */
/* eslint-disable indent */
// Input: midiData {channel, control, value} or {channel, note}
// Output: [ eventName, eventData ]

const FADER_CHANNEL = 4;
const FADER_CONTROLS = [23, 21, 22, 24];

const SCENE_BTN_CHANNEL = 1;
const SCENE_ZERO_NOTE = 6;
const SCENE_MAX_NOTE = 27;

const SOURCE_BTN_CHANNEL = 2;
const SOURCE_ZERO_NOTE = 6;
const SOURCE_MAX_NOTE = 27;

const TIMETABLE_FWD_CHANNEL = 2;
const TIMETABLE_FWD_NOTE = 57;

const TIMETABLE_REV_CHANNEL = 1;
const TIMETABLE_REV_NOTE = 57;

const TRANSITION_CHANNEL = 2;
const TRANSITION_NOTE = 1;

const SCREENSHOT_CHANNEL = 2;
const SCREENSHOT_NOTE = 3;

const ZERO_TO_SCENE = [
  6, 9, 12, 15,
  18, 21, 24, 27
]

const ZERO_TO_SOURCE = [
  6, 9, 12, 15,
  18, 21, 24, 27
]

function mfRemap (data) {
  if (data.channel === SCENE_BTN_CHANNEL && data.note) {
    mapNote = ZERO_TO_SCENE.indexOf(data.note)
    console.log(`mfRemap() scene note ${data.note} to ${mapNote}`)
    if (mapNote != -1) {
      data.note = mapNote + SCENE_ZERO_NOTE
    }
  } else if (data.channel === SOURCE_BTN_CHANNEL && data.note) {
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