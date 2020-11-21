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
    // this.$set(this.status, 'currentIndex', -1)
    // this.$set(this.status, 'previewIndex', -1)
  },
  computed: {
    color: function () {
      if (this.isCurrent) {
        return 'red'
      } else if (this.isPreview) {
        return 'yellow'
      } else {
        return 'white'
      }
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
