<template>
  <section class="step">
    <h2 class="title">🏁 That's it, you are awesome! 🦄</h2>

    <p>
      <strong>Please stay online for the next 1+ hour(s)</strong> to solve
      possible errors caused by the new release.
    </p>

    <ol class="list">
      <li>
        In case of CI build errors, we will be notified on your email.
      </li>
      <li>
        In case of important runtime errors, we will be notified on
        <code>#error--production</code> and
        <code>#js-errors-production</code> channels.
      </li>
      <li>
        In case of success, you will receive a notification on
        <code>#releases</code> channel.
      </li>
      <li>
        Check
        <a href="https://app.codeship.com/projects/79159" target="_blank"
          >app status on Codeship CI.</a
        >
      </li>
      <li>
        Check
        <a
          href="https://github.com/InteractionDesignFoundation/IDF-web/blob/develop/docs/workflows/after-deployment-checklist.md"
          target="_blank"
          >After Deployment Checklist</a
        >.
      </li>
    </ol>
  </section>
</template>
