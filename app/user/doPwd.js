/**
 * 注册新企业-设置初始密码
 */
define(function(require, exports, module) {
    var $ = require('jquery');
    require('validationEngine')($);
    var Util = require('common/util'),
        UserURL = require('user/url'),
        UserCommon = require('user/common');

    function init() {

        /**
         * 注册新企业-设置初始密码
         */
        $('#password,#password2').addClass('validate[required, minSize[6], maxSize[20], funcCall[validatePwd]]');

        $('form').validationEngine({
            custom_error_messages: {
                '#password': {
                    required: {
                        'message': '* 请填写设置密码'
                    }
                },
                '#password2': {
                    required: {
                        'message': '* 请填写确认密码'
                    }
                }
            }
        });
    }

    $(function() {
        init();

        // 注册新企业-设置初始密码
        $(document).on('click', '#doSubmit', function() {
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
