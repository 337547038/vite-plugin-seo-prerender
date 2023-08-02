<template>
  <div class="index">
    this is test page
    <div v-for="(item,index) in list" :key="index">
      <p>{{item.name}}</p>
    </div>
    <div>end</div>
  </div>
</template>
<script setup>
  import {ref, onMounted} from 'vue'
  import axios from 'axios'
  
  const list=ref([])
  
  onMounted(() => {
  
  })
</script>
<style>
.index {
  color: antiquewhite;
  font-size: 16px
}
</style>
