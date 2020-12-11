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
        <q-slider
            v-model="value" color="red"
            :min="0" :max="127" :label-value="sevenbitToDB(value).toFixed(1)"
            label dark
          />
      </div>
    </div>
  </div>
</template>

<style scoped>
.fader {
  padding-left: 5px;
  padding-right: 5px;
}
.q-field {
  font-size: 10pt;
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
      selectedSource: '',
      obsUpdateInProgress: false
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
      this.obs.send('SetVolume', { source: this.selectedSource, volume: this.dbToMul(dB), useDecibel: false })
    },
    onMidiEvent (data) {
      // console.log(data)
      this.value = data.value
    },
    obsVolumeChanged (data) {
      if (data.sourceName === this.selectedSource) {
        const mul = data.volume
        const db = this.mulToDB(mul)
        const value = this.dbToSevenbit(db)

        console.log(`OBS volume for ${this.selectedSource} changed to ${mul}, ${db}, ${value}`)
        if (value !== this.value) {
          this.obsUpdateInProgress = true
          this.value = value
        }
      }
    },
    sourceChanged (newSource) {
      if (this.selectedSource === '') {
        return
      }
      (async () => {
        var data = await (this.obs.send('GetVolume', { source: this.selectedSource, useDecibel: false }))
        this.obsVolumeChanged({ sourceName: data.name, volume: data.volume })
      })()
    }
  }
}
</script>
