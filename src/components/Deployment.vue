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
          .forbidden(err => {
            // not working, I think due to CORS problem
            console.log(err.status);
          })
          .res(response => {
            // not working, I think due to CORS problem
            alert('OK!');
            console.info(`response`, response);
            return response.status;
          })
          .catch(err => {
            console.log(`catch`, err);
            return 'CORS or other error'
          })
          .then((message) => {
            this.isDeploying = false;
            this.isDeployed = true;
            this.$emit('deployed');
            console.info(`Deploy promise latest step: ${message}`);
          })
      },
    },
  }
</script>
