<template>
  <main id="app">
    <section class="hero">
      <img
        class="hero__image"
        alt="Shipper logo"
        src="./assets/logo.png">
    </section>

    <Settings
      class="step"
      @settings-set="onSettingsSet"/>

    <MilestoneSelector
      v-if="octoGraphClient"
      :octo-graph-client="octoGraphClient"
      class="step"
      @milestone-changed="onMilestoneChanged"/>

    <Milestone
      v-if="selectedMilestone"
      :milestone="selectedMilestone"
      :octo-graph-client="octoGraphClient"
      :octo-rest-repo-client="octoRestRepoClient"
      class="step"
      @new-milestone-created="onNewMilestoneCreated"/>

    <Merge
      v-if="selectedMilestone"
      :octo-rest-repo-client="octoRestRepoClient"
      class="step"
      base-branch="master"
      head-branch="develop"
      @changes-merged="onChangedMerged"/>

    <Release
      v-if="isChangedMerged"
      :octo-rest-repo-client="octoRestRepoClient"
      :milestone="selectedMilestone"
      class="step"
      @release-created="onReleaseCreated"/>

    <Deployment
      v-if="createdRelease"
      :deploy-trigger-webhook-url="deployTriggerWebhookUrl"
      class="step"
      @deployed="onDeployed"/>

    <Merge
      v-if="isDeployed"
      :octo-rest-repo-client="octoRestRepoClient"
      class="step"
      base-branch="develop"
      head-branch="master"/>

    <section 
      v-if="isDeployed" 
      class="step">
      <h2 class="title">🏁 That's it, your are awesome!</h2>
    </section>
  </main>
</template>

<script>
  import wretch from 'wretch'
  import Settings from './components/Settings.vue'
  import MilestoneSelector from './components/MilestoneSelector.vue'
  import Milestone from './components/Milestone.vue'
  import Merge from './components/Merge.vue'
  import Release from './components/Release.vue'
  import Deployment from './components/Deployment.vue'

  export default {
    name: 'App',
    components: {
      Settings,
      MilestoneSelector,
      Milestone,
      Merge,
      Release,
      Deployment,
    },
    data() {
      return {
        octoGraphClient: undefined,
        octoRestRepoClient: undefined,
        selectedMilestone: undefined,

        isChangedMerged: false,

        createdMilestone: undefined,

        createdRelease: undefined,

        deployTriggerWebhookUrl: '',

        isDeployed: false,
      };
    },
    methods: {
      onSettingsSet: function (settings) {
        this.octoGraphClient = wretch()
          .url('https://api.github.com/graphql')
          .errorType('json')
          .auth(`Bearer ${settings.githubAccessToken}`)
          .options({mode: 'cors'});

        this.octoRestRepoClient = wretch()
          .url('https://api.github.com/repos/InteractionDesignFoundation/IDF-web')
          .errorType('json')
          .auth(`Bearer ${settings.githubAccessToken}`)
          .options({mode: 'cors'});

        this.deployTriggerWebhookUrl = settings.deployTriggerWebhookUrl;
      },
      onMilestoneChanged: function (selectedMilestone) {
        this.selectedMilestone = selectedMilestone;
      },
      onNewMilestoneCreated: function (createdMilestone) {
        this.createdMilestone = createdMilestone;
      },
      onChangedMerged: function () {
        this.isChangedMerged = true;
      },
      onReleaseCreated: function (createdRelease) {
        this.createdRelease = createdRelease;
      },
      onDeployed: function () {
        this.isDeployed = true;
      },
    },
  }
</script>

<style>
  :root {
    --blue: rgba(21, 102, 255, 0.67);
    --white: rgb(255, 255, 255);
    --gray: rgb(249, 249, 249);
    --spacing-sm: 10px;
    --spacing-md: 20px;
    --spacing-lg: 50px;
  }

  html {
    padding: 0;
    margin: 0;
    background-color: var(--gray);
  }

  h1 {
    counter-reset: h2counter;
  }

  h2::before {
    content: counter(h2counter) ".\0000a0\0000a0";
    counter-increment: h2counter;
    counter-reset: h3counter;
  }

  #app {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    counter-reset: h2counter;
  }

  main {
    max-width: 900px;
    margin: 0 auto;
  }

  .step {
    margin-bottom: var(--spacing-lg);
    background-color: var(--white);
    padding: var(--spacing-md);
  }

  [disabled] {
    opacity: .6;
  }
</style>
<style scoped>
  .hero {
    margin: var(--spacing-md) 0;
    text-align: center;
  }
  .hero__image {
    max-height: 100px;
    object-fit: contain;
  }
</style>
