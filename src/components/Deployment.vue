<template>
  <section :disabled="isDeployed">
    <h2 class="title">Deployment</h2>
    <div>
      <button 
        :disabled="isDeploying" 
        :class="{'is-loading': isDeploying}" 
        class="button is-warning" 
        @click="deploy">
        Deploy
      </button>
    </div>
  </section>
</template>

<script>
  import wretch from 'wretch'

  export default {
    name: "Deployment",
    props: {
      deployTriggerWebhookUrl: {
        required: true,
        type: String,
      },
    },
    data() {
      return {
        deploymentLog: undefined,
        isDeploying: false,
        isDeployed: false,
      };
    },
    methods: {
      deploy: function () {
        this.isDeploying = true;
        /** @see https://forge.laravel.com/api-documentation#update-deployment-script */
        return wretch(this.deployTriggerWebhookUrl)
          .post()
          .forbidden(() => {
            // not working, possibly due to CORS politics
          })
          .res(response => {
            // not working, possibly due to CORS politics
            return response.status;
          })
          .catch(() => {
            return 'CORS or other error'
          })
          .then(() => {
            this.isDeploying = false;
            this.isDeployed = true;
            this.$emit('deployed');
          })
      },
    },
  }
</script>
