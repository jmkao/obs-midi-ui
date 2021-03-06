<template>
  <div class="row justify-center no-wrap">
    <div class="col-2">
      <q-select v-model="midiInputName" :options="midiInputsAvailable" :disable="midiSelectDisabled"
        @filter="initMidi" label="MIDI Inputs" label-color="orange"
        dense hide-bottom-space dark
      />
    </div>
    <div class="col-1">
      <q-btn icon="edit" size="m" color="orange" padding="none" @click="showJsInputTextDialog = true" :disable="midiSelectDisabled" />
    </div>
    <div class="col-2">
      <q-select v-model="midiOutputName" :options="midiOutputsAvailable" :disable="midiSelectDisabled"
        @filter="initMidi" label="MIDI Outputs" label-color="cyan"
        dense hide-bottom-space dark
      />
    </div>
    <div class="col-1">
      <q-btn icon="edit" size="m" color="cyan" padding="none" @click="showJsOutputTextDialog = true" :disable="midiSelectDisabled" />
    </div>
    <div class="col-auto">
      <q-btn :color="midiBtnColor" :label="midiBtnLabel" @click="onMidiBtn"/>
    </div>
    <q-dialog
      v-model="showJsInputTextDialog" @before-hide="parseMidiJsHandler"
      full-width full-height >
      <q-card>
        <q-card-section>
          <div class="text-h6">MIDI Input Dispatcher</div>
        </q-card-section>

        <q-card-section class="q-pt-none editor-height" >
          <jsEditor v-model="midiInputJsText" @init="editorInit" lang="javascript" theme="chrome" width="100%" />
        </q-card-section>

        <q-card-actions align="right" class="bg-white text-teal">
          <q-btn flat label="OK" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog
      v-model="showJsOutputTextDialog" @before-hide="parseMidiJsHandler"
      full-width full-height >
      <q-card>
        <q-card-section>
          <div class="text-h6">MIDI Output Dispatcher</div>
        </q-card-section>

        <q-card-section class="q-pt-none editor-height" >
          <jsEditor v-model="midiOutputJsText" @init="editorInit" lang="javascript" theme="chrome" width="100%" />
        </q-card-section>

        <q-card-actions align="right" class="bg-white text-teal">
          <q-btn flat label="OK" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </div>
</template>

<style scoped>
.editor-height {
  height: 80%;
}
</style>

<script>

// const FADER_CCS = [11, 12, 13, 14]
// const TT_RET_CCS = [21, 22]
// const TT_ADV_CCS = [23, 24]
// const TRANSITION_CCS = [26]
// const SCENE_CC_ZERO = 31

// const SOURCE_CC_ZERO = 0

