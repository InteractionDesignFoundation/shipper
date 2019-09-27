<template>
  <section>
    <h2 class="title">Setup the app</h2>
    <details :open="areSettingsOpen">
      <summary>Click to open/change them</summary>

      <form @submit.prevent="save">
        <div class="field">
          <label for="githubAccessToken" class="label"
            >GitHub access token</label
          >
          <div class="control">
            <input
              id="githubAccessToken"
              v-model="githubAccessToken"
              class="input"
              type="text"
              required
              minlength="40"
              maxlength="40"
            />
          </div>
          <small
            >Need help?
            <a
              href="https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/"
              target="_blank"
              >Create a GitHub personal access token</a
            >, (<code>repo</code> permission is enough to create a Release and
            fetch Releases, Issues and Milestones info).
          </small>
        </div>

        <div>
          <button type="submit" class="button is-success">
            Save settings
          </button>
        </div>
      </form>
    </details>
  </section>
</template>

<script>
export default {
  name: 'Settings',
  props: {},
  data() {
    return {
      githubAccessToken: localStorage.getItem('githubAccessToken') || '',
      areSettingsOpen: true,
    }
  },
  mounted: function() {
    const areSettingsSaved = this.githubAccessToken
    if (areSettingsSaved) {
      this.areSettingsOpen = false
      this.emitEventWithSettings()
    }
  },
  methods: {
    save: function() {
      localStorage.setItem('githubAccessToken', this.githubAccessToken)
      this.emitEventWithSettings()
    },
    emitEventWithSettings: function() {
      this.$emit('settings-set', {
        githubAccessToken: this.githubAccessToken,
      })
    },
  },
}
</script>
