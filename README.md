# OBS MIDI UI (obs-midi-ui)

OBS Stream Festival Control UI with MIDI mappings for an RTMP Hub.

Uses Electron for cross-platform WebMIDI device support.

## Install the dependencies
```bash
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev -m electron
```

### Lint the files
```bash
npm run lint
```

### Build the app for production
```bash
quasar build
```

## MIDI Input and Output Dispatcher
MIDI input and (optional) output devices can be selected in the dropdown.

Buttons and faders respond to events, which will be sent based on the return value of user-entered JavaScript snippets. There are two snippets, one for input handling (controls originating from a MIDI device) and one for output handling (commands sent to a MIDI device). The snippets will be saved in Local Storage for use between application restarts, but there is otherwise no open or save behavior other than via copy-paste.
### Simple Fader MIDI Input Recipe
Set FADER_CHANNEL to the MIDI channel your faders are on, and set 4 values into FADER_CCS for the 4 control numbers matching the faders to be matched to the on-screen faders.

```
// Input: midiData
// Output: [ eventName, eventData ]

const FADER_CHANNEL = 1
const FADER_CCS = [11, 12, 13, 14]

var i = FADER_CCS.indexOf(midiData.control)
if (i > -1) {
  return ['midiFader' + i, {
    index: i,
    channel: midiData.channel,
    control: midiData.control,
    value: midiData.value
  }]
}

return [null, null]
```

### Faders and Buttons MIDI Input Recipe
Buttons are mapped to the DDJ-XP1, which has each side fully mapped to buttons 0 to 127 on different channels, thus we use simple index logic to dispatch a button to the corresponding scene or source. A controller with a non-contiguous button mapping (like the Launchpad) would need more row-wise logic to account for the discontinuity in notes.

```
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
if (midiData.channel === TRANSITION_CHANNEL) {
    if (midiData.note === TRANSITION_NOTE) {
        eventName = 'transition';
        console.log("Midi Emit: "+eventName);
    }
}

return [eventName, eventData];
```

### Button Lights MIDI Output Recipe
Lights are mapped to the DDJ-XP1 pads, which will set colors (not exactly the same colors for clarity) on pads corresponding to the source and scene buttons. The lights are set on the exact same notes and channel as the corresponding inputs, and are contiguous from 0 to 127 for each group of pads, so there is simple index logic. A controllers with discontinuous lights (like the Launchpad) would require more complex logic.

```

// Input 1: eventData { name, index, color }
// Input 2: midiOutput
// Output: none

const SCENE_LIGHT_CHANNEL = 8;
const SCENE_LIGHT_ZERO_NOTE = 0;

const SOURCE_LIGHT_CHANNEL = 10;
const SOURCE_LIGHT_ZERO_NOTE = 0;

console.log(eventData);

if (eventData.name === 'scene') {
    const index = eventData.index
    const color = eventData.color
    
    // for (index = 0; index < 127; index ++)
    //     midiOutput.playNote(index+SCENE_LIGHT_ZERO_NOTE, SCENE_LIGHT_CHANNEL, {velocity: index, rawVelocity: true})

    switch (color) {
        case 'white':
            midiOutput.playNote(index+SCENE_LIGHT_ZERO_NOTE, SCENE_LIGHT_CHANNEL, {velocity: 81, rawVelocity: true})
            break;
        case 'yellow':
            midiOutput.playNote(index+SCENE_LIGHT_ZERO_NOTE, SCENE_LIGHT_CHANNEL, {velocity: 24, rawVelocity: true})
            break;
        case 'red':
            midiOutput.playNote(index+SCENE_LIGHT_ZERO_NOTE, SCENE_LIGHT_CHANNEL, {velocity: 48, rawVelocity: true})
            break;
    }
} else if (eventData.name === 'source') {
    const index = eventData.index;
    const color = eventData.color;
    switch (color) {
        case 'white':
            midiOutput.playNote(index+SOURCE_LIGHT_ZERO_NOTE, SOURCE_LIGHT_CHANNEL, {velocity: 0, rawVelocity: true})
            break;
        case 'yellow':
            midiOutput.playNote(index+SOURCE_LIGHT_ZERO_NOTE, SOURCE_LIGHT_CHANNEL, {velocity: 24, rawVelocity: true})
            break;
        case 'red':
            midiOutput.playNote(index+SOURCE_LIGHT_ZERO_NOTE, SOURCE_LIGHT_CHANNEL, {velocity: 48, rawVelocity: true})
            break;
    }
    
    
} else if (eventData.name === 'init') {
    for (index = 0; index < 128; index ++) {
        midiOutput.playNote(index+SCENE_LIGHT_ZERO_NOTE, SCENE_LIGHT_CHANNEL, {velocity: 63, rawVelocity: true})
        midiOutput.playNote(index+SOURCE_LIGHT_ZERO_NOTE, SOURCE_LIGHT_CHANNEL, {velocity: 63, rawVelocity: true})
        // midiOutput.playNote(index+SOURCE_LIGHT_ZERO_NOTE, SOURCE_LIGHT_CHANNEL, {velocity: index, rawVelocity: true})
    }
}
```