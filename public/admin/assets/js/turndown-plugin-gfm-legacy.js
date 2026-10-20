(function(){System.register([],function(e,t){var n,r,i,a;function o(e){e.addRule(`highlightedCodeBlock`,{filter:function(e){var t=e.firstChild;return e.nodeName===`DIV`&&n.test(e.className)&&t&&t.nodeName===`PRE`},replacement:function(e,t,r){var i=((t.className||``).match(n)||[null,``])[1];return`

`+r.fence+i+`
`+t.firstChild.textContent+`
`+r.fence+`

`}})}function s(e){e.addRule(`strikethrough`,{filter:[`del`,`s`,`strike`],replacement:function(e){return`~`+e+`~`}})}function c(e){var t=e.parentNode;return t.nodeName===`THEAD`||t.firstChild===e&&(t.nodeName===`TABLE`||l(t))&&i.call(e.childNodes,function(e){return e.nodeName===`TH`})}function l(e){var t=e.previousSibling;return e.nodeName===`TBODY`&&(!t||t.nodeName===`THEAD`&&/^\s*$/i.test(t.textContent))}function u(e,t){var n=r.call(t.parentNode.childNodes,t),i=` `;return n===0&&(i=`| `),i+e+` |`}function d(e){for(var t in e.keep(function(e){return e.nodeName===`TABLE`&&!c(e.rows[0])}),a)e.addRule(t,a[t])}function f(e){e.addRule(`taskListItems`,{filter:function(e){return e.type===`checkbox`&&e.parentNode.nodeName===`LI`},replacement:function(e,t){return(t.checked?`[x]`:`[ ]`)+` `}})}function p(e){e.use([o,s,d,f])}return e(`t`,p),{setters:[],execute:function(){n=/highlight-(?:text|source)-([a-z0-9]+)/,r=Array.prototype.indexOf,i=Array.prototype.every,a={},a.tableCell={filter:[`th`,`td`],replacement:function(e,t){return u(e,t)}},a.tableRow={filter:`tr`,replacement:function(e,t){var n=``,r={left:`:--`,right:`--:`,center:`:-:`};if(c(t))for(var i=0;i<t.childNodes.length;i++){var a=`---`,o=(t.childNodes[i].getAttribute(`align`)||``).toLowerCase();o&&(a=r[o]||a),n+=u(a,t.childNodes[i])}return`
`+e+(n?`
`+n:``)}},a.table={filter:function(e){return e.nodeName===`TABLE`&&c(e.rows[0])},replacement:function(e){return e=e.replace(`

`,`
`),`

`+e+`

`}},a.tableSection={filter:[`thead`,`tbody`,`tfoot`],replacement:function(e){return e}}}}})})();