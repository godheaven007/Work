/*
* 登录
* */
define(function(require, exports, module) {
    var $ = require('jquery');
    var UserURL = require('user/url');
    var UserCommon = require('user/common');

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

    $(function() {

        // 绑定微信
        $(document).on('click', '#userBind', function() {
            var wxConfig = UserCommon.getWxConfig(),
                token = $("#oparkToken").val(),
                redirect_uri = 'http%3a%2f%2fsso.huhoo.com%2fcas%2flogin%3fplatform%3dopark%26scene%3dbind%26service%3dhttp%3a%2f%2fibs.'+ getRootDomain() +'%2foibs%2fview%2fregister%2fbindSuccess?token=' + token;
            window.location.href = UserURL.URL.wxBindUser + '?appid=' + wxConfig.appid + '&redirect_uri=' + redirect_uri + '&response_type=code&scope=snsapi_login&state=10001';
        });
    });
});
