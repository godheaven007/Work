/*
* 登录
* */

function init() {
    $('#username').addClass('validate[required]');
    $('#password').addClass('validate[required]');
    $('form').validationEngine({
        custom_error_messages: {
            '#username': {
                required: {
                    'message': '* 请您输入手机号'
                }
            },

            '#password': {
                required: {
                    'message': '* 请您输入密码'
                }
            }
        }
    });
}

$(function () {

    init();

    $(document).on('click', '.login-shift', function() {
        var index = $(this).index(),
            $loginBoxes = $('.login-box');

        if(!$(this).hasClass('hidden')) {
            $('.login-shift, .login-box').removeClass('hidden');
            $(this).addClass('hidden');
            $loginBoxes.eq(index).addClass('hidden');
        }
    });

    $(document).on('click', '#submitLogin', function() {
        var $form = $('#loginForm'),
            bl = $form.validationEngine('validate');

        if (!bl) return false;
        $form.submit();
    });

    $(document).keydown(function (event) {
        if (event.keyCode == 13) {
            if(!$('.log-pc').hasClass('hidden')) {
                $('#submitLogin').trigger('click');
            }
        }
    });
});


// var obj = new WxLogin({
//     self_redirect:false,//true：手机点击确认登录后可以在 iframe 内跳转到 redirect_uri，false：手机点击确认登录后可以在 top window 跳转到 redirect_uri。默认为 false。
//     id:"code",//第三方页面显示二维码的容器id
//     appid: "wx8de6ccfdf7831bbd",//应用唯一标识，在微信开放平台提交应用审核通过后获得
//     scope: "snsapi_login",//应用授权作用域，拥有多个作用域用逗号（,）分隔，网页应用目前仅填写snsapi_login即可
//     redirect_uri: "http%3A%2F%2Fsso%2Ehuhoo%2Ecom%2Fcas%2Flogin%3Flt%3DLT%2D62%2Dxes5Sfb1FmTLRXktJ1cAcuYN19kYBb%2Dcas01%2Eexample%2Eorg%26platform%3Dopark%26scene%3Doibs%26service%3Dhttp%3A%2F%2Fibs%2Eo%2Ecom%2F",//重定向地址，需要进行UrlEncode
//     state: "10001",//用于保持请求和回调的状态，授权请求后原样带回给第三方。该参数可用于防止csrf攻击（跨站请求伪造攻击），建议第三方带上该参数，可设置为简单的随机数加session进行校验
//     style: "black",//提供"black"、"white"可选，默认为黑色文字描述。详见文档底部FAQ
//     href: "https://ibs.o.com/assets/css/wwLogin.css"//自定义样式链接，第三方可根据实际需求覆盖默认样式。详见文档底部FAQ
// });
//
//
// if (!Array.prototype.indexOf) {
//     Array.prototype.indexOf = function(searchElement, fromIndex) {
//
//         var k;
//         if (this == null) {
//             throw new TypeError('"this" is null or not defined');
//         }
//
//         var o = Object(this);
//         var len = o.length >>> 0;
//         if (len === 0) {
//             return -1;
//         }
//
//         var n = +fromIndex || 0;
//         if (Math.abs(n) === Infinity) {
//             n = 0;
//         }
//
//         if (n >= len) {
//             return -1;
//         }
//
//         k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
//
//         while (k < len) {
//             if (k in o && o[k] === searchElement) {
//                 return k;
//             }
//             k++;
//         }
//         return -1;
//     };
//
// }
//
// // Polyfill (trim @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim)
// if (!String.prototype.trim) {
//     String.prototype.trim = function(){
//         return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
//     };
// }
//
// var cl = ('classList' in document.createElement('a'));
//
// function ctrlClass(opts) {
//     if (!opts.ele || !opts.c) return false;
//     var c = null;
//     typeof (opts.c) === 'string' ?
//         c = opts.c.trim().replace(/\s+/g, ' ').split(' ') :
//         c = opts.c;  //修复不规范传参
//
//     return opts.fun({
//         ele: opts.ele,
//         c: c
//     });
//     opts.ele = null;
// }
//
// // 支持 classList
// if(cl){
//     /**
//      * hasClass
//      * @param (element, 'c1 c2 c3 c4 c5')
//      */
//     function hasClass(ele, c) {
//         return ctrlClass({
//             ele: ele,
//             c: c,
//             fun: function(opts) {
//                 return opts.c.every(function(v) {
//                     return !!opts.ele.classList.contains(v);
//                 });
//             }
//         });
//     }
//
//     /**
//      * addClass
//      * @param (element, 'c1 c2 c3 c4 c5')
//      */
//     function addClass(ele, c) {
//         return ctrlClass({
//             ele: ele,
//             c: c,
//             fun: function(opts) {
//                 var ele = opts.ele,
//                     c = opts.c;
//                 c.forEach(function(v) {
//                     if (!hasClass(ele, v)) {
//                         ele.classList.add(v);
//                     }
//                 });
//             }
//         })
//     }
//
//     /**
//      * removeClass
//      * @param (element, 'c1 c2 c3')
//      */
//     function removeClass(ele, c) {
//         ctrlClass({
//             ele: ele,
//             c: c,
//             fun: function(opts) {
//                 var ele = opts.ele,
//                     c = opts.c;
//                 c.forEach(function(v) {
//                     // TODO 是否有必要判断 hasClass
//                     // if (!hasClass(ele, v)) {
//                     ele.classList.remove(v);
//                     // }
//                 });
//             }
//         });
//     }
//
//     /**
//      * toggleClass
//      * @param (element, 'c1 c2 c3')
//      */
//     function toggleClass(ele, c) {
//         ctrlClass({
//             ele: ele,
//             c: c,
//             fun: function(opts) {
//                 var ele = opts.ele,
//                     c = opts.c;
//                 c.forEach(function(v) {
//                     ele.classList.toggle(v);
//                 })
//             }
//         })
//     }
//
// }else{
//     /**
//      * hasClass
//      * @param (element, 'c1 c2 c3 c4 c5')
//      */
//     function hasClass(ele, c) {
//         return ctrlClass({
//             ele: ele,
//             c: c,
//             fun: function(opts) {
//                 var cln = opts.ele.className.split(' ');
//                 var c = opts.c;
//                 for (var i = 0; i < c.length; i++) {
//                     if(cln.indexOf(c[i]) !== -1){
//                         return true;
//                     }
//                 }
//                 return false;
//             }
//         });
//     }
//
//     /**
//      * addClass
//      * @param (element, 'c1 c2 c3')
//      */
//     function addClass(ele, c) {
//         ctrlClass({
//             ele: ele,
//             c: c,
//             fun: function(opts) {
//                 var ele = opts.ele,
//                     c = opts.c;
//                 for (var i = 0; i < c.length; i++) {
//                     if(!hasClass(ele, c[i])) {
//                         ele.className = ele.className !== '' ? (ele.className + ' ' + c[i]) : c[i];
//                     }
//                 }
//             }
//         });
//     }
//
//     /**
//      * removeClass
//      * @param (element, 'c1 c2 c3')
//      */
//     function removeClass(ele, c) {
//         ctrlClass({
//             ele: ele,
//             c: c,
//             fun: function(opts) {
//                 var ele = opts.ele,
//                     c = opts.c,
//                     cln = ele.className.split(' ');
//                 for (var i = 0; i < c.length; i++) {
//                     if (hasClass(ele, c[i])) {
//                         cln.splice(cln.indexOf(c[i]), 1);
//                     }
//                 }
//                 ele.className = cln.join(' ');
//             }
//         });
//     }
//
//     /**
//      * toggleClass
//      * @param (element, 'c1 c2 c3')
//      */
//     function toggleClass(ele, c){
//         ctrlClass({
//             ele: ele,
//             c: c,
//             fun: function(opts) {
//                 var ele = opts.ele,
//                     c = opts.c;
//                 for (var i = 0; i < c.length; i++) {
//                     !!hasClass(ele, c[i]) ? removeClass(ele, c[i]) : addClass(ele, c[i]);
//                 }
//             }
//         });
//     }
// }
//
//
// function $2(selector) {
//     return document.querySelector(selector);
// }
//
// function $$(selector) {
//     return document.querySelectorAll(selector);
// }
//
// function loginShift(nodes) {
//     for(var i = 0, len = nodes.length; i < len; i++) {
//         if(hasClass(nodes[i], 'hidden')) {
//             removeClass(nodes[i], 'hidden')
//         } else {
//             addClass(nodes[i], 'hidden');
//         }
//     }
// }
//
// window.onload = function() {
//     $2('.login-type-top').addEventListener('click', function(e) {
//         // e.preventDefault();
//         var shiftBtns = $$('.login-shift'),
//             loginBoxes = $$('.login-box');
//
//         loginShift(shiftBtns);
//         loginShift(loginBoxes);
//     })
// }
// $(function() {
//     $('form').validationEngine({
//         custom_error_messages: {
//             '#username': {
//                 required: {
//                     'message': '* 请您输入手机号'
//                 }
//             },
//
//             '#password': {
//                 required: {
//                     'message': '* 请您输入密码'
//                 }
//             }
//         }
//     });
//
//     $(document).on('click', '#submitLogin', function() {
//         var $form = $('form'),
//             bl = $form.validationEngine('validate');
//         if (!bl) return false;
//
//         $form.submit();
//     });
// })
