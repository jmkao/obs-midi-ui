<template>
  <div class="quarter">
    <q-btn class="full-width" :color="color" text-color="black" :label="scene.name" @click="switchToScene()"/>
  </div>
</template>

<style scoped>
.quarter {
  width: 25% !important;
}

.full-width {
  height: 80px;
}
.q-btn {
  line-height: 1em;
}
</style>

<script>
export default {
  name: 'SceneButton',
  props: {
    obs: Object,
    scene: Object,
    index: Number,
    isPreview: Boolean,
    isCurrent: Boolean
    // status: Object
  },
  created: function () {
    this.$root.$on('scene' + this.index, this.switchToScene)
  },
  destroyed: function () {
    this.$root.$off('scene' + this.index)
  },
  computed: {
    color: function () {
      let color = 'white'
      if (this.isCurrent) {
        color = 'red'
      } else if (this.isPreview) {
        color = 'yellow'
      }
      console.log(`scene${this.index} color changed to ${color}`)
      this.$root.$emit('midiout', { name: 'scene', index: this.index, color })
      return color
    }
  },
  methods: {
    switchToScene () {
      console.log(`switchToScene("${this.scene.name}")`)
      this.obs.send('SetPreviewScene', { 'scene-name': this.scene.name })
    }
  }
}
</script>
