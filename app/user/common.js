define(function(require, exports, module) {
    var $ = require('jquery');
    var Util = require('common/util');
    var User = require('user/url');

    var getRootDomain = function() {
        var host = "null",
            url,
            origin;
        if (typeof url == "undefined" || null == url)
            url = window.location.href;
        origin = url.split('?')[0];
        var regex = /.*\:\/\/([^\/|:]*).*/;
        var matchVal = origin.match(regex);
        if (typeof matchVal != "undefined" && null != matchVal) {
            host = matchVal[1];
        }
        if (typeof host != "undefined" && null != host) {
            var strAry = host.split(".");
            if (strAry.length > 1) {
                host = strAry[strAry.length - 2] + "." + strAry[strAry.length - 1];
            }
        }
        return host;
    };

    exports.commonEvent = function() {
        var _this = this;

        // 图片验证码更换
        $(document).on('click', '.getTryCode', function() {
            _this.changeTryCode($(this));
        });

        // 更换微信二维码
        $(document).on('click', '.changeWeiXin', function () {
            _this.reRenderWxLogin();
        });

        $(document).on('blur', '#tryCode', function() {
            var $o = $(this),
                tryCode = $o.val();
            if(tryCode.length == 4) {
                _this.verifyTryCode(tryCode, function(res) {
                    if(res.success) {
                        $('.msg-error').find('.error2').remove();
                    } else {
                        $('.msg-error').html('<span class="error2">'+ res.errorMessage +'</span>');
                    }
                });
            }
        });
    };

    /**
     * 微信配置信息
     * @returns {{self_redirect: boolean, id: string, appid: string, scope: string, redirect_uri: string, state: string, style: string, href: string}}
     */
    exports.getWxConfig = function() {
        return {
            self_redirect:true,//true：手机点击确认登录后可以在 iframe 内跳转到 redirect_uri，false：手机点击确认登录后可以在 top window 跳转到 redirect_uri。默认为 false。
            id:"code",//第三方页面显示二维码的容器id
            appid: "wx8de6ccfdf7831bbd",//应用唯一标识，在微信开放平台提交应用审核通过后获得
            scope: "snsapi_login",//应用授权作用域，拥有多个作用域用逗号（,）分隔，网页应用目前仅填写snsapi_login即可
            redirect_uri: "http%3a%2f%2fsso.huhoo.com%2fcas%2flogin%3fplatform%3dopark%26scene%3dbind%26service%3dhttp%3a%2f%2fibs."+ getRootDomain() +"%2foibs%2fview%2fregister%2fbind",//重定向地址，需要进行UrlEncode
            state: "10001",//用于保持请求和回调的状态，授权请求后原样带回给第三方。该参数可用于防止csrf攻击（跨站请求伪造攻击），建议第三方带上该参数，可设置为简单的随机数加session进行校验
            style: "black",//提供"black"、"white"可选，默认为黑色文字描述。详见文档底部FAQ
            href: "https://ibs."+ getRootDomain() +"/assets/css/wwBind.css"//自定义样式链接，第三方可根据实际需求覆盖默认样式。详见文档底部FAQ
        }
    };

    /**
     * 微信二维码生成
     */
    exports.reRenderWxLogin = function() {
        $('#wechatCode').val('');
        $('#code').find('iframe').remove();
        var wxConfig = this.getWxConfig();
        new WxLogin(wxConfig);

        $('.info').text('扫码绑定微信，创建完成后可以直接使用此微信登录管理后台');
    };

    /**
     * 验证码倒计时效果
     */
    exports.countDown = function(time, $target, cb) {
        var flag = true;
        if (flag) {
            flag = false;
            $target.addClass('disabled');
            $target.text(Util.str_pad(time, 2) + '秒后重发');
            var timer = setInterval(function() {
                time -= 1;
                $target.text(Util.str_pad(time, 2) + '秒后重发');
                if(time === 0) {
                    clearInterval(timer);
                    $target.text('重新获取');
                    $target.removeClass('disabled');
                    if(Util.isFunc(cb)) {
                        cb();
                    }
                    flag = true;
                }
            }, 1000);
        }
    };

    /**
     * 验证码有效性验证
     */
    exports.verifyTryCode = function(tryCode, cb, cb2) {
        $.ajax({
            url: User.URL.verifyTryCode,
            type: 'GET',
            dataType: 'json',
            data: {
                tryCode: tryCode
            },
            success: function (res) {
                if(Util.isFunc(cb)) {
                    cb(res);
                }
            },
            error: function () {
                if(Util.isFunc(cb2)) {
                    cb2();
                }
            },
            complete: function () {

            }
        })
    };

    /**
     * 短信验证码发送
     */
    exports.sendMsgCode = function(mobile, smsToken, cb, cb2) {
        $.ajax({
            url: User.URL.sendMobileCode + '/' + smsToken,
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({msgSendTo: mobile}),
            success: function (res) {
                if(Util.isFunc(cb)) {
                    cb(res);
                }
            },
            error: function () {
                if(Util.isFunc(cb2)) {
                    cb2();
                }
            },
            complete: function () {

            }
        })
    };

    /**
     * 验证用户是否绑定微信
     * @param $o
     */
    exports.bindUserCheck = function(wechatCode, userName, cb) {
        $.ajax({
            url: User.URL.checkBind,
            type: 'GET',
            dataType: 'json',
            data: {
                wechatCode: wechatCode,
                userName: userName
            },
            success: function (res) {
                if(Util.isFunc(cb)) {
                    cb(res);
                }
            },
            error: function () {

            },
            complete: function () {

            }
        })
    };

    // 更换图片验证码
    exports.changeTryCode = function ($o) {
        var $img = $o.find('img'),
            imgSrc = $img.attr('src');
        imgSrc = imgSrc.split('?')[0];
        $img.attr('src', imgSrc + '?random=' + Math.random());
    };

    /**
     * error1: 请绑定微信后再提交
     * error2: 验证码不正确
     * error3: 手机与微信绑定不一致
     * error4: 发送失败
     * error5: 企业唯一性
     * @param code
     */
    window.parentFuncInvoke = function(code) {
        if(code) {
            // 扫码成功
            var imgSrc = 'http://ibs.' + Util.getRootDomain() + '/assets/css/images/login/';
            var codeHtml = '<img src="'+ imgSrc + 'code.jpg' +'" width="97" height="97">';
            var infoHtml = '<img src="'+ imgSrc + 'ico-complete.png' +'" width="18" height="18" class="vm mr-10">扫码成功';
            $('#code').html(codeHtml);
            $('.info').html(infoHtml);

            $('.changeWeiXinWrap').remove();
            $('.info').after('<div class="changeWeiXinWrap" style="padding-left: 112px; padding-top: 10px;"><a style="color:#1690ff;" href="javascript:;" class="changeWeiXin">更换其他微信</a></div>');
            $('#wechatCode').val(code);
            $('.msg-error').find('.error1').remove();
        }
    }
});