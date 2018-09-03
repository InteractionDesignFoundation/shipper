<template>
  <section :disabled="createdRelease">
    <h2 class="title">Release</h2>
    <div class="field">
      <label 
        for="releaseName" 
        class="label">Release name</label>
      <input 
        id="releaseName" 
        v-model="releaseName" 
        type="text" 
        class="input">
    </div>
    <div class="field">
      <label 
        for="releaseNotes" 
        class="label">Release notes</label>
      <textarea 
        id="releaseNotes" 
        v-model="releaseNotes" 
        class="textarea" 
        rows="10" 
        placeholder="Release notes"
        style="width: 100%"/>
    </div>
    <div>
      <button 
        class="button is-warning" 
        @click="createRelease">Create a new release</button>
    </div>
  </section>
</template>

<script>
  import emojiRegex from 'emoji-regex';

  export default {
    name: "Release",
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
        releaseName: '',
        releaseNotes: '',
        targetBranch: 'master',
        createdRelease: undefined,
      };
    },
    watch: {
      milestone: function (selectedMilestone) {
        this.releaseName = this.generateReleaseName(selectedMilestone);
        this.releaseNotes = this.generateReleaseNotes(selectedMilestone);
      },
    },
    created: function () {
      this.releaseName = this.generateReleaseName(this.milestone);
      this.releaseNotes = this.generateReleaseNotes(this.milestone);
    },
    methods: {
      generateReleaseName: function (milestone) {
        const semverNumbers = milestone.title.match(/[0-9.]+/);
        return semverNumbers ? semverNumbers[0] : '?';
      },
      generateReleaseNotes: function (milestone) {
        const changelogItems = new Set();
        milestone.issues.nodes.forEach((issue) => {
          changelogItems.add(` - ${this.getChangelogTextForIssue(issue)}\n`);
        });
        return `Release notes:
${[...changelogItems].join('')}
Closed issues: ${milestone.url}?closed=1`
      },
      createRelease: function () {
        /** @see https://developer.github.com/v3/repos/releases/#create-a-release */
        return this.octoRestRepoClient.url(`/releases`)
          .json({
            tag_name: this.releaseName,
            target_commitish: this.targetBranch,
            name: this.releaseName,
            body: this.releaseNotes,
            draft: false,
          })
          .post()
          .json((createdRelease) => {
            this.$emit('release-created', createdRelease);
            return this.createdRelease = createdRelease;
          });
      },
      getChangelogTextForIssue: function (issue) {
        const prefixes = issue.labels.nodes.map(label => {
          const regex = emojiRegex();
          let match;
          const emojies = [];
          while (match = regex.exec(label.name)) {
            emojies.push(match[0]);
          }
          return emojies.join('');
        });

        return `${prefixes.join('')}${issue.title}`;
      },
    },
  }
</script>

<style scoped>

</style>
