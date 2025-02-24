import{r,j as R}from"./jsx-runtime-BMrMXMSG.js";import{R as h,r as C}from"./index-qcftwevc.js";import{E as M,m as y,e as g,f as E,g as S}from"./index-X6hTWa2L.js";import{i as F,e as b,f as P,s as k,g as D,h as z,j,k as H,R as L,l as O}from"./components-HnT9RUCx.js";/**
 * @remix-run/react v2.15.3
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function T(u){if(!u)return null;let m=Object.entries(u),s={};for(let[a,e]of m)if(e&&e.__type==="RouteErrorResponse")s[a]=new M(e.status,e.statusText,e.data,e.internal===!0);else if(e&&e.__type==="Error"){if(e.__subType){let i=window[e.__subType];if(typeof i=="function")try{let o=new i(e.message);o.stack=e.stack,s[a]=o}catch{}}if(s[a]==null){let i=new Error(e.message);i.stack=e.stack,s[a]=i}}else s[a]=e;return s}/**
 * @remix-run/react v2.15.3
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */let n,t,f=!1,c;new Promise(u=>{c=u}).catch(()=>{});function B(u){if(!t){if(window.__remixContext.future.v3_singleFetch){if(!n){let d=window.__remixContext.stream;F(d,"No stream found for single fetch decoding"),window.__remixContext.stream=void 0,n=b(d,window).then(l=>{window.__remixContext.state=l.value,n.value=!0}).catch(l=>{n.error=l})}if(n.error)throw n.error;if(!n.value)throw n}let i=P(window.__remixManifest.routes,window.__remixRouteModules,window.__remixContext.state,window.__remixContext.future,window.__remixContext.isSpaMode),o;if(!window.__remixContext.isSpaMode){o={...window.__remixContext.state,loaderData:{...window.__remixContext.state.loaderData}};let d=y(i,window.location,window.__remixContext.basename);if(d)for(let l of d){let _=l.route.id,x=window.__remixRouteModules[_],w=window.__remixManifest.routes[_];x&&k(w,x,window.__remixContext.isSpaMode)&&(x.HydrateFallback||!w.hasLoader)?o.loaderData[_]=void 0:w&&!w.hasLoader&&(o.loaderData[_]=null)}o&&o.errors&&(o.errors=T(o.errors))}t=g({routes:i,history:E(),basename:window.__remixContext.basename,future:{v7_normalizeFormMethod:!0,v7_fetcherPersist:window.__remixContext.future.v3_fetcherPersist,v7_partialHydration:!0,v7_prependBasename:!0,v7_relativeSplatPath:window.__remixContext.future.v3_relativeSplatPath,v7_skipActionErrorRevalidation:window.__remixContext.future.v3_singleFetch===!0},hydrationData:o,mapRouteProperties:S,dataStrategy:window.__remixContext.future.v3_singleFetch?z(window.__remixManifest,window.__remixRouteModules,()=>t):void 0,patchRoutesOnNavigation:D(window.__remixManifest,window.__remixRouteModules,window.__remixContext.future,window.__remixContext.isSpaMode,window.__remixContext.basename)}),t.state.initialized&&(f=!0,t.initialize()),t.createRoutesForHMR=j,window.__remixRouter=t,c&&c(t)}let[m,s]=r.useState(void 0),[a,e]=r.useState(t.state.location);return r.useLayoutEffect(()=>{f||(f=!0,t.initialize())},[]),r.useLayoutEffect(()=>t.subscribe(i=>{i.location!==a&&e(i.location)}),[a]),H(t,window.__remixManifest,window.__remixRouteModules,window.__remixContext.future,window.__remixContext.isSpaMode),r.createElement(r.Fragment,null,r.createElement(L.Provider,{value:{manifest:window.__remixManifest,routeModules:window.__remixRouteModules,future:window.__remixContext.future,criticalCss:m,isSpaMode:window.__remixContext.isSpaMode}},r.createElement(O,{location:a},r.createElement(h,{router:t,fallbackElement:null,future:{v7_startTransition:!0}}))),window.__remixContext.future.v3_singleFetch?r.createElement(r.Fragment,null):null)}var p,v=C;v.createRoot,p=v.hydrateRoot;r.startTransition(()=>{p(document,R.jsx(r.StrictMode,{children:R.jsx(B,{})}))});
