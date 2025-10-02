import{r as d,j as e}from"./app-2aN5fFIm.js";import{c as o,B as p,a as x}from"./button-BItv0zFD.js";import{p as m,q as j,r as u,s as l}from"./app-layout-DB0FO4Gy.js";import{E as g}from"./eye-MQgWJon-.js";import{D,A as f,a as y,b as k,c as w,d as A,e as v,f as C,g as N}from"./alert-dialog-D6zYjwZl.js";/**
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
 */const b=[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}]],z=o("Trash",b);function P({onEdit:a,onDelete:r,onShow:c,onDownload:n,className:i}){const[t,s]=d.useState(!1);return e.jsxs(m,{open:t,onOpenChange:s,children:[e.jsx(j,{asChild:!0,children:e.jsxs(p,{variant:"ghost",className:x("h-8 w-8 p-0",i),children:[e.jsx("span",{className:"sr-only",children:"Open menu"}),e.jsx(T,{className:"h-4 w-4"})]})}),e.jsxs(u,{align:"end",children:[c&&e.jsxs(l,{onClick:()=>{s(!1),c()},children:[e.jsx(g,{className:"h-4 w-4"}),"Lihat"]}),a&&e.jsxs(l,{onClick:()=>{s(!1),a()},children:[e.jsx(_,{className:"h-4 w-4"}),"Ubah"]}),n&&e.jsxs(l,{onClick:()=>{s(!1),n()},children:[e.jsx(D,{className:"h-4 w-4"}),"Unduh"]}),r&&e.jsxs(l,{onClick:()=>{s(!1),r()},variant:"destructive",children:[e.jsx(z,{className:"h-4 w-4"}),"Hapus"]})]})]})}function U({open:a,onOpenChange:r,onDelete:c,title:n="Are you sure?",description:i="This action cannot be undone. This will permanently delete this item and remove its data from our servers.",actionLabel:t="Delete",cancelLabel:s="Cancel",disabled:h=!1}){return e.jsx(f,{open:a,onOpenChange:r,children:e.jsxs(y,{children:[e.jsxs(k,{children:[e.jsx(w,{children:n}),e.jsx(A,{children:i})]}),e.jsxs(v,{children:[e.jsx(C,{disabled:h,children:s}),e.jsx(N,{onClick:c,className:"bg-destructive hover:bg-destructive/90",disabled:h,children:t})]})]})})}export{U as D,T as E,P as T};
