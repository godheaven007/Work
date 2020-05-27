define(function(require, exports, module) {
    var URL = {
        // 短信验证码发送
        sendMobileCode: '/oibs/api/common/sms/sendCode',
        // 图形验证码校验
        verifyTryCode: '/oibs/api/imgvrifyDefaultKaptcha',
        // 验证微信绑订
        checkBind: '/oibs/api/register/checkBind',
        // 创建新企业
        doRegister: '/oibs/register/doRegister',
        // 微信跳转Url
        'wxBindUser': 'https://open.weixin.qq.com/connect/qrconnect',
        // 企业名称唯一性
        'checkCorpName': '/oibs/api/corp/checkName'
    };

    exports.URL = URL;
});