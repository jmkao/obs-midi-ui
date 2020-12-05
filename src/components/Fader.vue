<template>
  <div class="col fader">
    <div class="row">
      <div class="col-4 fader">
        <q-select v-model="selectedSource" :options="sources" option-label="name" option-value="name"
            map-options emit-value dark dense borderless hide-bottom-space
          />
      </div>
      <div class="col fader">
        <q-slider
            v-model="value" color="red"
            :min="0" :max="127" :label-value="calcDB(value).toFixed(1)"
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
      selectedSource: ''
    }
  },
  created: function () {
    this.$root.$on('midiFader' + this.index, this.onMidiEvent)
  },
  destroyed: function () {
    this.$root.$off('midiFader' + this.index)
  },
  watch: {
    value: function (value) {
      if (!this.selectedSource || this.selectedSource.length === 0 || this.selectedSource === '') {
        return
      }
      const dB = this.calcDB(value)
      this.obs.send('SetVolume', { source: this.selectedSource, volume: dB, useDecibel: true })
    }
  },
  computed: {
    color: function () {
      return 'white'
    }
  },
  methods: {
    calcDB (sevenbit) {
      let dB = (sevenbit - 127) / 2.1167
      if (sevenbit === 0) {
        dB = -100.0
      }
      return dB
    },
    onMidiEvent (data) {
      // console.log(data)
      this.value = data.value
    }
  }
}
</script>
