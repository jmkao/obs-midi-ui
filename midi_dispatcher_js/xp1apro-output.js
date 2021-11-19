/* eslint-disable indent */

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
        case 'green':
            midiOutput.playNote(index+SOURCE_LIGHT_ZERO_NOTE, SOURCE_LIGHT_CHANNEL, {velocity: 20, rawVelocity: true})
            break;
    }
} else if (eventData.name === 'init') {
    console.log('Midi Out Init')
    for (index = 0; index < 128; index ++) {
        midiOutput.playNote(index+SCENE_LIGHT_ZERO_NOTE, SCENE_LIGHT_CHANNEL, {velocity: 63, rawVelocity: true})
        midiOutput.playNote(index+SOURCE_LIGHT_ZERO_NOTE, SOURCE_LIGHT_CHANNEL, {velocity: 63, rawVelocity: true})
        // midiOutput.playNote(index+SCENE_LIGHT_ZERO_NOTE, SCENE_LIGHT_CHANNEL, {velocity: index, rawVelocity: true})
    }
}