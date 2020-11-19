<template>
  <q-layout view="lHh Lpr lFf">
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
          <ScenePanel :obs="obs" :scenes="scenes" />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import ScenePanel from 'components/ScenePanel.vue'

export default {
  name: 'MainLayout',
  components: { ScenePanel },
  data () {
    return {
      obsAddress: '',
      obsConnectionPending: false,
      obsIsConnected: false,
      obsBtnColor: 'red',
      obsBtnLabel: 'Connect',
      obsAddressLabel: 'OBS Address',
      obs: window.obs,
      scenes: []
    }
  },
  created: function () {
    this.obs.on('error', err => {
      this.onOBSError(err)
    })

    this.obs.on('ConnectionOpened', this.onOBSConnected)
    this.obs.on('ConnectionClosed', this.onOBSDisconnected)
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
      this.obsBtnColor = 'green'
      this.obsConnectionPending = false
      this.obsIsConnected = true
      this.obs.send('GetSceneList').then(data => {
        console.log('GetSceneList retrieved # scenes: ' + String(data.scenes.length))
        this.scenes = data.scenes
      })
    },
    onOBSDisconnected () {
      this.obsBtnLabel = 'Connect'
      this.obsBtnColor = 'red'
      this.obsConnectionPending = false
      this.obsIsConnected = false
      this.scenes = []
    },
    onOBSError (err) {
      this.disconnectOBS()
      this.onOBSDisconnected()

      console.error('OBS Websocket Error: ', err)
      this.obsAddressLabel = err.description
    }
  }
}
</script>
