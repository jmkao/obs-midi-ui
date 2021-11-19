/* eslint-disable no-undef */
/* eslint-disable semi */
// Input: midiData {channel, control, value} or {channel, note}
// Output: [ eventName, eventData ]

const FADER_CHANNEL = 1;
const FADER_CONTROLS = [11, 12, 13, 14];

const SCENE_BTN_CHANNEL = 8;
const SCENE_ZERO_NOTE = 0;
const SCENE_MAX_NOTE = 63;

const SOURCE_BTN_CHANNEL = 10;
const SOURCE_ZERO_NOTE = 0;
const SOURCE_MAX_NOTE = 63;

const TIMETABLE_FWD_CHANNEL = 1;
const TIMETABLE_FWD_NOTE = 121;

const TIMETABLE_REV_CHANNEL = 1;
const TIMETABLE_REV_NOTE = 10;

const TRANSITION_CHANNEL = 7;
const TRANSITION_NOTE = 70;

const MF_CHANNEL = 3
const ZERO_TO_MF = [
  39, 38, 37, 36,
  43, 42, 41, 40,
  47, 46, 45, 44,
  51, 50, 49, 48,
  55, 54, 53, 52,
  59, 58, 57, 56,
  63, 62, 61, 60,
  67, 66, 65, 64,
  71, 70, 69, 68,
  75, 74, 73, 72,
  79, 78, 77, 76,
  83, 82, 81, 80,
  87, 86, 85, 84,
  91, 90, 89, 88,
  95, 94, 93, 92,
  99, 98, 97, 96
]

function mfRemap (data) {
  if (data.channel === MF_CHANNEL && data.note && data.note > 35 && data.note < 100) {
    mapNote = ZERO_TO_MF.indexOf(data.note)
    console.log(`mfRemap() note ${data.note} to ${mapNote}`)

    data.note = mapNote
  }

  return data
}

var eventName = null;
var eventData = null;

midiData = mfRemap(midiData)

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
if (midiData.channel === TRANSITION_CHANNEL) {
  if (midiData.note === TRANSITION_NOTE) {
    eventName = 'transition';
    console.log("Midi Emit: "+eventName);
  }
}

return [eventName, eventData];
