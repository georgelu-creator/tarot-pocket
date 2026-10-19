<script lang="ts">
import { loadReadingStore, notify } from './core/platform'
let dayTimer:ReturnType<typeof setTimeout>|null=null
function stopDayTimer(){if(dayTimer)clearTimeout(dayTimer);dayTimer=null}
function pruneAndSchedule(){
 stopDayTimer()
 try{loadReadingStore()}catch{notify('牌局整理失败，请检查储存空间后重试')}
 const now=new Date(),next=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1)
 dayTimer=setTimeout(()=>{pruneAndSchedule();uni.$emit('reading-day-changed')},Math.max(1,next.getTime()-Date.now()+30))
}
export default {onShow:pruneAndSchedule,onHide:stopDayTimer}
</script>
<style>
page{background:#f6f1e8;color:#302a32;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;font-size:28rpx}view,button,input,textarea{box-sizing:border-box}button::after{border:0}button{font-size:28rpx}text{overflow-wrap:anywhere}button[disabled]{opacity:.55}
/* #ifdef H5 */
/* Replace framework CDN shadow preload with a local CSS treatment. */
body:after{animation:none!important;background-image:none!important}
.uni-page-head-shadow-grey:after,.uni-page-head-shadow-blue:after{background-image:linear-gradient(to bottom,rgba(48,42,50,.12),transparent)!important}
/* #endif */
</style>
