<template>
  <div class="quarter">
    <q-btn class="full-width" stack :color="color" text-color="black" @click="onClick()">
      <q-icon :name="icon" />
      <div class="label">
        {{source.name}}
      </div>
    </q-btn>
  </div>
</template>

<style scoped>
.label {
  line-height: 1em;
  padding-top: 5px;
}
.quarter {
  width: 25% !important;
}

.full-width {
  height: 80px;
}
</style>

<script>
export default {
  name: 'SourceButton',
  props: {
    obs: Object,
    source: Object
  },
  data () {
    return {
      settings: {},
      mediaState: 'unknown'
    }
  },
  created: function () {
    // this.$set(this.status, 'currentIndex', -1)
    // this.$set(this.status, 'previewIndex', -1)
    this.loadSourceSettings(this.source)
    this.loadMediaState()
  },
  computed: {
    color: function () {
      if (this.mediaState === 'playing') {
        return 'red'
      } else if (this.mediaState === 'paused') {
        return 'yellow'
      }
      return 'white'
    },
    icon: function () {
      if (this.settings.is_local_file) {
        if (this.mediaState === 'playing') {
          return 'pause'
        } else {
          return 'play_arrow'
        }
      } else {
        return 'autorenew'
      }
    }
  },
  watch: {
    source: {
      deep: true,
      handler () {
        this.source.needsUpdate = false
        // this.loadSourceSettings(this.source)
        this.loadMediaState()
      }
    }
  },
  methods: {
    onClick () {
      if (this.settings.is_local_file) {
        if (this.mediaState === 'playing') {
          this.obs.send('PlayPauseMedia', { sourceName: this.source.name, playPause: true })
        } else if (this.mediaState === 'paused') {
          this.obs.send('PlayPauseMedia', { sourceName: this.source.name, playPause: false })
        } else {
          this.obs.send('RestartMedia', { sourceName: this.source.name })
        }
      } else {
        this.reloadSource()
      }
    },
    reloadSource () {
      (async () => {
        var data = await (this.obs.send('GetSourceSettings', { sourceName: this.source.name }))
        this.settings = data.sourceSettings
        await this.obs.send('SetSourceSettings', {
          sourceName: this.source.name,
          sourceSettings: data.sourceSettings
        })
        this.loadMediaState()
      })()
    },
    loadSourceSettings (source) {
      (async () => {
        var data = await (this.obs.send('GetSourceSettings', { sourceName: this.source.name }))
        this.settings = data.sourceSettings
        console.log(data.sourceSettings)
      })()
    },
    loadMediaState () {
      (async () => {
        var data = await (this.obs.send('GetMediaState', { sourceName: this.source.name }))
        this.mediaState = data.mediaState
        console.log(`Media state is ${this.mediaState} for source ${this.source.name}`)
      })()
    }
  }
}
</script>
