<template>
  <section>
    <h2 class="title">Setup the app</h2>
    <details :open="areSettingsOpen">
      <summary>Click to open/change them</summary>

      <form @submit.prevent="save">
        <div class="field">
          <label for="githubOrganization" class="label"
            >GitHub Organization</label
          >
          <div class="control">
            <input
              id="githubOrganization"
              v-model="githubOrganization"
              class="input"
              type="text"
              required
            />
          </div>
          <small
            >Just the name, e.g. for
            <code>https://github.com/github/docs</code> it will be
            <code>github</code>.</small
          >
        </div>

        <div class="field">
          <label for="githubRepository" class="label"
            >GitHub Repository Name</label
          >
          <div class="control">
            <input
              id="githubRepository"
              v-model="githubRepository"
              class="input"
              type="text"
              required
            />
          </div>
          <small
            >Just the name, e.g. for
            <code>https://github.com/github/docs</code> it will be
            <code>docs</code>.</small
          >
        </div>

        <div class="field">
          <label for="githubAccessToken" class="label"
            >GitHub Access Token</label
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
            <a href="https://github.com/settings/tokens/new" target="_blank"
              >Create a GitHub personal access token</a
            >, (the <code>repo</code> permission is enough to create a Release
            and fetch Releases, Issues and Milestones info).
            <a
              href="https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/"
              target="_blank"
              >Details</a
            >.
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
  name: "Settings",
  props: {},
  data() {
    return {
      githubOrganization: localStorage.getItem("githubOrganization") || "",
      githubRepository: localStorage.getItem("githubRepository") || "",
      githubAccessToken: localStorage.getItem("githubAccessToken") || "",
      areSettingsOpen: true
    };
  },
  mounted: function() {
    const areSettingsSaved =
      this.githubOrganization &&
      this.githubRepository &&
      this.githubAccessToken;
    if (areSettingsSaved) {
      this.areSettingsOpen = false;
      this.emitEventWithSettings();
    }
  },
  methods: {
    save: function() {
      localStorage.setItem("githubOrganization", this.githubOrganization);
      localStorage.setItem("githubRepository", this.githubRepository);
      localStorage.setItem("githubAccessToken", this.githubAccessToken);
      this.emitEventWithSettings();
    },
    emitEventWithSettings: function() {
      this.$emit("settings-set", {
        githubOrganization: this.githubOrganization,
        githubRepository: this.githubRepository,
        githubAccessToken: this.githubAccessToken
      });
    }
  }
};
</script>
