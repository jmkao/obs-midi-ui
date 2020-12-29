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
.quarter:nth-child(16n+17) {
  padding-top: 24px;
}
.quarter:nth-child(16n+18) {
  padding-top: 24px;
}
.quarter:nth-child(16n+19) {
  padding-top: 24px;
}
.quarter:nth-child(16n+20) {
  padding-top: 24px;
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
    source: Object,
    index: Number
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
    this.$root.$on('source' + this.index, this.onClick)
  },
  destroyed: function () {
    this.$root.$off('source' + this.index)
  },
  computed: {
    color: function () {
      let color = 'white'
      if (this.mediaState === 'playing') {
        if (this.settings.is_local_file) {
          color = 'green'
        } else {
          color = 'red'
        }
      } else if (this.mediaState === 'paused') {
        color = 'yellow'
      }
      this.$root.$emit('midiout', { name: 'source', index: this.index, color })
      return color
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
        setTimeout(this.loadMediaState, 50)
      })()
    },
    loadSourceSettings (source) {
      (async () => {
        var data = await (this.obs.send('GetSourceSettings', { sourceName: this.source.name }))
        this.settings = data.sourceSettings
        // console.log(data.sourceSettings)
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
