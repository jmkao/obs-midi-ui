/* eslint-disable semi */
/* eslint-disable no-undef */
// Input 1: eventData { name, index, color }
// Input 2: midiOutput
// Output: none

const SCENE_LIGHT_CHANNEL = 1;

const SOURCE_LIGHT_CHANNEL = 2;

const ZERO_TO_MF = [
  6, 9, 12, 15,
  18, 21, 24, 27
]

console.log(eventData);

function remapMF (note) {
  var mapNote = note
  if (note >= 0 && note < 8) {

    mapNote = ZERO_TO_MF[note]
  } else {
    mapNote = 127
  }
  console.log(`remapMF() output note ${note} to ${mapNote}`)
  return mapNote
}

if (eventData.name === 'scene') {
  const index = eventData.index
  const color = eventData.color

  // for (index = 0; index < 127; index ++) {
  //   midiOutput.playNote(index+SCENE_LIGHT_ZERO_NOTE, SCENE_LIGHT_CHANNEL, {velocity: index, rawVelocity: true})
  // }

  switch (color) {
    case 'white':
      midiOutput.playNote(remapMF(index), SCENE_LIGHT_CHANNEL, {velocity: 5, rawVelocity: true})
      break;
    case 'yellow':
      midiOutput.playNote(remapMF(index), SCENE_LIGHT_CHANNEL, {velocity: 4, rawVelocity: true})
      break;
    case 'red':
      midiOutput.playNote(remapMF(index), SCENE_LIGHT_CHANNEL, {velocity: 1, rawVelocity: true})
      break;
  }
} else if (eventData.name === 'source') {
  const index = eventData.index;
  const color = eventData.color;
  switch (color) {
    case 'white':
      midiOutput.playNote(remapMF(index), SOURCE_LIGHT_CHANNEL, {velocity: 5, rawVelocity: true})
      break;
    case 'yellow':
      midiOutput.playNote(remapMF(index), SOURCE_LIGHT_CHANNEL, {velocity: 4, rawVelocity: true})
      break;
    case 'red':
      midiOutput.playNote(remapMF(index), SOURCE_LIGHT_CHANNEL, {velocity: 1, rawVelocity: true})
      break;
  }
} else if (eventData.name === 'init') {
  for (index = 0; index < 64; index++) {
    midiOutput.playNote(remapMF(index), SCENE_LIGHT_CHANNEL, {velocity: 1, rawVelocity: true})
    midiOutput.playNote(remapMF(index), SOURCE_LIGHT_CHANNEL, {velocity: 1, rawVelocity: true})
    // midiOutput.playNote(index+SOURCE_LIGHT_ZERO_NOTE, SOURCE_LIGHT_CHANNEL, {velocity: index, rawVelocity: true})
  }
}
