<template>
  <q-layout class="base" view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          OBS Festival Control
        </q-toolbar-title>
        <div class='row'>
          <div class='col'>

        <q-btn :loading="obsConnectionPending" :color="obsBtnColor" @click="onConnectBtn()" :label="obsBtnLabel" />
          </div>
          <div class='col-auto'>
        <q-input outlined bg-color="white" v-model="obsAddress" :label="obsAddressLabel" stack-label :dense="true" />
          </div>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page>
        <div class="q-pa-sm doc-container">
          <div class="row flex-nowrap">
            <FaderPanel :obs="obs" :sources="sources" />
          </div>
          <div class="row">
            <q-btn color="grey" stack icon="navigate_before" class="col-auto mini" label="Timetable" @click="obs.send('TriggerHotkeyByName', {hotkeyName: 'ROTATE_ccw'})" />
            <q-btn color="grey" stack icon="navigate_next" class="col-auto mini" label="Timetable" @click="obs.send('TriggerHotkeyByName', {hotkeyName: 'ROTATE_cw'})"/>
            <q-btn color="red" class="col" label="Transition" @click="transition()" />
          </div>
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
</style>

<script>
import ScenePanel from 'components/ScenePanel.vue'
import SourcePanel from 'components/SourcePanel.vue'
import FaderPanel from 'components/FaderPanel.vue'

export default {
  name: 'MainLayout',
  components: { ScenePanel, SourcePanel, FaderPanel },
  data () {
    return {
      obsAddress: '',
      obsConnectionPending: false,
      obsIsConnected: false,
      obsBtnLabel: 'Connect',
      obsAddressLabel: 'OBS Address',
      obs: {},
      scenes: [],
      sources: [],
      srcMap: null,
      status: {
        previewIndex: -1,
        currentIndex: -1
      },
      midi: null,
      midiInput: null,
      midiOutput: null
    }
  },
  computed: {
    obsBtnColor: function () {
      if (this.obsIsConnected) {
        return 'green'
      } else {
        return 'red'
      }
    }
  },
  created: function () {
    this.midi = require('webmidi')
    this.midi.enable(error => {
      if (error) {
        console.log('Webmidi Error:' + error)
      }
      console.log(this.midi.inputs)
      console.log(this.midi.outputs)

      this.midiInput = this.midi.getInputByName('useMulti')
      this.midiInput.addListener('controlchange', 'all', data => {
        const channel = data.channel
        const control = data.controller.number
        const value = data.value
        if (!this.obsIsConnected) {
          console.log(`Channel: ${channel} / Control: ${control} / Value: ${value}`)
        }
        // Controls: 73 75 72 91
        if (channel === 1) {
          if (control === 73) {
            this.$root.$emit('midiFader0', {
              midi: this.midi,
              channel: channel,
              control: control,
              value: value
            })
          } else if (control === 75) {
            this.$root.$emit('midiFader1', {
              midi: this.midi,
              channel: channel,
              control: control,
              value: value
            })
          } else if (control === 72) {
            this.$root.$emit('midiFader2', {
              midi: this.midi,
              channel: channel,
              control: control,
              value: value
            })
          } else if (control === 91) {
            this.$root.$emit('midiFader3', {
              midi: this.midi,
              channel: channel,
              control: control,
              value: value
            })
          }
        }
      })
    })
  },
  destroyed: function () {
    this.midi.disable()
    try {
      this.obs.disconnect()
    } catch (err) {
      // Do nothing
    }
  },
  methods: {
    onConnectBtn () {
      if (this.obsConnectionPending) {
        return
      }

      this.obsConnectionPending = true

      if (this.obsIsConnected) {
        this.disconnectOBS()
      } else {
        this.connectOBS()
      }
    },
    connectOBS () {
      this.initOBS()
      this.obs.connect({ address: this.obsAddress })
        .catch(err => {
          this.onOBSError(err)
        })
    },
    disconnectOBS () {
      this.obs.disconnect()
    },
    onOBSConnected () {
      this.obsBtnLabel = 'Disconnect'
      this.obsConnectionPending = false
      this.obsIsConnected = true
      this.obs.send('GetSceneList').then(data => {
        console.log('GetSceneList retrieved # scenes: ' + String(data.scenes.length))
        this.scenes = data.scenes

        this.status.currentIndex = this.findSceneIndex(data.currentScene)

        this.obs.send('GetPreviewScene').then(data => {
          this.status.previewIndex = this.findSceneIndex(data.name)
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
    transition () {
      this.obs.send('TransitionToProgram')
    },
    initOBS () {
      try {
        this.obs.disconnect()
      } catch (err) {
        // Do nothing
      }

      this.obs = new window.OBSWebSocket()

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
    },
    notifySourceUpdate (sourceName) {
      console.log('notifySourceUpdate to ' + sourceName)
      this.srcMap.get(sourceName).needsUpdate = true
    }
  }
}
</script>
