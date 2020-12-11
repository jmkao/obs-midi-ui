<template>
  <div class="col fader">
    <div class="row">
      <div class="col-auto fader">
        <q-select v-model="selectedSource" :options="sources" option-label="name" option-value="name"
            @input="sourceChanged"
            map-options emit-value dark dense borderless hide-bottom-space
          />
      </div>
      <div class="col fader">
        <q-slider class="overlay-group"
            v-model="value" color="red" @change="faderUIChanged"
            :min="0" :max="127" :label-value="sevenbitToDB(value).toFixed(1)"
            label-always dark
          />
        <q-slider v-model="midiValue" class="overlay overlay-group" color="grey-9" :min="0" :max="127" dark readonly />
      </div>
    </div>
  </div>
</template>

<style scoped>
.fader {
  padding-left: 5px;
  padding-right: 5px;
  position: relative;
  z-index: 1;
}
.q-field {
  font-size: 10pt;
}
.overlay-group {
  position: absolute;
}
.overlay {
  z-index: -1;
}
</style>

<script>
export default {
  name: 'Fader',
  props: {
    obs: Object,
    sources: Array,
    index: Number
  },
  data () {
    return {
      value: 0,
      midiValue: 0,
      isMidiLocked: false,
      selectedSource: '',
      obsUpdateInProgress: false,
      localUpdateInProgress: false
    }
  },
  created: function () {
    this.$root.$on('midiFader' + this.index, this.onMidiEvent)
  },
  destroyed: function () {
    this.$root.$off('midiFader' + this.index)
  },
  watch: {
    value: function (newValue, oldValue) {
      if (newValue === oldValue || this.obsUpdateInProgress) {
        this.obsUpdateInProgress = false
        return
      }
      this.sendValueToObs(newValue)
    }
  },
  computed: {
    color: function () {
      return 'white'
    }
  },
  methods: {
    sevenbitToDB (sevenbit) {
      let dB = (sevenbit - 127) / 2.11666
      if (sevenbit === 0) {
        dB = -100.0
      }
      return dB
    },
    dbToMul (db) {
      return Math.pow(10, db / 20.0)
    },
    mulToDB (mul) {
      return 20 * Math.log10(mul)
    },
    dbToSevenbit (db) {
      if (db < -60) {
        db = -60
      }
      return Math.round(db * 2.11666) + 127
    },
    sendValueToObs (value) {
      if (!this.selectedSource || this.selectedSource.length === 0 || this.selectedSource === '') {
        return
      }
      const dB = this.sevenbitToDB(value)
      this.localUpdateInProgress = true
      this.obs.send('SetVolume', { source: this.selectedSource, volume: this.dbToMul(dB), useDecibel: false })
    },
    faderUIChanged () {
      this.isMidiLocked = false
    },
    onMidiEvent (data) {
      // console.log(data)
      this.midiValue = data.value

      if (this.isMidiLocked) {
        this.value = this.midiValue
      } else if (Math.abs(this.midiValue - this.value) < 2) {
        this.isMidiLocked = true
        this.value = this.midiValue
      }
    },
    obsVolumeChanged (data) {
      if (data.sourceName === this.selectedSource) {
        if (this.localUpdateInProgress) {
          this.localUpdateInProgress = false
          return
        }

        const mul = data.volume
        const db = this.mulToDB(mul)
        const value = this.dbToSevenbit(db)

        // console.log(`OBS volume for ${this.selectedSource} changed to ${mul}, ${db}, ${value}`)
        if (value !== this.value) {
          this.obsUpdateInProgress = true
          this.value = value
          this.isMidiLocked = false
        }
      }
    },
    sourceChanged (newSource) {
      if (this.selectedSource === '') {
        return
      }
      this.isMidiLocked = false;

      (async () => {
        var data = await (this.obs.send('GetVolume', { source: this.selectedSource, useDecibel: false }))
        this.obsVolumeChanged({ sourceName: data.name, volume: data.volume })
      })()
    }
  }
}
</script>
