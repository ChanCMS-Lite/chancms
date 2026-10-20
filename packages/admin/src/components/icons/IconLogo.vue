<template>
  <img class="logo" :src="logoSrc" alt="ChanCMS" />
</template>

<script setup name="IconLogo">
const logoSrc = `${import.meta.env.BASE_URL}logo.svg`
</script>
