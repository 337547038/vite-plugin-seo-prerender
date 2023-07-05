<template>
  <div class="about">this about page, count: {{count}}</div>
  <div><button @click="count++">button</button></div>
</template>
<script setup lang="ts">
import {ref} from 'vue'
const count =ref(0)
</script>
<style>
.about{color: red;font-size: 16px;}
</style>
