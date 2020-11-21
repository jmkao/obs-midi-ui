<template>
  <div class="col fader">
    <div class="row">
      <div class="col-4 fader">
        <q-select v-model="selectedSource" :options="sources" option-label="name" option-value="name"
            map-options emit-value dark dense
          />
      </div>
      <div class="col fader">
        <q-slider
            v-model="value" color="red"
            :min="0" :max="127"
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
  watch: {
    value: function (value) {
      if (!this.selectedSource || this.selectedSource.length === 0 || this.selectedSource === '') {
        return
      }
      let dB = (value - 127) / 2.1167
      if (value === 0) {
        dB = -100.0
      }
      this.obs.send('SetVolume', { source: this.selectedSource, volume: dB, useDecibel: true })
    }
  },
  computed: {
    color: function () {
      return 'white'
    }
  },
  methods: {
    switchToScene () {
    },
    onMidiEvent (data) {
      // console.log(data)
      this.value = data.value
    }
  }
}
</script>
