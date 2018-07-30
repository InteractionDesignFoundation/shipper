<template>
  <section>
    <h2 class="title">Settings</h2>
    <details :open="areSettingsOpen">
      <summary>Click to open/change them</summary>

      <div class="field">
        <label
          for="githubAccessToken"
          class="label">GitHub access token</label>
        <div class="control">
          <input
            id="githubAccessToken"
            v-model="githubAccessToken"
            class="input"
            type="text">
        </div>
        <small>Need help? <a
          href="https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/"
          target="_blank">Create a GitHub personal token</a>, <code>repo</code> permission is enough.
        </small>
      </div>

      <div class="field">
        <label
          for="deployTriggerWebhookUrl"
          class="label">Deployment trigger URL</label>
        <div class="control">
          <input
            id="deployTriggerWebhookUrl"
            v-model="deployTriggerWebhookUrl"
            class="input"
            type="text">
        </div>
        <small>Need help? Open a site you need to deploy at
          <a 
            href="https://forge.laravel.com/servers"
            target="_blank">Forge</a> and copy "Deployment Trigger URL"</small>
      </div>

      <div>
        <button
          class="button is-success"
          @click="save">Save settings
        </button>
      </div>
    </details>
  </section>
</template>

<script>
  export default {
    name: "Settings",
    props: {},
    data() {
      return {
        githubAccessToken: localStorage.getItem('githubAccessToken') || '',
        deployTriggerWebhookUrl: localStorage.getItem('deployTriggerWebhookUrl') || '',
        areSettingsOpen: true,
      };
    },
    mounted: function () {
      const areSettingsSaved = this.deployTriggerWebhookUrl && this.githubAccessToken;
      if (areSettingsSaved) {
        this.areSettingsOpen = false;
        this.emitEventWithSettings();
      }
    },
    methods: {
      save: function () {
        localStorage.setItem('githubAccessToken', this.githubAccessToken);
        localStorage.setItem('deployTriggerWebhookUrl', this.deployTriggerWebhookUrl);
        this.emitEventWithSettings();
      },
      emitEventWithSettings: function () {
        this.$emit('settings-set', {
          githubAccessToken: this.githubAccessToken,
          deployTriggerWebhookUrl: this.deployTriggerWebhookUrl,
        });
      },
    },
  }
</script>
