<template>
  <section :disabled="createdMilestone">
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
      <p v-if="closedIssuesNumber === 0">
        <b>No any closed issues?</b> Maybe something wrong, please double check before creating a new milestone.
      </p>
      <p v-if="openIssuesNumber !== 0">
        <b>Has open issues?</b> Maybe something wrong, please ping open issue assignee(s) to update a state of open issue(s) attached to this milestone.
      </p>
    </ul>

    <hr>
    <div class="field is-grouped">
      <p class="control">
        <button 
          :disabled="milestone.state.toLowerCase() !== 'open'" 
          class="button is-success" 
          @click="closeCurrentMilestone">1. Close milestone</button>
      </p>
      <p class="control">
        <input 
          v-model="nextMilestoneTitle" 
          type="text" 
          class="input">
      </p>
      <p class="control">
        <button 
          class="button is-success" 
          @click="createNewMilestone">2. Create new "{{ nextMilestoneTitle }}" milestone</button>
      </p>
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
      octoRestRepoClient: {
        type: Object,
        required: true,
      },
    },
    data() {
      return {
        nextMilestoneTitle: '',
        createdMilestone: undefined,
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
    watch: {
      milestone: function (milestone) {
        this.nextMilestoneTitle = this.getNextReleaseNumber(milestone.title);
      },
    },
    created: function () {
      this.nextMilestoneTitle = this.getNextReleaseNumber(this.milestone.title);
    },
    methods: {
      closeCurrentMilestone: function () {
        return this.octoRestRepoClient.url(`/milestones/${this.milestone.number}`)
          .json({
            state: 'closed',
          })
          .patch()
          .json((json) => {
            return this.milestone.state = json.state;
          });
      },
      createNewMilestone: function () {
        return this.octoRestRepoClient.url('/milestones')
          .json({
            title: `${this.nextMilestoneTitle}`,
            state: 'open',
          })
          .post()
          // .error(422, error => {
          //     alert(`${error.json.message}: Milestone with this name is already exist`);
          // })
          .json(json => {
            this.createdMilestone = json;
            this.$emit('new-milestone-created', this.createdMilestone);
            return this.createdMilestone;
          })
          .catch(error => {
            const validationErrors = error.json && error.json.errors ? error.json.errors : [];
            const errorsAsText = validationErrors.reduce((str, currentError) => {
              return str += `\n${currentError.resource}.${currentError.field} ${currentError.code}`;
            }, '');
            alert(`Error ${error.response.statusText}: ${error.json.message} ${errorsAsText}`);
          })

      },
      getNextReleaseNumber: function (currentReleaseNumber) {
        const releaseNumberParts = currentReleaseNumber.split('.');
        const lastPart = parseInt(releaseNumberParts.pop()) || 0;
        releaseNumberParts.push(lastPart + 1);
        return releaseNumberParts.join('.');
      },
    },
  }
</script>

<style scoped>
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
