import { ref } from 'vue'
import { notify } from './platform'
export const floatingNavigationReady = ref(false)
export function hideNativeTabBar() {
 uni.hideTabBar({ animation:false, success(){ floatingNavigationReady.value=true }, fail(){ floatingNavigationReady.value=false;notify('导航外观暂未加载，请重新进入页面') } })
}