export default {
  name: 'MidiInputHub',
  components: {
    jsEditor: require('vue2-ace-editor')
  },
  props: {
    obsIsConnected: Boolean,
    // scenes: Array,
    // sources: Array,
    updateFader: Function
  },
  data () {
    return {
      midi: null,
      midiIsConnected: false,
      midiBtnLabel: 'Attach MIDI',
      midiInputsAvailable: null,
      midiInputName: '',
      showJsInputTextDialog: false,
      midiInputJsText: null,
      midiInputJsHandler: null,
      midiOutputsAvailable: null,
      midiOutputName: '',
      showJsOutputTextDialog: false,
      midiOutputJsText: null,
      midiOutputJsHandler: null,
      midiOutput: null
    }
  },
  created: function () {
    this.$root.$on('midiout', this.onMidiOutEvent)

    this.midi = require('webmidi')
    // this.initMidi()

    this.midiInputJsText = this.$q.localStorage.getItem('midiInputJsText')
    if (!this.midiInputJsText) {
      this.midiInputJsText =
`
// Input: midiData
// Output: [ eventName, eventData ]

console.log(midiData);

return [null, null];
`
    }
    this.midiOutputJsText = this.$q.localStorage.getItem('midiOutputJsText')
    if (!this.midiOutputJsText) {
      this.midiOutputJsText =
`
// Input: eventData, midiOutput
// Output: none

console.log(eventData);

`
    }

    this.parseMidiJsHandler()
  },
  destroyed: function () {
    this.$root.$off('midiout')
    this.midiInput.removeListener()
    this.midi.disable()
  },
  computed: {
    midiBtnColor: function () {
      if (this.midiIsConnected) {
        return 'green'
      } else {
        return 'grey'
      }
    },
    midiSelectDisabled: function () {
      if (this.midiIsConnected) {
        return true
      } else {
        return false
      }
    }
  },
  methods: {
    editorInit () {
      require('brace/ext/language_tools')
      require('brace/mode/javascript')
      require('brace/theme/chrome')
    },
    parseMidiJsHandler () {
      this.$q.localStorage.set('midiInputJsText', this.midiInputJsText)
      // eslint-disable-next-line no-new-func
      this.midiInputJsHandler = new Function('midiData', this.midiInputJsText)
      this.$q.localStorage.set('midiOutputJsText', this.midiOutputJsText)
      // eslint-disable-next-line no-new-func
      this.midiOutputJsHandler = new Function('eventData', 'midiOutput', this.midiOutputJsText)
    },
    onMidiBtn () {
      if (this.midiIsConnected) {
        this.disconnectMidi()
        this.midiIsConnected = false
        this.midiBtnLabel = 'Attach MIDI'
      } else {
        const success = this.connectMidi()
        if (success) {
          this.midiIsConnected = true
          this.midiBtnLabel = 'Detach MIDI'
        }
      }
    },
    onMidiOutEvent (eventData) {
      if (this.midiOutput != null) {
        this.midiOutputJsHandler(eventData, this.midiOutput)
      }
    },
    initMidi (val, update, abort) {
      this.midi.disable()
      this.midiInputsAvailable = []
      this.midiOutputsAvailable = []
      this.midi.enable(error => {
        if (error) {
          console.log('Webmidi Error:' + error)
        }
        this.midi.inputs.map(input => {
          this.midiInputsAvailable.push(input.name)
          console.log(`'${input.id} / '${input.name}`)
        })
        this.midi.outputs.map(output => {
          this.midiOutputsAvailable.push(output.name)
          console.log(`'${output.id} / '${output.name}`)
        })

        if (typeof update !== 'undefined') {
          // console.log('Update dropdown')
          update()
        }
      })
    },
    disconnectMidi () {
      this.midiInput.removeListener()
      this.midi.disable()
      this.midiInputName = ''
      this.midiInputsAvailable = []
      this.midiOutputName = ''
      this.midiOutputsAvailable = []
      this.midiOutput = null
    },
    connectMidi () {
      if (!this.midiInputName || this.midiInputName === '') {
        return false
      }

      this.midiInput = this.midi.getInputByName(this.midiInputName)
      console.log(this.midiInput)

      if (!this.midiInput) {
        console.log(`MIDI Input named '${this.midiInputName}' could not be opened`)
        this.onMidiBtn()
        return false
      }

      this.midiInput.addListener('noteon', 'all', data => {
        const channel = data.channel
        const note = data.note.number
        const velocity = data.velocity
        if (!this.obsIsConnected) {
          console.log(`Channel: ${channel} / Note: ${note} / Velocity: ${velocity}`)
        }

        const [eventName, eventData] = this.midiInputJsHandler({ channel, note })
        if (eventName) {
          this.$root.$emit(eventName, eventData)
        }
      })

      this.midiInput.addListener('controlchange', 'all', data => {
        const channel = data.channel
        const control = data.controller.number
        const value = data.value
        if (!this.obsIsConnected) {
          console.log(`Channel: ${channel} / Control: ${control} / Value: ${value}`)
        }

        const [eventName, eventData] = this.midiInputJsHandler({ channel, control, value })
        if (eventName) {
          if (eventName.startsWith('midiFader')) {
            this.updateFader(eventData.index, eventData.value)
            // this.$emit('updateFader', eventData.index, eventData.value)
            // console.log(this.$parent)
            // this.$parent.updateFader(eventData.index, eventData.value)
          } else {
            this.$root.$emit(eventName, eventData)
          }
        }

        // Controls: 11 12 13 14
        // var i = FADER_CCS.indexOf(control)
        // if (i > -1) {
        //   this.$root.$emit('midiFader' + i, {
        //     midi: this.midi,
        //     channel: channel,
        //     control: control,
        //     value: value
        //   })
        //   return
        // }

        // // Buttons only test if value = 127
        // if (value === 127) {
        //   i = TT_ADV_CCS.indexOf(control)
        //   if (i > -1) {
        //     this.$root.$emit('timetable', 'advance')
        //   }

        //   i = TT_RET_CCS.indexOf(control)
        //   if (i > -1) {
        //     this.$root.$emit('timetable', 'retract')
        //   }

        //   i = TRANSITION_CCS.indexOf(control)
        //   if (i > -1) {
        //     this.$root.$emit('transition')
        //   }

        //   if (control >= SCENE_CC_ZERO && control < (SCENE_CC_ZERO + this.scenes.length)) {
        //     const event = 'scene' + (control - SCENE_CC_ZERO)
        //     // console.log('Sending event ' + event)
        //     this.$root.$emit(event)
        //   }
        // }
      })

      console.log(this.midiOutputName)
      if (this.midiOutputName) {
        this.midiOutput = this.midi.getOutputByName(this.midiOutputName)
        console.log(this.midiOutput)

        if (!this.midiOutput) {
          console.log(`MIDI Output named ${this.midiOutputName} could not be opened`)
          return true
        }
      }
      this.$root.$emit('midiout', { name: 'init' })

      return true
    }
  }
}
</script>
