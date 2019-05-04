<template>
  <section
    class="step">
    <h2 class="title">🏁 That's it, you are awesome! 🦄</h2>
    <ol class="list">
      <li>
        <strong>Please stay online for the next 1+ hour(s)</strong> to solve possible errors caused by the new release.
        <ol class="list">
          <li>In case of CI build errors, we will be notified on <code>#dev</code> channel ("[Build failed]")</li>
          <li>In case of deploy errors, we will be notified on <code>#dev</code> channel ("Failed Deployment")</li>
          <li>In case of important runtime errors, we will be notified on <code>#error--production</code> and <code>#js-errors-production</code> channels</li>
          <li>In case of success, you will receive a notification on <code>#announcements</code> channel</li>
        </ol>
      </li>
      <li>Check <a href="https://app.codeship.com/projects/79159" target="_blank">app status on Codeship CI</a></li>
      <li>Check <a href="https://github.com/InteractionDesignFoundation/IDF-web/blob/develop/docs/workflows/deployment/checklist--after-deployment.md" target="_blank">After Deployment Checklist</a> </li>
    </ol>
  </section>
</template>
