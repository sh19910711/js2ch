/* ===================================================
 * JavaScript 2ch-client Library
 * https://github.com/sh19910711/js2ch
 * ===================================================
 * Copyright (c) 2013 Hiroyuki Sano
 *
 * Licensed under MIT License.
 * http://opensource.org/licenses/MIT
 * =================================================== */

(function(){define("formatter",["underscore"],function(e){var t=function(){};t.prototype={};var n=e(t.prototype);return n.extend({format:function(t){return t}}),new t})}).call(this),function(){"use strict";var e=this;define("logger",["underscore","formatter"],function(e,t){var n=function(){};n.prototype={};var r=e(n.prototype);r.extend({log:function(){console.log.apply(console,arguments)}}),r.extend({debug:function(){console.debug.apply(console,arguments)}}),r.extend({info:function(){console.info.apply(console,arguments)}}),r.extend({warn:function(){console.warn.apply(console,arguments)}}),r.extend({error:function(){console.error.apply(console,arguments)}});var i=["log","debug","info","warn","error"];return e(i).each(function(r){var i=n.prototype[r];n.prototype[r]=function(){var n=Array.prototype.slice.apply(arguments);n=e(n).map(function(e){return t.format(e)}),i.apply(this,n)}}),new n})}.call(this),function(){"use strict";var e=this;define("socket",["underscore","net","encoding","logger"],function(e,t,n,r){function u(e){return String.fromCharCode.apply(null,new Uint16Array(e))}var i=[],s=function(){};s.prototype={};var o=e(s.prototype);return o.extend({create:function(n,r,s){var o=new t.Socket,u=i.length;i.push(o),setTimeout(s,0,{socketId:u})}}),o.extend({destroy:function(t){i[t].destroy()}}),o.extend({connect:function(n,r,s,o){var u=i[n];u.connect(s,r,function(){o(0)}),u.resultCode=1,u.buffer=[],u.readCallbacks=[],u.needBytes=0,u.byteCount=0,u.finished=!1,u.on("data",function(t){var n=e(t).map(function(e){return e});u.buffer=u.buffer.concat(n),u.byteCount+=n.length}),u.on("end",function(){u.finished=!0})}}),o.extend({disconnect:function(t){i[t].destroy()}}),o.extend({read:function(t,n,r){var s=i[t],o=setInterval(function(){if(!s.finished)return;clearInterval(o);if(s.byteCount>=n){var e=Math.min(n,s.byteCount);s.byteCount-=e,r({resultCode:1,data:s.buffer.splice(0,e)})}else if(s.byteCount>0){var e=s.byteCount;s.byteCount-=e,r({resultCode:1,data:new ArrayBuffer(s.buffer.splice(0,e))})}else r({resultCode:-1})},10)}}),o.extend({write:function(t,n,r){var s=u(n),o=i[t];o.write(s,function(){r()})}}),new s})}.call(this),function(){"use strict";define("util",["jquery","underscore"],function(e,t){var n=function(){};n.prototype={};var r=t(n.prototype);return r.extend({getDeferredFunc:function(n){return function(){var t=this,r=new e.Deferred,i=arguments[arguments.length-1],s=Array.prototype.slice.apply(arguments);return setTimeout(function(){i instanceof Function?s[s.length-1]=function(){i instanceof Function&&i.apply(this,arguments),r.resolve.apply(this,arguments)}:s.push(function(){i instanceof Function&&i.apply(this,arguments),r.resolve.apply(this,arguments)}),n.apply(t,s)},0),r}}}),r.extend({splitString:function(t,n){var r=t.indexOf(n);return[t.substring(0,r),t.substring(r+n.length)]}}),r.extend({checkEmptyString:function(n){return e.trim(n).length===0}}),new n})}.call(this),function(){define("buffer-lib",["underscore","encoding","logger"],function(e,t){var n=function(){};n.prototype={};var r=e(n.prototype);return r.extend({convertToString:function(n,r){setTimeout(function(){r((new Buffer(t.convert(n,"UTF-8","SJIS"))).toString("UTF-8"))},0)}}),r.extend({convertToBuffer:function(t,n){setTimeout(function(){var e=new ArrayBuffer(t.length*2),r=new Uint16Array(e);for(var i=0;i<t.length;++i)r[i]=t.charCodeAt(i);n(e)},0)}}),r.extend({getByteLength:function(t,n){console.log("str: ",t),setTimeout(function(){n(Buffer.byteLength(t,"sjis"))},0)}}),new n})}.call(this),function(){"use strict";var e=this;define("http-lib",["jquery","underscore","socket","purl","async","util","buffer-lib","logger"],function(e,t,n,r,i,s,o,u){function c(t,n){var r=new e.Deferred;return n instanceof Function||(n=r.resolve),o.convertToBuffer(t,n),r}function h(t){var n=t.split(a),r=n[0].split(" "),i=n.slice(1),o=i.map(function(t){return s.splitString(t,":").map(e.trim)}),u={"HTTP-Version":r[0],"Status-Code":r[1]};return o.forEach(function(e){u[e[0]]=e[1]}),u}function p(e){return s.splitString(e,a+a)[0]}function d(e){return s.splitString(e,a+a)[1]}function v(e){return t(t.keys(e)).map(function(t){return t+"="+e[t]}).join("&")}function m(e){var t=h(p(e)),e={headers:t,body:d(e)};return e}var a="\r\n",f=function(){};f.prototype={};var l=t(f.prototype);l.extend({get:function(s,u,f){function v(e){n.create("tcp",{},function(t){d=t.socketId,e(null)})}function g(e){n.connect(d,p.host,80,function(){var r=[];r.push("GET "+p.path+" HTTP/1.0"+a),t(t.keys(u)).each(function(e){r.push(e+": "+u[e]+a)}),r.push("Connection: close"+a),r.push(a);var i=r.join("");c(i).done(function(t){n.write(d,t,function(){e(null)})})})}function y(e){function u(){n.read(d,256,function(i){if(i.resultCode<0)clearTimeout(s),r=t(r).map(function(e){return e}),n.destroy(d),o.convertToString(r,function(t){l=m(t),e(null)});else{var a=[],f=new Uint8Array(i.data);t(f).each(function(e){a.push(e)}),r=r.concat(a),s=setTimeout(u,0)}})}var r=[],i="",s=setTimeout(u,0)}var l={},h=e.url(s),p={host:h.attr("host"),path:h.attr("path")},d;i.series([v,g,y],function(){f(l)})}}),l.extend({post:function(s,u,f,l){function y(e){n.create("tcp",{},function(t){g=t.socketId,e(null)})}function b(e){n.connect(g,d.host,80,function(){function l(o){d.query!=""&&(i+="?"+d.query),r.push("POST "+i+" HTTP/1.1"+a),t(t.keys(u)).each(function(e){r.push(e+": "+u[e]+a)}),r.push("Content-Length: "+o+a),r.push("Connection: close"+a),r.push(a),r.push(s);var f=r.join("");c(f).done(function(t){n.write(g,t,function(){e(null)})})}var r=[],i=d.path,s=v(f);o.getByteLength(s,l)})}function w(e){function u(){n.read(g,256,function(i){if(i.resultCode<0)clearTimeout(s),r=t(r).map(function(e){return e}),n.destroy(g),o.convertToString(r,function(t){h=m(t),e(null)});else{var a=[],f=new Uint8Array(i.data);t(f).each(function(e){a.push(e)}),r=r.concat(a),s=setTimeout(u,0)}})}var r=[],i="",s=setTimeout(u,0)}var h={},p=e.url(s),d={host:p.attr("host"),path:p.attr("path"),query:p.attr("query")},g;i.series([y,b,w],function(){l(h)})}});var g=["get","post"];return t(g).each(function(e){f.prototype[e]=s.getDeferredFunc(f.prototype[e])}),new f})}.call(this),function(){"use strict";var e=this;define("storage",["underscore","jquery","util","sqlite3"],function(e,t,n,r){var i=r.verbose(),s="items",o="js2ch.db",u=new t.Callbacks("once"),a=!1,f=function(){var e=new i.Database(o);e.get("SELECT COUNT(*) FROM sqlite_master WHERE type='table' and name='"+s+"'",function(t,n){var r=n["COUNT(*)"];r===0?e.run("CREATE TABLE "+s+" (key, value)",function(){u.fire(),e.close()}):u.fire()})};f.prototype={};var l=e(f.prototype);l.extend({get:function h(t,n){if(!u.fired()){u.add(h.bind(this,t,n));return}var r={},a={};typeof t=="string"?(t=[t],e(t).each(function(e){r[e]=undefined})):Array.isArray(t)?e(t).each(function(e){r[e]=undefined}):typeof t=="object"&&(r=e(t).clone(),t=e.keys(t)),e(t).each(function(e){a[e]=0});var f=new i.Database(o);f.all("SELECT key,value FROM "+s,function(t,i){var s=e(r).clone(),o=e(i).filter(function(e){return typeof a[e.key]!="undefined"});e(o).each(function(e){s[e.key]=JSON.parse(e.value)}),f.close(),n(s)})}}),l.extend({set:function p(n,r){if(!u.fired()){u.add(p.bind(this,n,r));return}var a={},f=e.keys(n);e(f).each(function(e){a[e]=JSON.stringify(n[e])});var l=new i.Database(o);l.serialize(function(){var n=[];(function(){var r=new t.Deferred,i=l.prepare("UPDATE "+s+" SET value = ? WHERE key = ?");e(a).each(function(e,t){i.run(e,t,function(){r.resolve()})}),i.finalize(),n.push(r)})(),function(){e(a).each(function(e,r){var i=new t.Deferred;l.get("SELECT * FROM "+s+" WHERE key = "+r,function(t,n){var o=l.prepare("INSERT INTO "+s+" VALUES(?,?)");o.run(r,e,function(){o.finalize(),i.resolve()})}),n.push(i)})}(),t.when.apply(null,n).done(function(){l.close(),r()})})}}),l.extend({remove:function d(n,r){if(!u.fired()){u.add(d.bind(this,n,r));return}typeof n=="string"&&(n=[n]);var a=new i.Database(o),f=a.prepare("DELETE FROM "+s+" WHERE key = ?"),l=[];e(n).each(function(e){var n=new t.Deferred;f.run(e,function(e,t){n.resolve()}),l.push(n)}),t.when.apply(null,l).done(function(){f.finalize(),a.close(),r()})}}),l.extend({clear:function v(e){if(!u.fired()){u.add(v.bind(this,e));return}var t=new i.Database(o);t.run("DELETE FROM "+s,function(){t.close(),e()})}});var c=["get","set","remove","clear"];return e(c).each(function(e){f.prototype[e]=n.getDeferredFunc(f.prototype[e])}),new f})}.call(this),function(){"use strict";var e=this;define("parser",["underscore","jquery","logger","util"],function(e,t,n,r){var i=function(){this.token="<>"};i.prototype={};var s=e(i.prototype);return s.extend({parseThreadList:function(i){function s(e){return t.trim(e)}function o(e){return t.trim(e.match(/(.*)\([0-9]+\)$/)[1])}function u(e){return parseInt(e.match(/.*\(([0-9]+)\)$/)[1],10)}function a(e){var t=r.splitString(e,this.token);return{filename:s(t[0]),subject:o(t[1]),responses:u(t[1])}}return e(i.split("\n")).reject(r.checkEmptyString).map(a.bind(this))}}),s.extend({parseResponsesFromThread:function(i){function s(e){var n={};return e=t.trim(e),e[0]=="<"?n={data:e.match(/<\/b>(.*)<b>/)[1],strong:!1}:n={data:e,strong:!0},n}function o(e){return t.trim(e)}function u(e){return t.trim(e)}function a(e){return t.trim(e)}function f(e){return t.trim(e)}function l(e,t){var n=e.split(this.token);return{number:t+1,name:s(n[0]),mail:o(n[1]),info:u(n[2]),body:a(n[3]),subject:f(n[4])}}var c=e(i.split("\n")).reject(r.checkEmptyString).map(l.bind(this));return c}}),new i})}.call(this),function(){"use strict";var e=this;define("client",["jquery","underscore","backbone","http-lib","storage","parser","encoding","util","logger"],function(e,t,n,r,i,s,o,u,a){function c(e,t){return"http://"+e+t}function h(e,t){return"/dat/"+t+".dat"}function p(e){return o.codeToString(o.convert(v(e),"SJIS","AUTO"))}function d(e){return t(e).map(function(e){return"%"+e.charCodeAt().toString(16).toUpperCase()}).join("")}function v(e){var n=[];return t(e.split("")).each(function(e){n.push(e.charCodeAt())}),n}var f=function(){this.HTTP_REQ_HEADERS_DEFAULT={"User-Agent":"Monazilla/1.00"}};f.prototype={};var l=t(f.prototype);l.extend({getThreadList:function(n,i,o){var u=c(n,"/"+i+"/subject.txt");r.get(u,t(this.HTTP_REQ_HEADERS_DEFAULT).extend({Host:n})).done(function(e){o(s.parseThreadList(e.body))})}}),l.extend({getSettingText:function(n,i,o){var u=c(n,"/"+i+"/SETTING.TXT");r.get(u,t(this.HTTP_REQ_HEADERS_DEFAULT).extend({Host:n})).done(function(e){o(s.parseSettingText(e.body))})}}),l.extend({getResponsesFromThread:function(n,i,o,u){var a=c(n,"/"+i+h(n,o));r.get(a,t(this.HTTP_REQ_HEADERS_DEFAULT).extend({Host:n})).done(function(e){u(s.parseResponsesFromThread(e.body))})}}),l.extend({putResponseToThread:function(s,o,a,f,l){function m(n){function s(t){var r=[];typeof t.headers["Set-Cookie"]!="undefined"&&r.push(l(t.headers["Set-Cookie"])),e.when.apply(null,r).done(function(){n(t)})}function l(n,r){function s(){return t(n.split(";")).each(function(n){var r=u.splitString(n,"="),i=e.trim(r[0]),s=e.trim(r[1]);if(i==="expires"||i==="path")return;var a={};a[i]=s,t(o).extend(a)}),typeof o["HAP"]=="undefined"&&(o.HAP=""),i.set({cookies:o})}var o={};return Array.isArray(n)?e.when.apply(null,t(n).map(l)):e.when.apply(null,[i.get("cookies").done(function(e){t(o).extend(e.cookies)})]).done(s)}var c=t(f).clone();t(c).each(function(e,t){c[t]=p(e)});var m=t(c).clone();t(m).each(function(e,t){m[t]=d(e)}),r.post(h,v,{bbs:o,key:a,time:1,submit:p("上記全てを承諾して書き込む"),FROM:m.name,mail:m.mail,MESSAGE:m.body,yuki:"akari"}).done(s)}function g(e){var n=t.keys(e),r=t(n).map(function(t){return t+"="+e[t]});return r.join("; ")}var h=c(s,"/test/bbs.cgi?guid=ON"),v=t(this.HTTP_REQ_HEADERS_DEFAULT).extend({Host:s,Referer:c(s,"/"+o+"/")});e.when.apply(null,[i.get("cookies").done(function(e){typeof e.cookies!="undefined"&&t(v).extend({Cookie:g(e.cookies)})})]).done(function(){m(l)})}});var m=["getThreadList","getSettingText","getResponsesFromThread","putResponseToThread"];return t(m).each(function(e){f.prototype[e]=u.getDeferredFunc(f.prototype[e])}),new f})}.call(this),function(){"use strict";var e=this;requirejs.config({paths:{client:"./sources/client",socket:"./sources/socket-node",storage:"./sources/storage-node","http-lib":"./sources/http-lib",parser:"./sources/parser","buffer-lib":"./sources/buffer-lib-node",util:"./sources/util",logger:"./sources/logger",formatter:"./sources/formatter",encoding:"./lib/encoding"}}),define(["client"],function(e){return e})}.call(this);