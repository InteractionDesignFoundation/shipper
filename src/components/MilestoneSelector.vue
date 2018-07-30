<template>
  <section>
    <h2 class="title">Select a milestone</h2>
    <label 
      for="milestoneSelector" 
      class="label">Please select a milestone to close</label>
    <div class="select is-primary is-medium">
      <select 
        id="milestoneSelector" 
        v-model="selectedMilestone">
        <option 
          value="" 
          disabled>Please select a milestone</option>
        <option 
          v-for="milestone in milestones"
          :key="milestone.id"
          :value="milestone">{{ milestone.title }} ({{ milestone.state }})</option>
      </select>
    </div>
  </section>
</template>

<script>
  export default {
    name: "MilestoneSelector",
    props: {
      octoGraphClient: {
        type: Object,
        required: true,
      },
    },
    data() {
      return {
        milestones: [],
        selectedMilestone: undefined,
      };
    },
    watch: {
      selectedMilestone: function (newMilestone) {
        this.$emit('milestone-changed', newMilestone);
      }
    },
    created: function () {
      this.fetchMilestones().then(milestones => {
        this.milestones = milestones;
        this.$emit('milestones-loaded');
        return milestones;
      });
    },
    methods: {
      fetchMilestones: function () {
        const query = `
                 query {
                   repository(owner:"InteractionDesignFoundation", name:"IDF-web") {
                   milestones(last:5 states: OPEN) {
                     nodes {
                         number
                         title
                         description
                         url
                         state
                         issues(last:50) {
                           nodes {
                             title
                             url
                             number
                             state
                             labels(first:10) {
                               nodes {
                                 name
                                 color
                               }
                             }
                           },
                         }
                       }
                   }
                 }
                   }`;
        return this.octoGraphClient
          .json({query: query})
          .post()
          .json(json => json.data.repository.milestones.nodes)
      },
    },
  }
</script>
