<template>
  <div class="q-pa-sm full-width">
    <div class="row">
      <div class="col-auto">
        <q-btn icon="insights" size="s" color="red" padding="none" @click="autoUpdateFaders"/>
      </div>
      <Fader v-for="(n, i) in 4" :key="i" :index="i" :obs="obs" :sources="sources" ref="faders"/>
    </div>
  </div>
</template>

<style scoped>
.full-width {
  width: 100% !important;
}
.fader {
  padding-left: 10px;
  padding-right: 10px;
}
</style>

<script>
import Fader from './Fader.vue'

export default {
  name: 'FaderPanel',
  components: { Fader },
  props: {
    obs: Object,
    sources: Array,
    obsIsConnected: Boolean
  },
  data () {
    return {
    }
  },
  created: function () {
    // this.$set(this.status, 'currentIndex', -1)
    // this.$set(this.status, 'previewIndex', -1)
  },
  computed: {
    color: function () {
      return 'white'
    }
  },
  methods: {
    autoUpdateFaders () {
      let anchorSourceIndex = -1
      let anchorNextIndex = -1
      for (let iter = 0; iter < 2; iter++) {
        this.$refs.faders.forEach((fader, i) => {
          if (fader.value === 0) {
            if (anchorNextIndex > -1 && anchorNextIndex < this.sources.length) {
              fader.selectedSource = this.sources[anchorNextIndex].name
              fader.sourceChanged()
              anchorNextIndex++
            }
          } else {
            // Fader is set to non-zero value, so it's an anchor
            anchorSourceIndex = this.sources.findIndex(source => source.name === fader.selectedSource)
            if (anchorSourceIndex > -1) {
              anchorNextIndex = anchorSourceIndex + 1
              if (i > 0) {
                fader.labelBgColor = 'red'
              }
            }
          }
        })
      }
    },
    obsVolumeChanged (data) {
      this.$refs.faders.forEach(fader => {
        fader.obsVolumeChanged(data)
      })
    },
    updateFaderValue (index, value) {
      if (index < 0 || index >= this.$refs.faders.length) {
        return
      }
      // console.log(`updateFaderValue ${index} to ${value}`)
      this.$refs.faders[index].onMidiEvent({ value })
    }
  }
}
</script>
