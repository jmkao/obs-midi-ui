/* eslint-disable indent */
// Input: midiData {channel, control, value} or {channel, note}
// Output: [ eventName, eventData ]

const FADER_CHANNEL = 1;
const FADER_CONTROLS = [11, 12, 13, 14];

const MAGIC_FADER_CHANNEL = 1;
const MAGIC_FADER_NOTE = 0;

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
if (midiData.channel === MAGIC_FADER_CHANNEL) {
    if (midiData.note === MAGIC_FADER_NOTE) {
        eventName = 'autoUpdateFaders';
        console.log("Midi Emit: "+eventName);
    }
}

return [eventName, eventData];