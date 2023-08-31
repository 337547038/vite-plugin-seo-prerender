<template>
  <div class="index">
    this is test2 page
    <div v-for="(item,index) in list" :key="index">
      <p>{{item.name}}</p>
    </div>
    <div>end</div>
  </div>
</template>
<script setup>
  import {ref, onMounted} from 'vue'
  
  const list=ref([{name:'test222222222'},{name:'test2 test2'}])
  
  onMounted(() => {
  
  })
</script>
<style>
.index {
  color: antiquewhite;
  font-size: 16px
}
</style>
