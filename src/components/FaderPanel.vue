<template>
  <div class="q-pa-sm full-width">
    <div class="row">
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
    sources: Array
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
