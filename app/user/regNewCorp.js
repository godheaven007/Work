/**
 * 加入企业
 */
define(function(require, exports, module) {
    var $ = require('jquery');
    require('validationEngine')($);
    var Util = require('common/util'),
        UserURL = require('user/url'),
        UserCommon = require('user/common');

    var mobileCodeNum = 0; // 发送验证码次数
    var isSendAble = false,
        verifyTryCodeFlag = false,  // 图片验证码验证是否正确
        corpNameOnly = true,
        isSubmitAble = false;

    function init() {
        if(sessionStorage.getItem('mobileCodeNum') != null) {
            mobileCodeNum = parseInt(sessionStorage.getItem('mobileCodeNum'));
        }

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
        // 企业名称、项目名称、管理员姓名
        $('#projectName,#adminName').addClass('validate[required, maxSize[30]]');
        $('#corpName').addClass('validate[required, minSize[5],maxSize[30]]');
        // 管理员手机号
        $('#username').addClass('validate[required, custom[mobile]]');
        // 短信验证码
        $("#mobileCode").addClass('validate[required, minSize[6], maxSize[6]]');
        // 图形验证码
        $("#tryCode").addClass('validate[required, minSize[4], maxSize[4]]');

        /**
         * 注册新企业-设置初始密码
         */
        $('#password,#password2').addClass('validate[required, minSize[6], maxSize[20], funcCall[validatePwd]]');
        // 用户协议
        $("#agreement").attr('data-prompt-position', 'centerTop').addClass('validate[required]');

        $('form').validationEngine({
            custom_error_messages: {
                '#corpName': {
                    required: {
                        'message': '* 请填写企业名称'
                    }
                },
                '#projectName': {
                    required: {
                        'message': '* 请填写项目名称'
                    }
                },
                '#adminName': {
                    required: {
                        'message': '* 请填写管理员姓名'
                    }
                },
                '#username': {
                    required: {
                        'message': '* 请填写管理员手机号'
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
                }
            }
        });
    }

    // 发送短信验证码
    function sendHandle(userName, smsToken, $o) {
        UserCommon.sendMsgCode(userName, smsToken, function(res) {
            // 经确认，是否发送成功都累加
            mobileCodeNum += 1;
            sessionStorage.setItem('mobileCodeNum', mobileCodeNum);
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

    // function doSubmit($form) {
    //     if (isSubmitAble) return false;
    //     isSubmitAble = true;
    //     var data = $form.serializeArray();
    //
    //     $.ajax({
    //         url: UserURL.URL.doRegister,
    //         type: 'POST',
    //         dataType: 'json',
    //         data: data
    //     })
    //     .done(function (json) {
    //     })
    //     .always(function () {
    //         isSubmitAble = false;
    //     });
    // }

    $(function() {
        init();
        // 企业名称唯一性验证
        $(document).on('blur', '#corpName', function() {
            var corpName = $(this).val();
            if(!!corpName) {
                $.ajax({
                    url: UserURL.URL.checkCorpName,
                    type: 'GET',
                    dataType: 'json',
                    data: {
                        corpName: corpName
                    },
                    success: function (res) {
                        if (res.success) {
                            corpNameOnly = true;
                            $('.msg-error').find('.error5').remove();
                        } else {
                            corpNameOnly = false;
                            $('.msg-error').html('<span class="error5">' + res.errorMessage + '</span>');
                        }
                    },
                    error: function () {

                    },
                    complete: function () {

                    }
                });
            }
        });

        // 短信验证码
        $(document).on('click', '.getMobileCode', function() {
            var $o = $(this),
                $userName = $('#username'),
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

            // 连续发送3次（包含3次）短信验证码，启用图片验证码 mobileCodeNum >= 2
            if(mobileCodeNum >= 2) {
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
                        UserCommon.verifyTryCode($tryCode.val(), function(res) {
                            if(res.success) {
                                verifyTryCodeFlag = true;
                                // 图形验证码成功
                                sendHandle($userName.val(), smsToken, $o);
                                $('.msg-error').find('.error2').remove();
                            } else {
                                // 图形验证码失败
                                $('.msg-error').html('<span class="error2">'+ res.errorMessage +'</span>');
                                verifyTryCodeFlag = false;
                                isSendAble = false;
                            }
                        }, function() {
                            isSendAble = false;
                        });
                    }
                }
            } else {
                sendHandle($userName.val(), smsToken, $o);
            }
        });

        $(document).on('click', '#doSubmit', function(e) {
            // e.preventDefault();
            var $form = $('form');
            var bl = $form.validationEngine('validate');
            if (!bl) return false;

            var $wechatCode = $('#wechatCode'),
                $tryCode = $('#tryCode'),
                $userName = $('#username');

            if(!corpNameOnly) {
                $('.msg-error').html('<span class="error5">企业名称已存在</span>');
                return false;
            }

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
                        // UserCommon.reRenderWxLogin();
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

        // 注册新企业-设置初始密码
        $(document).on('click', '#submit2', function() {
            var $form = $('form');
            var bl = $form.validationEngine('validate');
            if (!bl) return false;

            var pwd = $('#password').val(),
                pwd2 = $('#password2').val();

            if(pwd !== pwd2) {
                $('.msg-error').text('两次输入的密码不一致，请重新输入');
                return false;
            }

            // 密码设置成功
            $form.submit();
        });
    });
});
