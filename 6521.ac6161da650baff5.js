"use strict";(self.webpackChunkapp=self.webpackChunkapp||[]).push([[6521],{333:(E,l,r)=>{r.d(l,{c:()=>c,g:()=>p,h:()=>d,o:()=>_});var i=r(467);const d=(s,t)=>null!==t.closest(s),c=(s,t)=>"string"==typeof s&&s.length>0?Object.assign({"ion-color":!0,[`ion-color-${s}`]:!0},t):t,p=s=>{const t={};return(s=>void 0!==s?(Array.isArray(s)?s:s.split(" ")).filter(n=>null!=n).map(n=>n.trim()).filter(n=>""!==n):[])(s).forEach(n=>t[n]=!0),t},h=/^[a-z][a-z0-9+\-.]*:/,_=function(){var s=(0,i.A)(function*(t,n,a,o){if(null!=t&&"#"!==t[0]&&!h.test(t)){const e=document.querySelector("ion-router");if(e)return null!=n&&n.preventDefault(),e.push(t,a,o)}return!1});return function(n,a,o,e){return s.apply(this,arguments)}}()},6521:(E,l,r)=>{r.r(l),r.d(l,{ion_input_password_toggle:()=>n});var i=r(6317),d=r(9144),c=r(333),u=r(3992),p=r(4346);const n=(()=>{let a=class{constructor(o){(0,i.r)(this,o),this.togglePasswordVisibility=()=>{const{inputElRef:e}=this;e&&(e.type="text"===e.type?"password":"text")},this.color=void 0,this.showIcon=void 0,this.hideIcon=void 0,this.type="password"}onTypeChange(o){"text"===o||"password"===o||(0,d.p)(`ion-input-password-toggle only supports inputs of type "text" or "password". Input of type "${o}" is not compatible.`,this.el)}connectedCallback(){const{el:o}=this,e=this.inputElRef=o.closest("ion-input");e?this.type=e.type:(0,d.p)("No ancestor ion-input found for ion-input-password-toggle. This component must be slotted inside of an ion-input.",o)}disconnectedCallback(){this.inputElRef=null}render(){var o,e;const{color:f,type:P}=this,g=(0,p.b)(this),b=null!==(o=this.showIcon)&&void 0!==o?o:u.x,I=null!==(e=this.hideIcon)&&void 0!==e?e:u.y,y="text"===P;return(0,i.h)(i.e,{key:"d9811e25bfeb2aa197352bb9be852e9e420739d5",class:(0,c.c)(f,{[g]:!0})},(0,i.h)("ion-button",{key:"1eaea1442b248fb2b8d61538b27274e647a07804",mode:g,color:f,fill:"clear",shape:"round","aria-checked":y?"true":"false","aria-label":"show password",role:"switch",type:"button",onPointerDown:w=>{w.preventDefault()},onClick:this.togglePasswordVisibility},(0,i.h)("ion-icon",{key:"9c88de8f4631d9bde222ce2edf6950d639e04773",slot:"icon-only","aria-hidden":"true",icon:y?I:b})))}get el(){return(0,i.f)(this)}static get watchers(){return{type:["onTypeChange"]}}};return a.style={ios:"",md:""},a})()}}]);