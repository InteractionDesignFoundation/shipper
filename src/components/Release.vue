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
        @click="createRelease">3. Create a new release</button>
    </div>
  </section>
</template>

<script>
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
        return milestone.title.match(/[0-9.]+/)[0];
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
        let prefix = '';
        issue.labels.nodes.forEach(label => {
          if (label.name.includes('minor bug')) {
            return `Fixes`;
          }
          if (label.name.includes('not a bug')) {
            return ``;
          }

          if (label.name.includes('Epic')) {
            prefix += '👑 ';
          } else if (label.name.includes('major feature')) {
            prefix += '⭐️ ⭐️ ';
          } else if (label.name.includes('minor feature')) {
            prefix += '⭐️ ';
          } else if (label.name.includes('enhancement')) {
            prefix += '✨ ';
          } else if (label.name.includes('critical bug')) {
            prefix += '💥 ';
          } else if (label.name.includes('frontend')) {
            prefix += '🎀 ';
          }

          if (label.name.includes('performance')) {
            prefix += '🐎 ';
          }
          if (label.name.includes('urgent')) {
            prefix += '🔥 ';
          }
        });

        return `${prefix}${issue.title}`;
      },
    },
  }
</script>

<style scoped>

</style>
