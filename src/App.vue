<template>
  <main id="app">
    <section class="hero">
      <img class="hero__image" alt="Shipper logo" src="./assets/logo.png" />
    </section>

    <Settings class="step" @settings-set="onSettingsSet" />

    <MilestoneSelector
      v-if="octoGraphClient"
      :octo-graph-client="octoGraphClient"
      class="step"
      @milestone-changed="onMilestoneChanged"
    />

    <Milestone
      v-if="selectedMilestone"
      :milestone="selectedMilestone"
      :octo-graph-client="octoGraphClient"
      :octo-rest-repo-client="octoRestRepoClient"
      class="step"
      @new-milestone-created="completeMilestoneUpdateStep"
      @new-milestone-creating-skipped="completeMilestoneUpdateStep"
    />

    <Release
      v-if="milestoneUpdateCompleted"
      :octo-rest-repo-client="octoRestRepoClient"
      :octo-graph-client="octoGraphClient"
      :milestone="selectedMilestone"
      :targetBranch="branchToTag"
      class="step"
      @release-created="onReleaseCreated"
    />

    <AfterDeployChecklist v-if="createdRelease" />
  </main>
</template>

<script>
import wretch from 'wretch'
import Settings from './components/Settings.vue'
import MilestoneSelector from './components/MilestoneSelector.vue'
import Milestone from './components/Milestone.vue'
import Release from './components/Release.vue'
import AfterDeployChecklist from './components/AfterDeployChecklist.vue'

export default {
  name: 'App',
  components: {
    Settings,
    MilestoneSelector,
    Milestone,
    Release,
    AfterDeployChecklist,
  },
  data() {
    return {
      branchToTag: 'develop',
      octoGraphClient: undefined,
      octoRestRepoClient: undefined,
      // steps
      selectedMilestone: undefined,
      milestoneUpdateCompleted: false,
      createdRelease: undefined,
    }
  },
  methods: {
    onSettingsSet: function(settings) {
      this.octoGraphClient = wretch()
        .url('https://api.github.com/graphql')
        .errorType('json')
        .auth(`Bearer ${settings.githubAccessToken}`)
        .options({ mode: 'cors' })

      this.octoRestRepoClient = wretch()
        .url('https://api.github.com/repos/InteractionDesignFoundation/IxDF-web')
        .errorType('json')
        .auth(`Bearer ${settings.githubAccessToken}`)
        .options({ mode: 'cors' })
    },
    onMilestoneChanged: function(selectedMilestone) {
      this.selectedMilestone = selectedMilestone
    },
    completeMilestoneUpdateStep: function() {
      this.milestoneUpdateCompleted = true
    },
    onReleaseCreated: function(createdRelease) {
      this.createdRelease = createdRelease
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
  content: counter(h2counter) '.\0000a0\0000a0';
  counter-increment: h2counter;
  counter-reset: h3counter;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial,
    sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
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
  opacity: 0.6;
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
.list {
  list-style-position: inside;
}
.list .list {
  padding-left: 4ch;
}
</style>
