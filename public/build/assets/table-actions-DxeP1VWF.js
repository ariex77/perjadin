import{j as e,r as d}from"./app-DcC59gM4.js";import{A as p,a as x,b as m,c as j,d as u,e as g,f as D,g as f,D as y}from"./alert-dialog-CAdiPnCD.js";import{c as o,B as k,a as w}from"./button-CpjRaYVo.js";import{p as A,q as v,r as C,s as l}from"./app-layout-md0N9P8I.js";import{E as N}from"./eye-B5TCxU7g.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M=[["circle",{cx:"12",cy:"12",r:"1",key:"41hilf"}],["circle",{cx:"19",cy:"12",r:"1",key:"1wjl8i"}],["circle",{cx:"5",cy:"12",r:"1",key:"1pcz8c"}]],T=o("Ellipsis",M);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E=[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}],["path",{d:"m15 5 4 4",key:"1mk7zo"}]],_=o("Pencil",E);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}]],z=o("Trash",b);function P({open:a,onOpenChange:r,onDelete:c,title:n="Are you sure?",description:i="This action cannot be undone. This will permanently delete this item and remove its data from our servers.",actionLabel:t="Delete",cancelLabel:s="Cancel",disabled:h=!1}){return e.jsx(p,{open:a,onOpenChange:r,children:e.jsxs(x,{children:[e.jsxs(m,{children:[e.jsx(j,{children:n}),e.jsx(u,{children:i})]}),e.jsxs(g,{children:[e.jsx(D,{disabled:h,children:s}),e.jsx(f,{onClick:c,className:"bg-destructive hover:bg-destructive/90",disabled:h,children:t})]})]})})}function U({onEdit:a,onDelete:r,onShow:c,onDownload:n,className:i}){const[t,s]=d.useState(!1);return e.jsxs(A,{open:t,onOpenChange:s,children:[e.jsx(v,{asChild:!0,children:e.jsxs(k,{variant:"ghost",className:w("h-8 w-8 p-0",i),children:[e.jsx("span",{className:"sr-only",children:"Open menu"}),e.jsx(T,{className:"h-4 w-4"})]})}),e.jsxs(C,{align:"end",children:[c&&e.jsxs(l,{onClick:()=>{s(!1),c()},children:[e.jsx(N,{className:"h-4 w-4"}),"Lihat"]}),a&&e.jsxs(l,{onClick:()=>{s(!1),a()},children:[e.jsx(_,{className:"h-4 w-4"}),"Ubah"]}),n&&e.jsxs(l,{onClick:()=>{s(!1),n()},children:[e.jsx(y,{className:"h-4 w-4"}),"Unduh"]}),r&&e.jsxs(l,{onClick:()=>{s(!1),r()},variant:"destructive",children:[e.jsx(z,{className:"h-4 w-4"}),"Hapus"]})]})]})}export{P as D,T as E,U as T};
