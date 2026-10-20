<template>
 <view v-if="floatingNavigationReady" class="floating-navigation" role="navigation" aria-label="主要导航"><button v-for="item in items" :key="item.id" class="floating-nav-item" :class="{active:active===item.id}" :aria-current="active===item.id?'page':undefined" @tap="open(item.id)"><image class="floating-nav-icon" :src="'/static/navigation/'+item.id+(active===item.id?'-active':'')+'.png'" mode="aspectFit"/><text>{{item.label}}</text></button></view>
</template>
<script setup lang="ts">
import { floatingNavigationReady } from '../core/navigation'
import { notify } from '../core/platform'
const props=defineProps<{active:string}>()
const items=[{id:'home',label:'首页'},{id:'draw',label:'抽牌'},{id:'learn',label:'学牌'},{id:'library',label:'牌库'}]
function open(id:string){if(id!==props.active)uni.switchTab({url:'/pages/'+id+'/index',fail(){notify('暂时无法切换页面，请重试')}})}
</script>
<style scoped>
.floating-navigation{position:fixed;left:16px;right:16px;bottom:calc(12px + env(safe-area-inset-bottom));max-width:580px;margin:auto;z-index:15;display:flex;padding:0 8px;background:var(--paper);border:1px solid var(--line);border-radius:32px;box-shadow:var(--shadow-float)}
.floating-nav-item{display:flex;flex:1;min-width:0;min-height:68px;flex-direction:column;align-items:center;justify-content:center;gap:4px;border:0;background:transparent;border-radius:24px;color:var(--muted);font:12px/1.65 var(--font-body);padding:0;margin:0}
.floating-nav-item.active{color:var(--accent);font-weight:600}.floating-nav-icon{width:24px;height:24px;display:block}.floating-nav-item::after{border:0}
</style>
