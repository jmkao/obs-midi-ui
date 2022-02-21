
const { contextBridge } = require('electron')

const OBSWebSocket = require('obs-websocket-js')

// contextBridge.exposeInMainWorld(
//   'obswebsocket',
//   {
//     make: () => { return new OBSWebSocket() }
//   }
// )

window.OBSWebSocket = OBSWebSocket

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
