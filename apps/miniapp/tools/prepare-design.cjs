/* Keep the miniapp's visual vocabulary sourced from the accepted web design. */
'use strict'
const fs = require('node:fs'), path = require('node:path')
const root = path.resolve(__dirname, '../../..'), out = path.resolve(__dirname, '../src/styles/generated')
const source = fs.readFileSync(path.join(root, 'design-tokens.css'), 'utf8')
const block = source.match(/:root\s*\{([\s\S]*?)\n\}/)
if (!block) throw Error('Web design-token declaration was not found')
const artwork = fs.readFileSync(path.join(root, 'assets/design/card-back.svg'))
const declarations = block[1].replace(/url\("assets\/design\/card-back\.svg"\)/, `url("data:image/svg+xml;base64,${artwork.toString('base64')}")`)
fs.mkdirSync(out, { recursive: true })
fs.writeFileSync(path.join(out, 'web-tokens.css'), `/* Generated from design-tokens.css and the original card-back.svg. */\npage {${declarations}\n}\n/* #ifdef H5 */\n:root {${declarations}\n}\n/* #endif */\n`)
fs.copyFileSync(path.join(root,'spread-thumbnail.css'),path.join(out,'spread-thumbnail.css'))
console.log('Shared web design tokens and original card back prepared for miniapp.')
