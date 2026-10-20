(function(){System.register([],function(e,t){var n,r,i,a,o,s,c,l,u;function d(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e}function f(e,t){return Array(t+1).join(e)}function p(e){return e.replace(/^\n*/,``)}function m(e){for(var t=e.length;t>0&&e[t-1]===`
`;)t--;return e.substring(0,t)}function h(e){return m(p(e))}function g(e){return x(e,n)}function _(e){return x(e,r)}function v(e){return S(e,r)}function y(e){return x(e,i)}function b(e){return S(e,i)}function x(e,t){return t.indexOf(e.nodeName)>=0}function S(e,t){return e.getElementsByTagName&&t.some(function(t){return e.getElementsByTagName(t).length})}function C(e){return a.reduce(function(e,t){return e.replace(t[0],t[1])},e)}function w(e){return e?e.replace(/(\n+\s*)+/g,`
`):``}function T(e){var t=e.replace(/([<>()])/g,`\\$1`);return t.indexOf(` `)>=0?`<`+t+`>`:t}function E(e){return e.replace(/"/g,`\\"`)}function D(e){for(var t in this.options=e,this._keep=[],this._remove=[],this.blankRule={replacement:e.blankReplacement},this.keepReplacement=e.keepReplacement,this.defaultRule={replacement:e.defaultReplacement},this.array=[],e.rules)this.array.push(e.rules[t])}function O(e,t,n){for(var r=0;r<e.length;r++){var i=e[r];if(k(i,t,n))return i}}function k(e,t,n){var r=e.filter;if(typeof r==`string`){if(r===t.nodeName.toLowerCase())return!0}else if(Array.isArray(r)){if(r.indexOf(t.nodeName.toLowerCase())>-1)return!0}else if(typeof r==`function`){if(r.call(e,t,n))return!0}else throw TypeError("`filter` needs to be a string, array, or function")}function A(e){var t=e.element,n=e.isBlock,r=e.isVoid,i=e.isPre||function(e){return e.nodeName===`PRE`};if(t.firstChild&&!i(t)){for(var a=null,o=!1,s=null,c=M(s,t,i);c!==t;){if(c.nodeType===3||c.nodeType===4){var l=c.data.replace(/[ \r\n\t]+/g,` `);if((!a||/ $/.test(a.data))&&!o&&l[0]===` `&&(l=l.substr(1)),!l){c=j(c);continue}c.data=l,a=c}else if(c.nodeType===1)n(c)||c.nodeName===`BR`?(a&&(a.data=a.data.replace(/ $/,``)),a=null,o=!1):r(c)||i(c)?(a=null,o=!0):a&&(o=!1);else{c=j(c);continue}var u=M(s,c,i);s=c,c=u}a&&(a.data=a.data.replace(/ $/,``),a.data||j(a))}}function j(e){var t=e.nextSibling||e.parentNode;return e.parentNode.removeChild(e),t}function M(e,t,n){return e&&e.parentNode===t||n(t)?t.nextSibling||t.parentNode:t.firstChild||t.nextSibling||t.parentNode}function N(){var e=s.DOMParser,t=!1;try{new e().parseFromString(``,`text/html`)&&(t=!0)}catch(e){}return t}function P(){var e=function(){};return F()?e.prototype.parseFromString=function(e){var t=new window.ActiveXObject(`htmlfile`);return t.designMode=`on`,t.open(),t.write(e),t.close(),t}:e.prototype.parseFromString=function(e){var t=document.implementation.createHTMLDocument(``);return t.open(),t.write(e),t.close(),t},e}function F(){var e=!1;try{document.implementation.createHTMLDocument(``).open()}catch(t){s.ActiveXObject&&(e=!0)}return e}function I(e,t){var n=typeof e==`string`?L().parseFromString(`<x-turndown id="turndown-root">`+e+`</x-turndown>`,`text/html`).getElementById(`turndown-root`):e.cloneNode(!0);return A({element:n,isBlock:g,isVoid:_,isPre:t.preformattedCode?R:null}),n}function L(){return l=l||new c,l}function R(e){return e.nodeName===`PRE`||e.nodeName===`CODE`}function z(e,t){return e.isBlock=g(e),e.isCode=e.nodeName===`CODE`||e.parentNode.isCode,e.isBlank=B(e),e.flankingWhitespace=V(e,t),e}function B(e){return!_(e)&&!y(e)&&/^\s*$/i.test(e.textContent)&&!v(e)&&!b(e)}function V(e,t){if(e.isBlock||t.preformattedCode&&e.isCode)return{leading:``,trailing:``};var n=H(e.textContent);return n.leadingAscii&&U(`left`,e,t)&&(n.leading=n.leadingNonAscii),n.trailingAscii&&U(`right`,e,t)&&(n.trailing=n.trailingNonAscii),{leading:n.leading,trailing:n.trailing}}function H(e){var t=e.match(/^(([ \t\r\n]*)(\s*))(?:(?=\S)[\s\S]*\S)?((\s*?)([ \t\r\n]*))$/);return{leading:t[1],leadingAscii:t[2],leadingNonAscii:t[3],trailing:t[4],trailingNonAscii:t[5],trailingAscii:t[6]}}function U(e,t,n){var r,i,a;return e===`left`?(r=t.previousSibling,i=/ $/):(r=t.nextSibling,i=/^ /),r&&(r.nodeType===3?a=i.test(r.nodeValue):n.preformattedCode&&r.nodeName===`CODE`?a=!1:r.nodeType===1&&!g(r)&&(a=i.test(r.textContent))),a}function W(e){if(!(this instanceof W))return new W(e);var t={rules:o,headingStyle:`setext`,hr:`* * *`,bulletListMarker:`*`,codeBlockStyle:`indented`,fence:"```",emDelimiter:`_`,strongDelimiter:`**`,linkStyle:`inlined`,linkReferenceStyle:`full`,br:`  `,preformattedCode:!1,blankReplacement:function(e,t){return t.isBlock?`

`:``},keepReplacement:function(e,t){return t.isBlock?`

`+t.outerHTML+`

`:t.outerHTML},defaultReplacement:function(e,t){return t.isBlock?`

`+e+`

`:e}};this.options=d({},t,e),this.rules=new D(this.options)}function G(e){var t=this;return u.call(e.childNodes,function(e,n){n=new z(n,t.options);var r=``;return n.nodeType===3?r=n.isCode?n.nodeValue:t.escape(n.nodeValue):n.nodeType===1&&(r=q.call(t,n)),J(e,r)},``)}function K(e){var t=this;return this.rules.forEach(function(n){typeof n.append==`function`&&(e=J(e,n.append(t.options)))}),e.replace(/^[\t\r\n]+/,``).replace(/[\t\r\n\s]+$/,``)}function q(e){var t=this.rules.forNode(e),n=G.call(this,e),r=e.flankingWhitespace;return(r.leading||r.trailing)&&(n=n.trim()),r.leading+t.replacement(n,e,this.options)+r.trailing}function J(e,t){var n=m(e),r=p(t),i=Math.max(e.length-n.length,t.length-r.length);return n+`

`.substring(0,i)+r}function Y(e){return e!=null&&(typeof e==`string`||e.nodeType&&(e.nodeType===1||e.nodeType===9||e.nodeType===11))}return e(`t`,W),{setters:[],execute:function(){n=`ADDRESS.ARTICLE.ASIDE.AUDIO.BLOCKQUOTE.BODY.CANVAS.CENTER.DD.DIR.DIV.DL.DT.FIELDSET.FIGCAPTION.FIGURE.FOOTER.FORM.FRAMESET.H1.H2.H3.H4.H5.H6.HEADER.HGROUP.HR.HTML.ISINDEX.LI.MAIN.MENU.NAV.NOFRAMES.NOSCRIPT.OL.OUTPUT.P.PRE.SECTION.TABLE.TBODY.TD.TFOOT.TH.THEAD.TR.UL`.split(`.`),r=[`AREA`,`BASE`,`BR`,`COL`,`COMMAND`,`EMBED`,`HR`,`IMG`,`INPUT`,`KEYGEN`,`LINK`,`META`,`PARAM`,`SOURCE`,`TRACK`,`WBR`],i=[`A`,`TABLE`,`THEAD`,`TBODY`,`TFOOT`,`TH`,`TD`,`IFRAME`,`SCRIPT`,`AUDIO`,`VIDEO`],a=[[/\\/g,`\\\\`],[/\*/g,`\\*`],[/^-/g,`\\-`],[/^\+ /g,`\\+ `],[/^(=+)/g,`\\$1`],[/^(#{1,6}) /g,`\\$1 `],[/`/g,"\\`"],[/^~~~/g,`\\~~~`],[/\[/g,`\\[`],[/\]/g,`\\]`],[/^>/g,`\\>`],[/_/g,`\\_`],[/^(\d+)\. /g,`$1\\. `]],o={},o.paragraph={filter:`p`,replacement:function(e){return`

`+e+`

`}},o.lineBreak={filter:`br`,replacement:function(e,t,n){return n.br+`
`}},o.heading={filter:[`h1`,`h2`,`h3`,`h4`,`h5`,`h6`],replacement:function(e,t,n){var r=Number(t.nodeName.charAt(1));if(n.headingStyle===`setext`&&r<3){var i=f(r===1?`=`:`-`,e.length);return`

`+e+`
`+i+`

`}return`

`+f(`#`,r)+` `+e+`

`}},o.blockquote={filter:`blockquote`,replacement:function(e){return e=h(e).replace(/^/gm,`> `),`

`+e+`

`}},o.list={filter:[`ul`,`ol`],replacement:function(e,t){var n=t.parentNode;return n.nodeName===`LI`&&n.lastElementChild===t?`
`+e:`

`+e+`

`}},o.listItem={filter:`li`,replacement:function(e,t,n){var r=n.bulletListMarker+`   `,i=t.parentNode;if(i.nodeName===`OL`){var a=i.getAttribute(`start`),o=Array.prototype.indexOf.call(i.children,t);r=(a?Number(a)+o:o+1)+`.  `}var s=/\n$/.test(e);return e=h(e)+(s?`
`:``),e=e.replace(/\n/gm,`
`+` `.repeat(r.length)),r+e+(t.nextSibling?`
`:``)}},o.indentedCodeBlock={filter:function(e,t){return t.codeBlockStyle===`indented`&&e.nodeName===`PRE`&&e.firstChild&&e.firstChild.nodeName===`CODE`},replacement:function(e,t,n){return`

    `+t.firstChild.textContent.replace(/\n/g,`
    `)+`

`}},o.fencedCodeBlock={filter:function(e,t){return t.codeBlockStyle===`fenced`&&e.nodeName===`PRE`&&e.firstChild&&e.firstChild.nodeName===`CODE`},replacement:function(e,t,n){for(var r=((t.firstChild.getAttribute(`class`)||``).match(/language-(\S+)/)||[null,``])[1],i=t.firstChild.textContent,a=n.fence.charAt(0),o=3,s=RegExp(`^`+a+`{3,}`,`gm`),c;c=s.exec(i);)c[0].length>=o&&(o=c[0].length+1);var l=f(a,o);return`

`+l+r+`
`+i.replace(/\n$/,``)+`
`+l+`

`}},o.horizontalRule={filter:`hr`,replacement:function(e,t,n){return`

`+n.hr+`

`}},o.inlineLink={filter:function(e,t){return t.linkStyle===`inlined`&&e.nodeName===`A`&&e.getAttribute(`href`)},replacement:function(e,t){var n=T(t.getAttribute(`href`)),r=E(w(t.getAttribute(`title`))),i=r?` "`+r+`"`:``;return`[`+e+`](`+n+i+`)`}},o.referenceLink={filter:function(e,t){return t.linkStyle===`referenced`&&e.nodeName===`A`&&e.getAttribute(`href`)},replacement:function(e,t,n){var r=T(t.getAttribute(`href`)),i=w(t.getAttribute(`title`));i&&(i=` "`+E(i)+`"`);var a,o;switch(n.linkReferenceStyle){case`collapsed`:a=`[`+e+`][]`,o=`[`+e+`]: `+r+i;break;case`shortcut`:a=`[`+e+`]`,o=`[`+e+`]: `+r+i;break;default:var s=this.references.length+1;a=`[`+e+`][`+s+`]`,o=`[`+s+`]: `+r+i}return this.references.push(o),a},references:[],append:function(e){var t=``;return this.references.length&&(t=`

`+this.references.join(`
`)+`

`,this.references=[]),t}},o.emphasis={filter:[`em`,`i`],replacement:function(e,t,n){return e.trim()?n.emDelimiter+e+n.emDelimiter:``}},o.strong={filter:[`strong`,`b`],replacement:function(e,t,n){return e.trim()?n.strongDelimiter+e+n.strongDelimiter:``}},o.code={filter:function(e){var t=e.previousSibling||e.nextSibling,n=e.parentNode.nodeName===`PRE`&&!t;return e.nodeName===`CODE`&&!n},replacement:function(e){if(!e)return``;e=e.replace(/\r?\n|\r/g,` `);for(var t=/^`|^ .*?[^ ].* $|`$/.test(e)?` `:``,n="`",r=e.match(/`+/gm)||[];r.indexOf(n)!==-1;)n+="`";return n+t+e+t+n}},o.image={filter:`img`,replacement:function(e,t){var n=C(w(t.getAttribute(`alt`))),r=T(t.getAttribute(`src`)||``),i=w(t.getAttribute(`title`)),a=i?` "`+E(i)+`"`:``;return r?`![`+n+`](`+r+a+`)`:``}},D.prototype={add:function(e,t){this.array.unshift(t)},keep:function(e){this._keep.unshift({filter:e,replacement:this.keepReplacement})},remove:function(e){this._remove.unshift({filter:e,replacement:function(){return``}})},forNode:function(e){if(e.isBlank)return this.blankRule;var t;return(t=O(this.array,e,this.options))||(t=O(this._keep,e,this.options))||(t=O(this._remove,e,this.options))?t:this.defaultRule},forEach:function(e){for(var t=0;t<this.array.length;t++)e(this.array[t],t)}},s=typeof window<`u`?window:{},c=N()?s.DOMParser:P(),u=Array.prototype.reduce,W.prototype={turndown:function(e){if(!Y(e))throw TypeError(e+` is not a string, or an element/document/fragment node.`);if(e===``)return``;var t=G.call(this,new I(e,this.options));return K.call(this,t)},use:function(e){if(Array.isArray(e))for(var t=0;t<e.length;t++)this.use(e[t]);else if(typeof e==`function`)e(this);else throw TypeError(`plugin must be a Function or an Array of Functions`);return this},addRule:function(e,t){return this.rules.add(e,t),this},keep:function(e){return this.rules.keep(e),this},remove:function(e){return this.rules.remove(e),this},escape:function(e){return C(e)}}}}})})();