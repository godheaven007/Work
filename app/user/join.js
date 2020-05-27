/**
 * 加入企业
 */
define(function(require, exports, module) {
    var $ = require('jquery');
    require('validationEngine')($);
    var Util = require('common/util'),
        UserURL = require('user/url'),
        UserCommon = require('user/common');

    var mobileCodeNumJoin = 0; // 发送验证码次数
    var verifyTryCodeFlag = false,  // 图片验证码验证是否正确
        isSendAble = false;

    // 发送短信验证码
    function sendHandle(userName, smsToken, $o) {
        UserCommon.sendMsgCode(userName, smsToken, function(res) {
            // 经确认，是否发送成功都累加
            mobileCodeNumJoin += 1;
            sessionStorage.setItem('mobileCodeNumJoin', mobileCodeNumJoin);
            $('#smsToken').val(res.data);
            if(res.success) {
                UserCommon.countDown(60, $o, function() {
                    isSendAble = false;
                });
            } else {
                $('.msg-error').text(res.errorMessage);
                isSendAble = false;
            }
        }, function() {
            isSendAble = false;
        });
    }
    
    function init() {

        if(sessionStorage.getItem('mobileCodeNumJoin') != null) {
            mobileCodeNumJoin = parseInt(sessionStorage.getItem('mobileCodeNumJoin'));
        }


        // 登录页面-扫二维码进入（二维码需要显示已登录转态）
        if($('#wechatCode').val()) {
            var imgSrc = 'http://ibs.' + Util.getRootDomain() + '/assets/css/images/login/';
            var codeHtml = '<img src="'+ imgSrc + 'code.jpg' +'" width="97" height="97">';
            var infoHtml = '<img src="'+ imgSrc + 'ico-complete.png' +'" width="18" height="18" class="vm mr-10">扫码成功';
            $('#code').html(codeHtml);
            $('.info').html(infoHtml);

            $('.changeWeiXinWrap').remove();
            $('.info').after('<div class="changeWeiXinWrap" style="padding-left: 112px; padding-top: 10px;"><a style="color:#1690ff;" href="javascript:;" class="changeWeiXin">更换其他微信</a></div>');
        } else {
            if($('#code').length) {
                UserCommon.reRenderWxLogin();
            }
        }

        UserCommon.commonEvent();
        $('#userName').addClass('validate[required, custom[mobile]]');
        $('#password,#password2').addClass('validate[required, minSize[6], maxSize[20], funcCall[validatePwd]]');
        // 短信验证码
        $("#mobileCode").addClass('validate[required, minSize[6], maxSize[6]]');
        // 图形验证码
        $("#tryCode").addClass('validate[required, minSize[4], maxSize[4]]');
        // 用户协议
        $("#agreement").attr('data-prompt-position', 'centerTop').addClass('validate[required]');

        $('form').validationEngine({
            custom_error_messages: {
                '#userName': {
                    required: {
                        'message': '* 请填写您的手机号'
                    }
                },
                '#mobileCode': {
                    required: {
                        'message': '* 请输入6位短信验证码'
                    },
                    minSize: {
                        'message': '* 请输入6位短信验证码'
                    },
                    maxSize: {
                        'message': '* 请输入6位短信验证码'
                    }
                },
                '#tryCode': {
                    required: {
                        'message': '* 请输入4位图形验证码'
                    },
                    minSize: {
                        'message': '* 请输入4位图形验证码'
                    },
                    maxSize: {
                        'message': '* 请输入4位图形验证码'
                    }
                },
                '#agreement': {
                    required: {
                        'message': '* 请认真阅读协议并勾选'
                    }
                },
                '#password': {
                    required: {
                        'message': '* 密码不能为空'
                    }
                },
                '#password2': {
                    required: {
                        'message': '* 确认密码不能为空'
                    }
                }
            }
        });
    }

    $(function() {
        init();

        // 短信验证码
        $(document).on('click', '.getMobileCode', function() {
            var $o = $(this),
                $userName = $('#userName'),
                $tryCode = $('#tryCode'),
                smsToken = $('#smsToken').val(),
                mobileReg = /^([1][3-9]\d{9})$/;

            // 手机号验证
            if(!(mobileReg.test($userName.val()))) {
                $userName.focus();
                $userName.blur();
                return false;
            }

            if(isSendAble) return false;
            isSendAble = true;

            // 连续发送3次（包含3次）短信验证码，启用图片验证码 mobileCodeNumJoin >= 2
            if(mobileCodeNumJoin >= 2) {
                $('.tryCodeRow').removeClass('hidden');

                if(!$.trim($tryCode.val())) {
                    $('#tryCode').focus();
                    $('#tryCode').blur();
                    isSendAble = false;
                    return false;
                } else if($tryCode.val().length != 4){
                    $tryCode.focus();
                    isSendAble = false;
                    return false;
                } else {
                    if(verifyTryCodeFlag) {
                        // 刷新图片验证码
                        $('.getTryCode').trigger('click');
                        $tryCode.val('');
                        verifyTryCodeFlag =  false;
                        isSendAble = false;
                    } else {
                        UserCommon.verifyTryCode($tryCode.val(), function (res) {
                            if (res.success) {
                                verifyTryCodeFlag = true;
                                // 图形验证码成功
                                sendHandle($userName.val(), smsToken, $o);
                                $('.msg-error').find('.error2').remove();
                            } else {
                                // 图形验证码失败
                                $('.msg-error').html('<span class="error2">' + res.errorMessage + '</span>');
                                verifyTryCodeFlag = false;
                                isSendAble = false;
                            }
                        }, function () {
                            isSendAble = false;
                        });
                    }
                }
            } else {
                sendHandle($userName.val(), smsToken, $o);
            }
        });

        $(document).on('click', '#doSubmit', function(e) {
            e.preventDefault();
            var $form = $('form');
            var bl = $form.validationEngine('validate');
            if (!bl) return false;

            var $wechatCode = $('#wechatCode'),
                $tryCode = $('#tryCode'),
                $userName = $('#userName');

            // 图形验证码、用户是否绑定微信验证
            if(!$.trim($tryCode.val())) {
                if(!$.trim($wechatCode.val())) {
                    $('.msg-error').html('<span class="error1">请绑定微信后再提交</span>');
                    return false;
                }
                UserCommon.bindUserCheck($wechatCode.val(), $userName.val(), function(res) {
                    if(res.success) {
                        $form.submit();
                        // doSubmit($form);
                    } else {
                        $('.msg-error').html('<span class="error3">'+ res.errorMessage +'</span>');
                        UserCommon.reRenderWxLogin();
                    }
                });
            } else {
                UserCommon.verifyTryCode($tryCode.val(), function(res) {
                    if(res.success) {
                        if(!$.trim($wechatCode.val())) {
                            $('.msg-error').html('<span class="error1">请绑定微信后再提交</span>');
                            return false;
                        }
                        // 验证用户是否绑定微信
                        UserCommon.bindUserCheck($wechatCode.val(), $userName.val(), function(res) {
                            if(res.success) {
                                $form.submit();
                                // doSubmit($form);
                            } else {
                                $('.msg-error').html('<span class="error3">'+ res.errorMessage +'</span>');
                                UserCommon.reRenderWxLogin();
                            }
                        });
                    } else {
                        $('.msg-error').html('<span class="error2">'+ res.errorMessage +'</span>');
                    }
                });
            }
        });

        // 新员工加入-设置登录密码
        $(document).on('click', '#doSubmit2', function() {
            var $form = $('form'),
                bl = $form.validationEngine('validate');
            if (!bl) return false;

            var pwd = $('#password').val(),
                pwd2 = $('#password2').val();

            if(pwd !== pwd2) {
                $('.msg-error').text('两次密码输入不一致');
                return false;
            }

            $form.submit();
        });
    });
});
