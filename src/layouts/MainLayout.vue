<template>
  <q-layout class="base" view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <div class='row justify-between full-width'>
          <div class="col-auto">
            <q-toolbar-title>
              OBS Festival Control
            </q-toolbar-title>
          </div>
          <div class="col-grow">
            <MidiHub :obsIsConnected="obsIsConnected" :scenes="scenes" :sources="sources" :updateFader="updateFader" />
          </div>
          <div class='col-auto'>
            <div class='row no-wrap justify-end'>
              <q-btn :loading="obsConnectionPending" :color="obsBtnColor" @click="onConnectBtn()" :label="obsBtnLabel" />
              <q-input outlined bg-color="white" v-model="obsAddress" :label="obsAddressLabel" stack-label :dense="true" />
            </div>
          </div>
        </div>
      </q-toolbar>
      <div class="row flex-nowrap" style="background-color: black;">
        <FaderPanel :obs="obs" :sources="sources" :obsIsConnected="obsIsConnected" ref="faderPanel" />
      </div>
      <div class="row">
        <q-btn color="grey" stack icon="navigate_before" class="col-auto mini" label="Timetable" @click="timetable('retract')" />
        <q-btn color="grey" stack icon="linked_camera" class="col-auto mini" label="Active" @click="screenshot('active')"/>
        <q-btn color="red" class="col" label="Transition" @click="transition()">
        </q-btn>
        <q-btn color="grey" stack icon="navigate_before" class="col-auto mini" label="Timetable" @click="timetable('retract')" />
        <q-btn color="grey" stack icon="navigate_next" class="col-auto mini" label="Timetable" @click="timetable('advance')"/>
        <q-btn color="red" class="col" label="Transition" @click="transition()" />
        <q-btn color="grey" stack icon="linked_camera" class="col-auto mini" label="Active" @click="screenshot('active')" />
        <q-btn color="grey" stack icon="navigate_next" class="col-auto mini" label="Timetable" @click="timetable('advance')"/>
          <q-menu touch-position context-menu>
            <div class="row q-pa-md column">
              <q-toggle v-model="linkTransitionTTAdvance" label="Link Transition to Timetable Advance"
                @update:model-value="(value) => $q.localStorage.set('linkTransitionTTAdvance', value) "/>
              <q-toggle v-model="linkTransitionTTRetract" label="Link Transition to Timetable Retract"
                @update:model-value="(value) => $q.localStorage.set('linkTransitionTTRetract', value) "/>
            </div>
          </q-menu>
      </div>
    </q-header>

    <q-page-container>
      <q-page>
        <div class="q-pa-sm">
            <div class="row">
              <div class="col panel">
                <ScenePanel :obs="obs" :scenes="scenes" :status="status" />
              </div>
              <div class="col panel">
                <SourcePanel :obs="obs" :sources="sources" />
              </div>
            </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.mini {
  font-size: 6pt;
}
.base {
  background-color: black;
}
.flex-nowrap {
  flex-wrap: 0;
}
.panel {
  width: 50%;
  background-color: #505050;
  flex-grow: 1;
  flex-wrap: 1;
  margin: 5px 5px;
}
.scrollable {
  overflow: auto;
}
</style>

<script>
import ScenePanel from 'components/ScenePanel.vue'
import SourcePanel from 'components/SourcePanel.vue'
import FaderPanel from 'components/FaderPanel.vue'
import MidiHub from 'components/MidiHub.vue'

var interval = null

