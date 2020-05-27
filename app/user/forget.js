/**
 * 忘记密码
 */
define(function(require, exports, module) {
    var $ = require('jquery');
    require('validationEngine')($);
    var Util = require('common/util');
    var UserCommon = require('user/common');
    var isSendAble = false;

    function init() {
        UserCommon.commonEvent();
        $('#userName').addClass('validate[required, custom[mobile]]');
        $('#password,#password2').addClass('validate[required, minSize[6], maxSize[20], funcCall[validatePwd]]');
        // 短信验证码
        $("#mobileCode").addClass('validate[required, minSize[6], maxSize[6]]');
        // 图形验证码
        $("#tryCode").addClass('validate[required, minSize[4], maxSize[4]]');

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

        // 获取验证码(验证身份)
        if($('.getMobileCode').length) {
            isSendAble = true;
            UserCommon.countDown(60, $('.getMobileCode'), function() {
                isSendAble = false;
            });
        }

    }

    // 发送短信验证码
    function sendHandle(userName, smsToken, $o) {
        UserCommon.sendMsgCode(userName, smsToken, function(res) {
            $('#smsToken').val(res.data);
            if(res.success) {
                UserCommon.countDown(60, $o, function() {
                    isSendAble = false;
                });
            } else {
                $('.msg-error').html('<span class="error4">'+ res.errorMessage +'</span>');
                isSendAble = false;
            }
        }, function() {
            isSendAble = false;
        });
    }

    $(function() {
        init();

        // 短信验证码
        $(document).on('click', '.getMobileCode', function(e) {
            var $o = $(this),
                $userName = $('#userName'),
                smsToken = $('#smsToken').val();

            if(isSendAble) return false;
            isSendAble = true;

            sendHandle($userName.val(), smsToken, $o);
        });

        // 输入手机号下一步
        $(document).on('click', '#doSubmit1', function() {
            var $form = $('form'),
                bl = $form.validationEngine('validate');
            if (!bl) return false;

            var $tryCode = $('#tryCode');
            UserCommon.verifyTryCode($tryCode.val(), function(res) {
                if(res.success) {
                    // 图形验证码成功
                    $form.submit();
                } else {
                    // 图形验证码失败
                    isSendAble = false;
                }
            }, function() {
                isSendAble = false;
            });
        });

        // 验证身份-下一步
        $(document).on('click', '#doSubmit2', function() {
            var $form = $('form'),
                bl = $form.validationEngine('validate');
            if (!bl) return false;

            $form.submit();
        });

        $(document).on('click', '#doSubmit3', function() {
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
