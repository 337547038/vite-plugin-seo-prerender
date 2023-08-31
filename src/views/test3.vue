<template>
  <div class="index">
    this is test3 page
    <div v-for="(item,index) in list" :key="index">
      <p>{{item.name}}</p>
    </div>
    <div>end</div>
  </div>
</template>
<script setup>
  import {ref, onMounted} from 'vue'
  
  const list=ref([{name:'test33333'},{name:'test3 test3'}])
  
  onMounted(() => {
  
  })
</script>
<style>
.index {
  color: antiquewhite;
  font-size: 16px
}
</style>
