// uni injects WXS modules into the template; vue-tsc does not read that custom block.
export interface ContinuousFanWxs {
 setClock(clock:()=>number):void
 configure(...args: unknown[]): void
 scroll(...args: unknown[]): void
 start(...args: unknown[]): void
 move(...args: unknown[]): false | void
 end(...args: unknown[]): void
 cancel(...args: unknown[]): void
 tap(...args: unknown[]): void
}
declare module 'vue' {
 interface ComponentCustomProperties { fan: ContinuousFanWxs }
}
