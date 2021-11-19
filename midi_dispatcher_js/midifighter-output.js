/* eslint-disable semi */
/* eslint-disable no-undef */
// Input 1: eventData { name, index, color }
// Input 2: midiOutput
// Output: none

const SCENE_LIGHT_CHANNEL = 16;

const SOURCE_LIGHT_CHANNEL = 16;

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

console.log(eventData);

function remapMF (note) {
  var mapNote = note
  if (note >= 0 && note < 64) {

    mapNote = ZERO_TO_MF[note]
  }
  console.log(`remapMF() output note ${note} to ${mapNote}`)
  return mapNote
}

if (eventData.name === 'scene') {
  const index = eventData.index
  const color = eventData.color

  // for (index = 0; index < 127; index ++)
  //     midiOutput.playNote(index+SCENE_LIGHT_ZERO_NOTE, SCENE_LIGHT_CHANNEL, {velocity: index, rawVelocity: true})

  switch (color) {
    case 'white':
      midiOutput.playNote(remapMF(index), SCENE_LIGHT_CHANNEL, {velocity: 79, rawVelocity: true})
      break;
    case 'yellow':
      midiOutput.playNote(remapMF(index), SCENE_LIGHT_CHANNEL, {velocity: 37, rawVelocity: true})
      break;
    case 'red':
      midiOutput.playNote(remapMF(index), SCENE_LIGHT_CHANNEL, {velocity: 13, rawVelocity: true})
      break;
  }
} else if (eventData.name === 'source') {
  const index = eventData.index;
  const color = eventData.color;
  switch (color) {
    case 'white':
      midiOutput.playNote(remapMF(index), SOURCE_LIGHT_CHANNEL, {velocity: 79, rawVelocity: true})
      break;
    case 'yellow':
      midiOutput.playNote(remapMF(index), SOURCE_LIGHT_CHANNEL, {velocity: 37, rawVelocity: true})
      break;
    case 'red':
      midiOutput.playNote(remapMF(index), SOURCE_LIGHT_CHANNEL, {velocity: 13, rawVelocity: true})
      break;
  }
} else if (eventData.name === 'init') {
  for (index = 0; index < 64; index++) {
    midiOutput.playNote(remapMF(index), SCENE_LIGHT_CHANNEL, {velocity: 1, rawVelocity: true})
    midiOutput.playNote(remapMF(index), SOURCE_LIGHT_CHANNEL, {velocity: 1, rawVelocity: true})
    // midiOutput.playNote(index+SOURCE_LIGHT_ZERO_NOTE, SOURCE_LIGHT_CHANNEL, {velocity: index, rawVelocity: true})
  }
}
