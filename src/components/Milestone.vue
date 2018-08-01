<template>
  <section>
    <h2 class="title">Milestone: <a
      :href="milestone.url"
      target="_blank">{{ milestone.title }}</a></h2>
    <div class="field is-grouped is-grouped-multiline">
      <div class="control">
        <div class="tags has-addons">
          <span class="tag">Closed issues</span>
          <span
            :class="{'is-success': closedIssuesNumber > 0, 'is-danger': closedIssuesNumber<1}"
            class="tag ">{{ closedIssuesNumber }}</span>
        </div>
      </div>
      <div class="control">
        <div class="tags has-addons">
          <span class="tag">Open issues</span>
          <span
            :class="{'is-success': openIssuesNumber === 0, 'is-danger': openIssuesNumber !== 0}"
            class="tag ">{{ openIssuesNumber }}</span>
        </div>
      </div>
    </div>
    <ul>
      <li
        v-for="issue in milestone.issues.nodes"
        :key="issue.id">
        <span
          v-if="issue.state==='OPEN'"
          :key="issue.id"
          class="has-text-danger">[OPEN]</span>
        <a
          :href="issue.url"
          target="_blank">#{{ issue.number }}</a> {{ issue.title }}
        <span
          v-for="label in issue.labels.nodes"
          :key="label.name"
          :style="{ backgroundColor: '#'+label.color}"
          class="gh-label">{{ label.name }}</span>
      </li>
    </ul>
    <p v-if="closedIssuesNumber === 0">
      <b>No any closed issues?</b> Maybe something wrong, please double check before creating a new milestone.
    </p>
    <p v-if="openIssuesNumber !== 0">
      <b>Has open issues?</b> Maybe something wrong, please ping open issue assignee(s) to update a state of open
      issue(s) attached to this milestone.
    </p>

    <hr>
    <div>

      <form @submit.prevent="renameAndCloseCurrentMilestone">
        <fieldset
          :disabled="milestone.state !== 'OPEN'"
          class="field has-addons">
          <div class="control">
            <input
              v-model="thisMilestoneTitle"
              class="input"
              type="text"
              required
              minlength="10"
              pattern="^Release [0-9.A-Z]{3,7}$"
              placeholder="Current milestone title"
              list="possibleReleaseNames">
            <datalist id="possibleReleaseNames">
              <option
                v-for="milestoneTitle in milestoneTitles"
                :key="milestoneTitle"
                :value="milestoneTitle">{{ milestoneTitle }}</option>
            </datalist>
          </div>
          <div class="control">
            <button
              :disabled="milestone.state.toLowerCase() !== 'open'"
              class="button is-success"
              type="submit">
              Rename and close current milestone
            </button>
          </div>
        </fieldset>
      </form>

      <form @submit.prevent="createNewMilestone">
        <fieldset
          :disabled="createdMilestone || milestone.state === 'OPEN'"
          class="field has-addons">
          <div class="control">
            <input
              v-model="nextMilestoneTitle"
              class="input"
              type="text"
              required
              minlength="10"
              placeholder="Next milestone title">
          </div>
          <div class="control">
            <button
              class="button is-success"
              type="submit">
              Create a new milestone
            </button>
          </div>
        </fieldset>
      </form>

    </div>
  </section>
</template>

<script>
  export default {
    name: "Milestone",
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
        nextMilestoneTitle: this.milestone.title,
        createdMilestone: undefined,
        milestoneTitles: [],
      };
    },
    computed: {
      closedIssuesNumber: function () {
        return this.milestone.issues.nodes.filter(issue => issue.state === 'CLOSED').length;
      },
      openIssuesNumber: function () {
        return this.milestone.issues.nodes.filter(issue => issue.state === 'OPEN').length;
      },
    },
    created: function () {
      this.getSuggestedMilestoneTitles().then(titles => this.milestoneTitles = titles);
    },
    methods: {
      renameAndCloseCurrentMilestone: function () {
        return this.octoRestRepoClient.url(`/milestones/${this.milestone.number}`)
          .json({
            state: 'closed',
            title: this.thisMilestoneTitle,
          })
          .patch()
          .json((json) => {
            this.milestone.title = this.thisMilestoneTitle;
            this.milestone.state = json.state;
            return this.milestone;
          });
      },
      createNewMilestone: function () {
        return this.octoRestRepoClient.url('/milestones')
          .json({
            title: `${this.nextMilestoneTitle}`,
            state: 'open',
          })
          .post()
          .json(json => {
            this.createdMilestone = json;
            this.$emit('new-milestone-created', this.createdMilestone);
            return this.createdMilestone;
          })
          .catch(error => {
            const validationErrors = error.json && error.json.errors ? error.json.errors : [];
            const errorsAsText = validationErrors.reduce((str, currentError) => {
              return str + `\n${currentError.resource}.${currentError.field} ${currentError.code}`;
            }, '');
            alert(`Error ${error.response.statusText}: ${error.json.message} ${errorsAsText}`);
          })

      },
      getSuggestedMilestoneTitles: function () {
        const query = `
                 query {
                   repository(owner:"InteractionDesignFoundation", name:"IDF-web") {
                   milestones(first:5 states: CLOSED, orderBy: {field:NUMBER, direction:DESC}) {
                     nodes {
                         number
                         title
                       }
                   }
                 }
                   }`;
        return this.octoGraphClient
          .json({query: query})
          .post()
          .json(json => json.data.repository.milestones.nodes.find(milestone => milestone.title.includes('Release')))
          .then(milestoneOrNull => {
            console.log(milestoneOrNull);
            const milestoneTitles = [];
            if (!milestoneOrNull) {
              return milestoneTitles;
            }

            const parts = milestoneOrNull.title.replace('Release ', '').split('.');
            milestoneTitles.push(`Release ${parseInt(parts[0])+1}.0`);
            milestoneTitles.push(`Release ${parts[0]}.${parseInt(parts[1])+1}`);
            if (parts.length > 1) {
              milestoneTitles.push(`Release ${parts[0]}.${parts[1]}.${parseInt(parts[2] || 0)+1}`);
            }

            return milestoneTitles;
          });
      },
    },
  }
</script>

<style scoped>
  fieldset {
    border: none;
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
