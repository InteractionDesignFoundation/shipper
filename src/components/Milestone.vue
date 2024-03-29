<template>
  <section :disabled="createdMilestone">
    <h2 class="title">
      Update a Milestone:
      <a :href="milestone.url" target="_blank">{{ milestone.title }}</a>
    </h2>
    <div class="field is-grouped is-grouped-multiline">
      <div class="control">
        <div class="tags has-addons">
          <span class="tag">Closed issues</span>
          <span
            :class="{
              'is-success': closedIssuesNumber > 0,
              'is-danger': closedIssuesNumber < 1,
            }"
            class="tag "
            >{{ closedIssuesNumber }}</span
          >
        </div>
      </div>
      <div class="control">
        <div class="tags has-addons">
          <span class="tag">Open issues</span>
          <span
            :class="{
              'is-success': openIssuesNumber === 0,
              'is-danger': openIssuesNumber !== 0,
            }"
            class="tag "
            >{{ openIssuesNumber }}</span
          >
        </div>
      </div>
    </div>
    <ul>
      <li v-for="issue in milestone.issues.nodes" :key="issue.id">
        <span
          v-if="issue.state === 'OPEN'"
          :key="issue.id"
          class="has-text-danger"
          >[OPEN]
        </span>
        <a :href="issue.url" target="_blank">#{{ issue.number }}</a>
        {{ issue.title }}
        <span
          v-for="label in issue.labels.nodes"
          :key="label.name"
          :style="{backgroundColor: '#' + label.color}"
          class="gh-label"
          >{{ label.name }}</span
        >
      </li>
    </ul>
    <p v-if="closedIssuesNumber === 0">
      <b>No closed issues?</b> You might have forgotten to close issue(s) on
      GitHub. If you want to ship a new release without closing any issues –
      please don’t forget to manually specify release notes (next step).
    </p>
    <p v-if="openIssuesNumber !== 0">
      <b>Are there some open issues?</b> Something might be wrong, please ping
      open issue assignee(s) to update the state of open issue(s) attached to
      this milestone.
    </p>

    <hr />

    <p>
      <b>Current release number</b>:
      <a
        href="https://github.com/InteractionDesignFoundation/IxDF-web/releases"
        >{{ currentReleaseNumber }}</a
      >
    </p>

    <div>
      <form @submit.prevent="renameAndCloseCurrentMilestone">
        <div v-if="openIssuesNumber !== 0" class="notification is-danger">
          <p>
            ⚠️ There are some open issues in the selected milestone.
          </p>
          <p>
            Please close or remove them from the milestone so that the milestone
            can be closed.
          </p>
        </div>

        <fieldset
          :disabled="milestone.state !== 'OPEN' || openIssuesNumber !== 0"
        >
          <div class="field has-addons">
            <div class="control">
              <input
                v-model="thisMilestoneTitle"
                class="input"
                type="text"
                required
                minlength="10"
                pattern="^Release [0-9.A-Z]{5,}$"
                placeholder="Release X.Y.Z"
                list="possibleReleaseNames"
              />
              <datalist id="possibleReleaseNames">
                <option
                  v-for="milestoneTitle in milestoneTitles"
                  :key="milestoneTitle"
                  :value="milestoneTitle"
                  >{{ milestoneTitle }}</option
                >
              </datalist>
            </div>
            <div class="control">
              <button
                :disabled="milestone.state.toLowerCase() !== 'open'"
                class="button is-success"
                type="submit"
              >
                Rename and close selected milestone
              </button>
              <small class="hint"
                >Hint: we follow
                <a href="https://semver.org/" target="_blank"
                  >SemVer 2.0</a
                ></small
              >
            </div>
          </div>
        </fieldset>
      </form>

      <form @submit.prevent="createNewMilestone">
        <fieldset :disabled="createdMilestone || milestone.state === 'OPEN'">
          <div class="field has-addons">
            <div class="control">
              <input
                v-model="nextMilestoneTitle"
                class="input"
                type="text"
                required
                minlength="10"
                placeholder="Next milestone title"
              />
            </div>
            <div class="control">
              <button class="button is-success" type="submit">
                Create a new milestone
              </button>
              <button
                @click="skipCreatingNewMilestone"
                class="button is-small"
                type="button"
                title="Do not create a new milestone"
              >
                Skip
              </button>
              <small class="hint"
                >Hint: in most cases it will be "Next Release"</small
              >
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  </section>
</template>

<script>
import {compareVersions} from 'compare-versions'

