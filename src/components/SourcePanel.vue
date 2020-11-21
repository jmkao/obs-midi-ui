<template>
  <div class="q-pa-sm">
    <div class="row">
      <SourceButton v-for="(source) in sources" v-bind:key="source.name"
        :obs="obs" :source="source" />
    </div>
  </div>
</template>

<script>
import SourceButton from './SourceButton.vue'

export default {
  name: 'SourcePanel',
  props: {
    obs: Object,
    sources: Array
  },
  components: { SourceButton },
  methods: {
    transition () {
    }
  }
}
</script>
