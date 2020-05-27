define(function(require, exports, module) {

    /**
     *
     * @param {jqObject} the field where the validation applies
     * @param {Array[String]} validation rules for this field
     * @param {int} rule index
     * @param {Map} form options
     * @return an error string if validation failed
     */
    window.validatePwd = function (field, rules, i, options){
        var pwd = field.val();
        if(/\s/g.test(pwd)) {
            // 是否包含空格
            return options.allrules.validatePwdSpace.alertText
        }

        if(/[\u4e00-\u9fa5]/g.test(pwd)) {
            // 是否包含中文
            return options.allrules.validatePwdChinese.alertText
        }

        if(!/(?!^[0-9]+$)(?!^[A-z]+$)(?!^[^A-z0-9]+$)^.{6,20}$/g.test(pwd)) {
            // 字母、数字和符号两种以上的组合，6-20个字符
            return options.allrules.validatePwdStr.alertText
        }
    };

    /**
     * 获取根域
     */
    exports.getRootDomain = function() {
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

    /**
     * 向左填充指定位数'0'
      */
    exports.str_pad = function(str, len) {
        str += '';
        while (str.length < len) str = '0' + str;
        return str;
    };

    /**
     * 函数判断
     */
    exports.isFunc = function(cb) {
        return cb && (Object.prototype.toString.call(cb) == '[object Function]');
    }
});