export default {
  name: 'MainLayout',
  components: { ScenePanel, SourcePanel, FaderPanel, MidiHub },
  data () {
    return {
      obsAddress: '',
      obsConnectionPending: false,
      obsIsConnected: false,
      obsBtnLabel: 'Connect',
      obsAddressLabel: 'OBS Address',
      obsStreamingStatus: null,
      obs: {},
      scenes: [],
      sources: [],
      srcMap: null,
      status: {
        previewIndex: -1,
        currentIndex: -1
      },
      linkTransitionTTAdvance: false,
      linkTransitionTTRetract: false
    }
  },
  computed: {
    obsBtnColor: function () {
      if (this.obsIsConnected) {
        return 'green'
      } else {
        return 'grey'
      }
    }
  },
  mounted: function () {
    this.$global.$on('transition', this.transition)
    this.$global.$on('timetable', this.timetable)
    this.$global.$on('screenshot', this.screenshot)

    if (this.$q.localStorage.has('linkTransitionTTAdvance')) {
      this.linkTransitionTTAdvance = this.$q.localStorage.getItem('linkTransitionTTAdvance')
    }

    if (this.$q.localStorage.has('linkTransitionTTRetract')) {
      this.linkTransitionTTRetract = this.$q.localStorage.getItem('linkTransitionTTRetract')
    }

    if (this.$q.localStorage.has('lastObsAddress')) {
      this.obsAddress = this.$q.localStorage.getItem('lastObsAddress')
    }
  },
  unmounted: function () {
    try {
      this.disconnectOBS()
    } catch (err) {
      // Do nothing
    }
    this.$global.$off('transition')
    this.$global.$off('timetable')
    this.$global.$off('screenshot')
  },
  methods: {
    updateFader (index, value) {
      // console.log(this.$refs.faderPanel)
      this.$refs.faderPanel.updateFaderValue(index, value)
    },
    onConnectBtn () {
      if (this.obsConnectionPending) {
        return
      }

      this.obsConnectionPending = true

      if (this.obsIsConnected) {
        this.disconnectOBS()
      } else {
        try {
          this.connectOBS()
        } catch (err) {
          console.log(err)
          this.obsConnectionPending = false
        }
      }
    },
    connectOBS () {
      this.initOBS()

      let secure = false
      let parsedAddress = this.obsAddress
      if (this.obsAddress.startsWith('wss://')) {
        secure = true
        parsedAddress = this.obsAddress.slice(6)
      } else if (this.obsAddress.startsWith('ws://')) {
        secure = false
        parsedAddress = this.obsAddress.slice(5)
      }

      this.obs.connect({ address: parsedAddress, secure })
        .catch(err => {
          this.onOBSError(err)
        })

      clearInterval(interval)
      interval = setInterval(this.obsInterval, 1000)
    },
    obsInterval () {
      this.obs.send('GetStreamingStatus').then(data => {
        this.obsStreamingStatus = data
      })
    },
    disconnectOBS () {
      clearInterval(interval)
      this.obs.disconnect()
      this.obsConnectionPending = false
    },
    onOBSConnected () {
      this.obsBtnLabel = 'Disconnect'
      this.obsConnectionPending = false
      this.obsIsConnected = true
      this.$q.localStorage.set('lastObsAddress', this.obsAddress)
      this.obs.send('GetSceneList').then(data => {
        console.log('GetSceneList retrieved # scenes: ' + String(data.scenes.length))
        this.scenes = data.scenes

        this.status.currentIndex = this.findSceneIndex(data.currentScene)

        this.obs.send('GetPreviewScene').then(data => {
          this.status.previewIndex = this.findSceneIndex(data.name)
        })
        .catch( err => {
          console.log(err)
        })

        this.obs.send('GetSourcesList').then(data => {
          var srcMap = new Map()

          data.sources.sort((a, b) => {
            if (a.name < b.name) {
              return -1
            } else if (a.name > b.name) {
              return 1
            } else {
              return 0
            }
          })

          data.sources.forEach((source, i) => {
            if (source.typeId === 'ffmpeg_source') {
              source.needsUpdate = false
              srcMap.set(source.name, source)
            }
          })

          data.sources = Array.from(srcMap.values())

          this.sources = data.sources
          this.srcMap = srcMap
        })
      })
    },
    onOBSDisconnected () {
      this.obsBtnLabel = 'Connect'
      this.obsConnectionPending = false
      this.obsIsConnected = false
      this.scenes = []
      this.sources = []
      this.status.previewIndex = -1
      this.status.currentIndex = -1
    },
    onOBSError (err) {
      if (err.code === 'CONNECTION_ERROR') {
        this.disconnectOBS()
        this.onOBSDisconnected()
        this.obsAddressLabel = err.description
      }

      this.obsConnectionPending = false
      console.error('OBS Websocket Error: ', err)
    },
    findSceneIndex (sceneName) {
      console.log(`findScene("${sceneName}")`)
      for (var i = 0; i < this.scenes.length; i++) {
        if (this.scenes[i].name === sceneName) {
          return i
        }
      }
      return -1
    },
    screenshot (scene) {
      if (!this.obsIsConnected) {
        return
      }

      if (typeof scene === 'undefined' || scene === 'active') {
        this.obs.send('TriggerHotkeyByName', { hotkeyName: 'OBSBasic.Screenshot' })
        console.log('Screenshot Active')
      } else {
        if (this.status.previewIndex >= 0) {
          this.obs.send('TriggerHotkeyByName', { hotkeyName: 'OBSBasic.SelectedSourceScreenshot' })
          console.log('Screenshot Preview')
        }
      }
    },
    transition () {
      if (!this.obsIsConnected) {
        return
      }
      this.obs.send('TransitionToProgram')
      if (this.linkTransitionTTAdvance) {
        this.timetable('advance')
      }
      if (this.linkTransitionTTRetract) {
        this.timetable('retract')
      }
    },
    timetable (direction) {
      if (!this.obsIsConnected) {
        return
      }
      if (direction === 'retract') {
        // this.obs.send('TriggerHotkeyByName', { hotkeyName: 'ROTATE_ccw' })
        this.obs.send('TriggerHotkeyBySequence', { keyId: 'OBS_KEY_NUMASTERISK' })
      } else {
        // this.obs.send('TriggerHotkeyByName', { hotkeyName: 'ROTATE_cw' })
        this.obs.send('TriggerHotkeyBySequence', { keyId: 'OBS_KEY_NUMMINUS' })
      }
    },
    initOBS () {
      try {
        this.obs.disconnect()
      } catch (err) {
        // Do nothing
      }

      // this.obs = window.obswebsocket.make()
      const OBSWebSocket = require('obs-websocket-js')
      this.obs = new OBSWebSocket()
      // this.obs = new window.OBSWebSocket()

      this.obs.on('error', err => {
        this.onOBSError(err)
      })

      this.obs.on('ConnectionOpened', this.onOBSConnected)
      this.obs.on('ConnectionClosed', this.onOBSDisconnected)
      this.obs.on('SwitchScenes', (data) => { this.status.currentIndex = this.findSceneIndex(data.sceneName) })
      this.obs.on('PreviewSceneChanged', (data) => { this.status.previewIndex = this.findSceneIndex(data.sceneName) })
      this.obs.on('MediaPlaying', data => { this.notifySourceUpdate(data.sourceName) })
      this.obs.on('MediaEnded', data => { this.notifySourceUpdate(data.sourceName) })
      this.obs.on('MediaPaused', data => { this.notifySourceUpdate(data.sourceName) })
      this.obs.on('MediaRestarted', data => { this.notifySourceUpdate(data.sourceName) })
      this.obs.on('SourceVolumeChanged', data => {
        // console.log(this.$refs.faderPanel)
        this.$refs.faderPanel.obsVolumeChanged(data)
      })
    },
    notifySourceUpdate (sourceName) {
      console.log('notifySourceUpdate to ' + sourceName)
      this.srcMap.get(sourceName).needsUpdate = true
    }
  }
}
</script>
