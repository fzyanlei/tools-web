<script setup lang="ts">
import policyHtml from './privacy-policy.html?raw'
</script>

<template>
  <div class="mx-auto w-full max-w-4xl rounded-md bg-white p-6 c-xs:p-4">
    <div v-html="policyHtml"></div>
  </div>
</template>