export default {
  name: 'Milestone',
  props: {
    milestone: {
      type: Object,
      required: true,
    },
    octoGraphClient: {
      type: Object,
      required: true,
    },
    octoRestRepoClient: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      thisMilestoneTitle: '',
      previousMilestoneOriginalTitle: this.milestone.title,
      nextMilestoneTitle: this.milestone.title,
      createdMilestone: undefined,
      milestoneTitles: [],
      currentReleaseNumber: '',
    }
  },
  computed: {
    closedIssuesNumber: function() {
      return this.milestone.issues.nodes.filter(
        issue => issue.state === 'CLOSED'
      ).length
    },
    openIssuesNumber: function() {
      return this.milestone.issues.nodes.filter(issue => issue.state === 'OPEN')
        .length
    },
  },
  created: function() {
    this.getCurrentReleaseNumber()
      .then(currentReleaseNumber => {
        this.currentReleaseNumber = currentReleaseNumber
        return this.getSuggestedMilestoneTitles(
          currentReleaseNumber,
          'Release '
        )
      })
      .then(
        suggestedMilestoneTitles =>
          (this.milestoneTitles = suggestedMilestoneTitles)
      )
  },
  methods: {
    renameAndCloseCurrentMilestone: function() {
      return this.octoRestRepoClient
        .url(`/milestones/${this.milestone.number}`)
        .json({
          state: 'closed',
          title: this.thisMilestoneTitle,
        })
        .patch()
        .json(json => {
          this.milestone.title = this.thisMilestoneTitle
          this.milestone.state = json.state
          return this.milestone
        })
    },
    createNewMilestone: function() {
      return this.octoRestRepoClient
        .url('/milestones')
        .json({
          title: `${this.nextMilestoneTitle}`,
          state: 'open',
        })
        .post()
        .json(json => {
          this.createdMilestone = json
          this.$emit('new-milestone-created', this.createdMilestone)
          return this.createdMilestone
        })
        .catch(error => {
          const validationErrors =
            error.json && error.json.errors ? error.json.errors : []
          const errorsAsText = validationErrors.reduce((str, currentError) => {
            return (
              str +
              `\n${currentError.resource}.${currentError.field} ${currentError.code}`
            )
          }, '')
          alert(
            `Error ${error.response.statusText}: ${error.json.message} ${errorsAsText}`
          )
        })
    },
    skipCreatingNewMilestone: function() {
      this.$emit('new-milestone-creating-skipped')
    },
    getCurrentReleaseNumber: function() {
      const query = `
                 query {
                   repository(owner:"InteractionDesignFoundation", name:"IxDF-web") {
                   milestones(first:30 states: CLOSED, orderBy: {field:UPDATED_AT, direction:DESC}) {
                     nodes {
                         title
                       }
                   }
                 }
                   }`
      return this.octoGraphClient
        .json({query: query})
        .post()
        .json(json =>
          json.data.repository.milestones.nodes
            .map(milestone => milestone.title)
            .filter(milestoneTitle => milestoneTitle.startsWith('Release'))
            .map(milestoneTitle => milestoneTitle.replace('Release ', ''))
            .sort(compareVersions)
        )
        .then(latestReleaseMilestoneTitles => {
          return latestReleaseMilestoneTitles[
            latestReleaseMilestoneTitles.length - 1
          ]
        })
    },
    getSuggestedMilestoneTitles: function(currentReleaseNumber, prefix = '') {
      const milestoneTitles = []
      if (!currentReleaseNumber) {
        return [`${prefix}0.1`, `${prefix}1.0`]
      }

      const parts = currentReleaseNumber.replace(prefix, '').split('.')
      const currentMajorNumber = parseInt(parts[0]) || 0
      const currentMinorNumber = parseInt(parts[1]) || 0
      const currentPatchNumber = parseInt(parts[2]) || 0

      milestoneTitles.push(
        `${prefix}${currentMajorNumber}.${currentMinorNumber}.${currentPatchNumber +
          1}`
      )
      milestoneTitles.push(
        `${prefix}${currentMajorNumber}.${currentMinorNumber + 1}.0`
      )
      milestoneTitles.push(`${prefix}${currentMajorNumber + 1}.0.0`)

      return milestoneTitles
    },
  },
}
</script>

<style scoped>
fieldset {
  border: none;
}

.hint {
  display: inline-block;
  vertical-align: bottom;
  padding-left: 2ch;
}

.gh-label {
  color: #ffffff !important;
  height: 20px;
  padding: 0.15em 4px;
  font-size: 12px;
  font-weight: 600;
  line-height: 15px;
  border-radius: 2px;
  margin-right: 2px;
}
</style>
