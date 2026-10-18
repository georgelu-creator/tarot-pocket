// @ts-ignore Build-time projection of authored visual knowledge only.
import * as imageContent from './generated/mengyu.mjs'
export type ArtCard = { id:string; name:string; suit:string; number:string; keywords:string[]; observation:string; core:string; symbols:{label:string;meaning:string}[]; foundation:{title:string;text:string} }
export const cards:ArtCard[] = imageContent.cards
export const provenance:{edition:string;artist:string;note:string;sources:{id:string;url:string;license:string}[]} = imageContent.provenance
