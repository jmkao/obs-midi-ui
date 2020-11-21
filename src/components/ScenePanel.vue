<template>
  <div class="q-pa-sm">
    <div class="row">
      <SceneButton v-for="(scene, i) in scenes" v-bind:key="scene.name"
        :obs="obs" :scene="scene" :index="i" :status="status"
        :isPreview="i==status.previewIndex?true:false"
        :isCurrent="i==status.currentIndex?true:false"/>
    </div>
  </div>
</template>

<script>
import SceneButton from './SceneButton.vue'

export default {
  name: 'ScenePanel',
  props: {
    obs: Object,
    scenes: Array,
    status: Object
  },
  components: { SceneButton },
  methods: {
  }
}
</script>
