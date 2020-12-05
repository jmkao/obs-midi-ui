<template>
  <div class="q-pa-sm">
    <div class="row">
      <SourceButton v-for="(source, i) in sources" v-bind:key="source.name"
        :obs="obs" :source="source" :index="i"/>
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
