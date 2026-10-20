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
@import './styles/generated/web-tokens.css';
@import './styles/interface.css';
@import './styles/generated/spread-thumbnail.css';
</style>
