<template>
  <section :disabled="mergeCommit">
    <h2 class="title">Merge {{ headBranch }} to {{ baseBranch }}</h2>
    <div v-if="commitsDiff">
      <div class="field is-grouped is-grouped-multiline">
        <div class="control">
          <div class="tags has-addons">
            <span class="tag">Total commits</span>
            <span
              :class="{'is-success': commitsDiff.total_commits > 1, 'is-danger': commitsDiff.total_commits<=1}"
              class="tag ">{{ commitsDiff.total_commits }}</span>
          </div>
        </div>
        <div class="control">
          <div class="tags has-addons">
            <span class="tag">Files changed</span>
            <span
              :class="{'is-success': commitsDiff.files.length > 1, 'is-danger': commitsDiff.files.length<=1}"
              class="tag ">{{ commitsDiff.files.length }}</span>
          </div>
        </div>
      </div>
      <details v-if="commitsDiff.total_commits > 0">
        <summary>Commits</summary>
        <ul>
          <li
            v-for="commit in commitsDiff.commits"
            :key="commit.sha">
            <img
              :src="commit.author.avatar_url"
              :alt="commit.commit.author.name"
              class="committer">
            <a
              :href="commit.html_url"
              target="_blank"
              class="mono">{{ commit.sha | slice(7) }}</a>
            {{ commit.commit.message | slice(75) }}
          </li>
        </ul>
      </details>

    </div>
    <p>
      <a
        :href="`https://github.com/InteractionDesignFoundation/IDF-web/compare/${baseBranch}...${headBranch}`"
        target="_blank">Compare changes between on GitHub</a>
    </p>

    <div v-if="commitsDiff">
      <p>
        <a
          :href="commitsDiff.permalink_url"
          target="_blank">Permanent URL to commits diff</a>
      </p>

      <hr>
      <div>
        <button
          class="button is-warning"
          @click="performMerge">Merge {{ headBranch }} to {{ baseBranch }}
        </button>
      </div>
    </div>
  </section>
</template>

<script>
  export default {
    name: "Merge",
    filters: {
      slice: function (value, charsNumber) {
        if (!value) return '';
        return value.substring(0, charsNumber);
      },
    },
    props: {
      octoRestRepoClient: {
        type: Object,
        required: true,
      },
      baseBranch: {
        type: String,
        required: true,
      },
      headBranch: {
        type: String,
        required: true,
      },
    },
    data() {
      return {
        mergeCommit: undefined,
        commitsDiff: undefined,
      };
    },
    created: function () {
      this.fetchBranchesCompareResult().then(commitsDiff => this.commitsDiff = commitsDiff);
    },
    methods: {
      fetchBranchesCompareResult: function () {
        // return wretch('./diffResponse.json').get().json(json => json);
        /** @see https://developer.github.com/v3/repos/commits/#compare-two-commits */
        return this.octoRestRepoClient.url(`/compare/${this.baseBranch}...${this.headBranch}`)
          .get()
          .json(json => json);

      },
      performMerge: function () {
        /** @see https://developer.github.com/v3/repos/merging/#perform-a-merge */
        return this.octoRestRepoClient.url(`/merges`)
          .json({
            base: this.baseBranch,
            head: this.headBranch,
            commit_message: `Merge changes from ${this.headBranch} to ${this.baseBranch} for a new release`,
          })
          .post()
          .error(409, error => {
            alert(`Ooops, ${this.baseBranch} is protected. You're not authorized to push to this branch`);
            throw error;
          })
          .json((json) => {
            this.mergeCommit = json;
            this.$emit('changes-merged', {
              base: this.baseBranch,
              head: this.headBranch,
              permalink_url: this.commitsDiff.permalink_url,
            });
            return this.mergeCommit;
          });

        // 409
        /*{
           "message": "protected branch 'master' check failed:\n  You're not authorized to push to this branch. Visit https://help.github.com/articles/about-protected-branches/ for more information.",
           "documentation_url": "https://developer.github.com/v3/repos/merging/#perform-a-merge"
       }*/
      },
    },
  }
</script>

<style scoped>
  .committer {
    width: 1.5em;
  }
  .mono {
    font-family: monospace;
  }
</style>
