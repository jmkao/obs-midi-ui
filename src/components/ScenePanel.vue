<template>
  <div class="q-pa-sm doc-container">
    <q-btn v-for="scene in scenes" v-bind:key="scene.name" color="white" text-color="black" :label="scene.name" />
  </div>
</template>

<script>
export default {
  name: 'ScenePanel',
  props: {
    obs: {
      type: Object,
      required: true
    },
    scenes: {
      type: Array,
      required: true
    }
  }
}
</script>
