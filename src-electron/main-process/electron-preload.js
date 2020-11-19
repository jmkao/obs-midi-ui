const OBSWebSocket = require('obs-websocket-js')

window.obs = new OBSWebSocket()

// const obs = new OBSWebSocket()

// obs.on('ConnectionOpened', () => {
//   console.log('OBS Websocket Connection Opened')
// })

// obs.on('MediaStarted', data => {
//   console.log('Media Started: ', data)
// })

// obs.on('MediaEnded', data => {
//   console.log('Media Ended: ', data)
// })

// obs.connect()
