<template>
  <section class="step">
    <h2 class="title">🏁 That’s it, you are awesome! 🦄</h2>

    <p>
      <strong>Please stay online for the next 1+ hour(s)</strong> to solve
      possible errors caused by the new release.
    </p>

    <ol class="list">
      <li>
        In case of CI build errors, we will be notified via email.
      </li>
      <li>
        In case of important runtime errors, we will be notified on
        <code>#errors--production</code> and
        <code>#js-errors--production</code> Slack channels.
      </li>
      <li>
        If the release was successful, you will receive a notification on
        <code>#releases</code> channel.
      </li>
      <li>
        Check
        <a
          href="https://github.com/InteractionDesignFoundation/IxDF-web/actions/workflows/main.yml"
          target="_blank"
          >CI/CD status.</a
        >
      </li>
      <li>
        Check
        <a
          href="https://github.com/InteractionDesignFoundation/IxDF-web/blob/develop/docs/workflows/after-deployment-checklist.md"
          target="_blank"
          >After Deployment Checklist</a
        >.
      </li>
    </ol>
  </section>
</template>
