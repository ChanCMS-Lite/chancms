<template>
    <el-button :icon="IconSun" v-if="isLight" circle />
    <el-button :icon="IconMoon" v-else circle />
</template>
<script setup name="LightDarkSwitch">
import {ref} from 'vue';
import IconSun from '@/assets/icons/sun.svg?component';
import IconMoon from '@/assets/icons/moon.svg?component';
const isLight = ref(true);
</script>
