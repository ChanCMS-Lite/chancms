<template>
  <el-dropdown trigger="click">
    <el-button :icon="IconLanguage" circle />
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item>中文</el-dropdown-item>
        <el-dropdown-item>Englist</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup name="LanguageSwitch">
import IconLanguage from '@/assets/icons/language.svg?component'
</script>
