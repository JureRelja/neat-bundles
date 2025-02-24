import{r as n,j as t}from"./jsx-runtime-BMrMXMSG.js";import{c as u,_ as f,M as y,d as x,S}from"./components-HnT9RUCx.js";import{c as j,d as w,O as g}from"./index-X6hTWa2L.js";import{a as k}from"./index-qcftwevc.js";/**
 * @remix-run/react v2.15.3
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */let a="positions";function M({getKey:r,...l}){let{isSpaMode:c}=u(),o=j(),p=w();k({getKey:r,storageKey:a});let m=n.useMemo(()=>{if(!r)return null;let e=r(o,p);return e!==o.key?e:null},[]);if(c)return null;let d=((e,h)=>{if(!window.history.state||!window.history.state.key){let s=Math.random().toString(32).slice(2);window.history.replaceState({key:s},"")}try{let i=JSON.parse(sessionStorage.getItem(e)||"{}")[h||window.history.state.key];typeof i=="number"&&window.scrollTo(0,i)}catch(s){console.error(s),sessionStorage.removeItem(e)}}).toString();return n.createElement("script",f({},l,{suppressHydrationWarning:!0,dangerouslySetInnerHTML:{__html:`(${d})(${JSON.stringify(a)}, ${JSON.stringify(m)})`}}))}function E(){return t.jsxs("html",{children:[t.jsxs("head",{children:[t.jsx("meta",{charSet:"utf-8"}),t.jsx("meta",{name:"viewport",content:"width=device-width,initial-scale=1"}),t.jsx("link",{rel:"preconnect",href:"https://cdn.shopify.com/"}),t.jsx("link",{rel:"stylesheet",href:"https://cdn.shopify.com/static/fonts/inter/v4/styles.css"}),t.jsx(y,{}),t.jsx(x,{})]}),t.jsxs("body",{children:[t.jsx(g,{}),t.jsx(M,{}),t.jsx(S,{})]})]})}export{E as default};
