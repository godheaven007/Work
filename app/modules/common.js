layui.define(function (exports) {
    var $ = layui.jquery;
    var layer = layui.layer;
    var form = layui.form;
    var Req = layui.Req;
    var Dialog = layui.Dialog;
    var hoverTips;

    function getRootDomain() {
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
     * 切换公司\切换园区
     * @param param
     */

    function getSnippetHtml(list, type, activeId) {
        var _html = '';
        if (type == '1') {
            // 公司
            list.forEach(function (item, index) {
                var corpName = item.corpShortName ? item.corpShortName : item.corpName;
                if (item.uuId == activeId) {
                    _html += '<li class="switchItem active" data-empuuId="' + item.empUuId + '" data-uuid="' + item.uuId + '"><a href="javascript:void(0);" title="'+ corpName +'">' + corpName + '<i class="iconfont ibs-ico-right1"></i></a></li>';
                } else {
                    _html += '<li class="switchItem" data-empuuId="' + item.empUuId + '" data-uuid="' + item.uuId + '"><a href="javascript:void(0);" title="'+ corpName +'">' + corpName + '<i class="iconfont ibs-ico-right1"></i></a></li>';
                }
            });
        } else if (type == '2') {
            // 园区
            list.forEach(function (item, index) {
                var activeStr = '', isFreezeStr = '';
                if(item.parkId == activeId) {
                    activeStr = 'active';
                }
                if(item.parkStatus != '2') {
                    isFreezeStr = 'hidden';
                }
                _html += '<li class="switchItem '+ activeStr +'" data-parkid="' + item.parkId + '">' +
                            '<a href="javascript:void(0);" title="'+ item.parkName +'">' +
                                '<span class="layui-badge vm '+ isFreezeStr +'">冻结</span>' + item.parkName +
                            '</a>'+
                            '<i class="iconfont ibs-ico-right1"></i>' +
                         '</li>';
            });
        } else {
        }
        return _html;
    }

    function getCorpOrParkHtml(param) {

        var _html = '<div style="max-height: 300px; overflow-y: scroll;">' +
            '<div class="layui-card-body popup-02">';

        if (param.data.length > 5 && param.type == '2') {
            _html += '<div class="search-box">' +
                '<input type="text" name="switchSearchInput" placeholder="搜索' + param.title + '名称" autocomplete="off" class="layui-input">' +
                '<a href="javascript:void(0);" class="btn-input switchSearchBtn"><i class="iconfont ibs-ico-buttonsearch"></i></a>' +
                '</div>';
        }
        _html += '<ul class="switchList">' +
            getSnippetHtml(param.data, param.type, param.activeId) +
            '</ul></div></div>';
        return _html;
    }

    function switchCorp($o, param, index) {
        var uuid = $o.attr('data-uuid'),
            empuuid = $o.attr('data-empuuid');
        var data = {
            uuId: uuid,
            empuuid: empuuid
        };
        Req.postReqCommon2(param.ajaxUrl, data);
    }

    function switchPark($o, param, index) {
        var parkid = $o.attr('data-parkid');
        var data = {
            parkid: parkid
        };

        Req.postReqCommon2(param.ajaxUrl, data);
    }

    function switchCorpOrPark(param) {
        var list = param.data,
            type = param.type,
            activeId = param.activeId;
        layer.open({
            id: 100001,
            type: 5,
            title: '切换' + param.title || '切换',
            area: ['400px', 'auto'],
            btn: ['确定', '取消'],
            content: getCorpOrParkHtml(param),
            success: function (layero, index) {
                layero.find('.layui-layer-btn').hide();
                // 切换
                $(document).on('click', '.switchItem', function () {
                    var $o = $(this);
                    if (param.type == '1') {
                        switchCorp($o, param, index);
                    } else if (param.type == '2') {
                        switchPark($o, param, index);
                    }
                });

                // 搜索
                $(document).on('click', '.switchSearchBtn', function () {
                    var keyword = $('input[name=switchSearchInput]').val(),
                        result = [];

                    if (type == '1') {
                        // corp
                        for (var i = 0, len = list.length; i < len; i++) {
                            if (list[i].corpName && list[i].corpName.indexOf(keyword) != -1) {
                                result.push(list[i]);
                            }
                        }
                    } else if (type == '2') {
                        // park
                        for (var i = 0, len = list.length; i < len; i++) {
                            if (list[i].parkName && list[i].parkName.indexOf(keyword) != -1) {
                                result.push(list[i]);
                            }
                        }
                    } else {
                    }

                    if (result.length) {
                        $('.switchList').html(getSnippetHtml(result, type, activeId));
                    } else {
                        $('.switchList').html('未找到匹配的数据');
                    }

                });
                $(document).on('keydown', 'input[name=switchSearchInput]', function (e) {
                    if (e.keyCode == 13) {
                        // bug17306
                        $(this).trigger('blur');
                        // $('.switchSearchBtn').trigger('click');
                    }
                });
                $(document).on('blur', 'input[name=switchSearchInput]', function (e) {
                    $('.switchSearchBtn').trigger('click');
                });
            }
        })
    }

    // 水印加载
    function loadWaterMark(uuid, isOpen) {
        var origin = '',
            waterUrl = '';
        if (!window.location.origin) {
            origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
        } else {
            origin = window.location.origin;
        }
        if(origin.indexOf('oms') != -1) {
            waterUrl = origin + '/oms/api/water/commonMark';
        } else {
            waterUrl = origin + '/oibs/api/water/commonMark';
        }
        if (isOpen == '1') {
            $.ajax({
                url: waterUrl,
                type: 'GET',
                async: false,
                dataType: "jsonp",
                jsonp: "callback",
                jsonpCallback: "success_jsonpCallback",
                data: {
                    uuId: uuid
                },
                success: function (res) {
                    if (res.success) {
                        var imgUrl = res.data;
                        $('.waterMark').css('background', '#fff url(' + imgUrl + ') 5px 0 /150px 150px');
                        waterMarkImg = imgUrl;
                    } else {
                        layer.msg(res.errorMessage);
                    }
                }
            })
        } else {
            $('.waterMark').css('background', '');
        }
    }

    // 左边填充指定位数'0'
    function left_pad_0(str, len) {
        str += '';

        while (str.length < len) str = '0' + str;

        return str;
    }

    function renderAjaxBody(url, callback) {
        Req.getReq(url, function (res) {
            // if(res.status) {
            //     $('.ajaxBody').html(res.data.content);
            //     callback && callback();
            // }
            $('.ajaxBody').html(res);
            callback && callback();
        }, 'html');
    }

    function doCommonInit() {
        // delNotice
        $(document).on('click', '.delNotice', function () {
            var $o = $(this),
                url = $o.attr('data-url');
            var $target = $o.parents('.notice');
            Req.getReq(url, function (res) {
                if(res.status) {
                    // $target.slideUp("fast", function () {
                    //     $target.remove();
                    // });
                    $target.remove();
                    if($('.table-fixed').length) {
                        var _top =  $('.tab-fixed').css('top');
                        $('.tab-fixed').css('top', parseInt(_top) - 40);
                    }
                }
            })
        });

        // 溢出提示语
        $(document).on('mouseenter', '.hoverTips', function () {
            var message = $(this).attr('data-message');
            var curTips = $(this).attr('data-tips');
            var param = {
              time: 0,
              tips: !curTips ? 2 : curTips
            };
            hoverTips = layer.tips(message, this, param);
        });

        $(document).on('mouseleave', '.hoverTips', function () {
            layer.close(hoverTips);
        });

        // 切换公司
        $(document).on('click', '.switchCompany', function () {
            var corpuuid = $(this).attr('data-corpuuid');
            switchCorpOrPark({
                title: '公司',
                type: 1,
                data: corpList,
                // activeId: corpList[0].corpId,
                activeId: corpuuid,
                ajaxUrl: $(this).attr('data-url')
            });
        });

        // 切换园区
        $(document).on('click', '.switchPark', function () {
            switchCorpOrPark({
                title: '园区',
                type: 2,
                data: all_park_list,
                activeId: current_park_id,
                ajaxUrl: $(this).attr('data-url')
            });
        });

        loadWaterMark(userUuId, waterOpen);

        // 底部按钮适配
        if($('.layui-footer').length) {
            $('.layui-footer').parent('.layui-input-block').css('min-height', '50px');
        }

        // 菜单栏滚动到指定位置
        $(document).on('click', '.layui-nav-item dd', function () {
            var sideScrollTop = $('.layui-side-scroll').scrollTop();
            localStorage.setItem('sideScrollTop', sideScrollTop);
            localStorage.removeItem('navItem');
        });

        // $(document).on('click', 'li.layui-nav-item', function () {
        //     var $navChild = $(this).find('.layui-nav-child');
        //     if(!$navChild.length) {
        //         // 没有子项目
        //         localStorage.setItem('navItem', $(this).find('span.vm').text());
        //     }
        // });

        $(function () {
            var sideScrollTop = localStorage.getItem('sideScrollTop');
            if(sideScrollTop) {
                $('.layui-side-scroll').scrollTop(sideScrollTop);
            } else {
                var sideScrollTop = $('.layui-side-scroll').scrollTop();
                localStorage.setItem('sideScrollTop', sideScrollTop);
            }

            // var navItemStorage = localStorage.getItem('navItem');
            // var $navItems = $('.layui-nav .layui-nav-item');
            // if(navItemStorage) {
            //     $navItems.each(function (i, o) {
            //         if(!$(o).find('.layui-nav-child').length) {
            //             if(navItemStorage == $(o).find('span.vm').text()) {
            //                 $(o).addClass('layui-this');
            //                 return true;
            //             }
            //         }
            //     });
            // }
        });

    }

    doCommonInit();

    /**
     * 除法
     * javascript的除法结果会有误差，在两个浮点数相除的时候会比较明显。这个函数返回较为精确的除法结果。
     * @param arg1
     * @param arg2
     * @returns {number}
     */
    function accDiv(arg1, arg2) {
        var t1 = 0, t2 = 0, r1, r2;
        try {
            t1 = arg1.toString().split(".")[1].length
        } catch (e) {
        }
        try {
            t2 = arg2.toString().split(".")[1].length
        } catch (e) {
        }
        with (Math) {
            r1 = Number(arg1.toString().replace(".", ""));
            r2 = Number(arg2.toString().replace(".", ""));
            return (r1 / r2) * pow(10, t2 - t1);
        }
    }

    /**
     * 乘法
     * javascript的乘法结果会有误差，在两个浮点数相乘的时候会比较明显。这个函数返回较为精确的乘法结果。
     * @param arg1
     * @param arg2
     * @returns {number}
     */
    function accMul(arg1, arg2) {
        var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
        try {
            m += s1.split(".")[1].length
        } catch (e) {
        }
        try {
            m += s2.split(".")[1].length
        } catch (e) {
        }
        return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
    }

    /**
     * 加法
     * javascript的加法结果会有误差，在两个浮点数相加的时候会比较明显。这个函数返回较为精确的加法结果。
     * @param arg1
     * @param arg2
     * @returns {number}
     */
    function accAdd(arg1, arg2) {
        var r1, r2, m;
        try {
            r1 = arg1.toString().split(".")[1].length;
        } catch (e) {
            r1 = 0;
        }
        try {
            r2 = arg2.toString().split(".")[1].length;
        } catch (e) {
            r2 = 0;
        }
        m = Math.pow(10, Math.max(r1, r2));
        return (arg1 * m + arg2 * m) / m;
    }

    /**
     * 减法
     * @param arg1
     * @param arg2
     * @returns {string}
     */
    function accSub(arg1, arg2, fixed) {
        var r1, r2, m, n;
        try {
            r1 = arg1.toString().split(".")[1].length;
        } catch (e) {
            r1 = 0;
        }
        try {
            r2 = arg2.toString().split(".")[1].length;
        } catch (e) {
            r2 = 0;
        }
        m = Math.pow(10, Math.max(r1, r2));
        if(typeof fixed != 'undefined') {
            n = fixed;
        } else {
            //动态控制精度长度
            n = (r1 >= r2) ? r1 : r2;
        }

        return ((arg2 * m - arg1 * m) / m).toFixed(n);
    }

    // 获取数组重复项
    function getDuplicateItem(arr) {
        var o = {}, result = [];
        arr.forEach(function(k, v) {
            !o[k] ? o[k] = 1 : o[k]++;
        });

        for(var key in o) {
            if(parseInt(o[key]) > 1) {
                result.push(key);
            }
        }
        return result;
    }

    function dateFormat(date, fmt) {
        var o = {
            "M+": date.getMonth() + 1, //月份
            "d+": date.getDate(), //日
            "h+": date.getHours(), //小时
            "m+": date.getMinutes(), //分
            "s+": date.getSeconds(), //秒
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度
            "S": date.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }

    function getNextMonth(date, num) {
        var arr = date.split('-');
        var year = arr[0]; //获取当前日期的年份
        var month = arr[1]; //获取当前日期的月份
        var day = arr[2]; //获取当前日期的日
        var days = new Date(year, month, 0);
        days = days.getDate(); //获取当前日期中月的天数
        var year2 = year;
        var month2 = parseInt(month) + num; //当前月份+月数  1+12
        var years = Math.floor((month2 - 1) / 12);

        year2 = parseInt(year2) + years;
        if (years < 0) {
            years = Math.abs(years);
            month2 = month2 + years * 12;
        }
        month2 = parseInt((month2 % 12 == 0) ? 12 : month2 % 12);

        var day2 = day;
        var days2 = new Date(year2, month2, 0);
        days2 = days2.getDate();
        var bl = false;
        if (day2 > days2) {
            day2 = days2;
            bl = true;
        }

        if (month2 < 10) {
            month2 = '0' + month2;
        }
        var t2 = year2 + '-' + month2 + '-' + day2;

        if (!bl) {
            t2 = getNextDate(t2, 1, true);
        }

        return t2;
    }

    /**
     *  获取前|后几天的日期
     *  date:当前日期
     *  day:天数
     *  flag:前后  true||false 默认为false
     */
    function getNextDate(date, day, flag) {
        var date,
            daystamp = ((typeof(day) != 'undefined') ? day : 1) * 24 * 60 * 60 * 1000,
            flag = (flag ? flag : false),
            timestamp = new Date(date).getTime();

        if (!flag) {
            timestamp += daystamp;
        } else {
            timestamp -= daystamp;
        }
        date = dateFormat(new Date(timestamp), 'yyyy-MM-dd');
        return date;
    }

    /**
     *  计算天数差的函数
     *  sDate1和sDate2是2006-12-18格式
     */
     function countDateDiff(sDate1, sDate2) {
        var oDate1, oDate2, iDays;
        oDate1 = new Date(sDate1).getTime(); //new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0]) //转换为12-18-2006格式
        oDate2 = new Date(sDate2).getTime(); //new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0])
        iDays = parseInt((oDate1 - oDate2) / 1000 / 60 / 60 / 24); //把相差的毫秒数转换为天数
        return iDays;
    };

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

    /**
     * 获取上一个月
     * @date 格式为yyyy-mm-dd的日期，如：2014-01-25
     */
    function prevMonth(date) {
        var arr = date.split('-'),
            year = arr[0],              // 获取当前日期的年份
            month = arr[1],             // 获取当前日期的月份
            day = arr[2];               // 获取当前日期的日

        var days = new Date(year, month, 0);
        days = days.getDate();          // 获取当前日期中月的天数

        var year2 = year;
        var month2 = parseInt(month) - 1;
        if (month2 == 0) {
            year2 = parseInt(year2) - 1;
            month2 = 12;
        }

        var day2 = day;
        var days2 = new Date(year2, month2, 0);
        days2 = days2.getDate();        // 获取上个月的总计天数

        if (day2 > days2) {
            day2 = days2;
        }
        if (month2 < 10) {
            month2 = '0' + month2;
        }
        // return year2 + '-' + month2 + '-' + day2;
        return year2 + '-' + month2;
    }

    /**
     * 获取下一个月
     * @date 格式为yyyy-mm-dd的日期，如：2014-01-25
     */
    function nextMonth(date) {
        var arr = date.split('-'),
            year = arr[0],              // 获取当前日期的年份
            month = arr[1],             // 获取当前日期的月份
            day = arr[2];               // 获取当前日期的日

        var days = new Date(year, month, 0);
        days = days.getDate(); //获取当前日期中的月的天数

        var year2 = year;
        var month2 = parseInt(month) + 1;
        if (month2 == 13) {
            year2 = parseInt(year2) + 1;
            month2 = 1;
        }

        var day2 = day;
        var days2 = new Date(year2, month2, 0);
        days2 = days2.getDate();

        if (day2 > days2) {
            day2 = days2;
        }
        if (month2 < 10) {
            month2 = '0' + month2;
        }

        // return year2 + '-' + month2 + '-' + day2;
        return year2 + '-' + month2;
    }

    // 替换地址栏参数
    function replaceUrlParam(paramName,replaceWith) {
        var oUrl = window.location.href.toString();
        var tempParamName = paramName + '=';
        var newUrl = '';
        if(oUrl.indexOf(tempParamName) != -1) {
            var re = eval('/('+ paramName+'=)([^&]*)/gi');
            var newUrl = oUrl.replace(re, paramName + '=' + replaceWith);
        } else {
            if(oUrl.indexOf('?') != -1) {
                newUrl = oUrl + '&' + paramName + '=' + replaceWith;
            } else {
                newUrl = oUrl + '?' + paramName + '=' + replaceWith;
            }
        }

        return newUrl;
    }

    // 表单提交，layui会自动序列化input的name(例如：invoice_code[] => invoice_code[0])
    function replaceSerializeName($input) {
        var curName = $input.attr('name'),
            newName = curName.split('[');
        $input.attr('name', newName[0] + '[]');
    }

    function replaceSerializeName2($form) {
        if(!$form.length) return false;
        var $inputs = $form.find('input');
        $inputs.each(function (i, o) {
            var $curInput = $(o),
                curName = $curInput.attr('name');

            if(curName && curName.indexOf('[') != -1) {
                var curNewName = curName.split('[');
                $curInput.attr('name', curNewName[0] + '[]');
            }
        });
    }

    function commonPrint($printArea, callback) {
        var explorer = navigator.userAgent,
            $clonePrintArea;
        if (explorer.indexOf("AppleWebKit") >= 0) {
            $clonePrintArea = $printArea.css('z-index', 90).clone();
        } else {
            $clonePrintArea = $printArea.css('z-index', 90).css("zoom", 1.3).clone();
        }
        $clonePrintArea.find('.layui-footer').remove();
        $('.for-new-print .print').append($clonePrintArea.html());
        $('.for-new-print').show();
        var _width = $('.for-new-print .print').width(),
            _height = $printArea.height(),
            offsetWidth = 0,
            offsetHeight = 0;

        var max = Math.ceil(_width / 150) * Math.ceil(_height / 150) + Math.ceil(_width / 150)-1;


        // 判断是否开启水印
        if(waterOpen == '1') {

            for (var i = 0; i < max; i++) {
                if (offsetWidth < 800) {
                    if (explorer.indexOf("AppleWebKit") >= 0) {
                        $clonePrintArea.append($('<img src="' + waterMarkImg + '"  style="width:150px;position:absolute;top:' + offsetHeight + 'px;left:' + offsetWidth + 'px;z-index:0;"/>'));
                    } else {
                        $clonePrintArea.append($('<img src="' + waterMarkImg + '"  style="width:195px;position:absolute;top:' + offsetHeight * 1.3 + 'px;left:' + offsetWidth * 1.3 + 'px;z-index:0;"/>'));
                    }
                    offsetWidth += 150;
                } else {
                    offsetWidth = 0;
                    offsetHeight += 150;
                    if (explorer.indexOf("AppleWebKit") >= 0) {
                        $clonePrintArea.append($('<img src="' + waterMarkImg + '"  style="width:150px;position:absolute;top:' + offsetHeight + 'px;left:' + offsetWidth + 'px;z-index:0;"/>'));
                    } else {
                        $clonePrintArea.append($('<img src="' + waterMarkImg + '"  style="width:195px;position:absolute;top:' + offsetHeight * 1.3 + 'px;left:' + offsetWidth * 1.3 + 'px;z-index:0;"/>'));
                    }
                    offsetWidth += 150;
                }
            }
        }

        callback && callback($clonePrintArea);
    }

    // 光标移至最后
    function moveEnd(obj) {
        obj.focus();
        var len = obj.value.length;
        if (document.selection) {
            var sel = obj.createTextRange();
            sel.moveStart('character', len);
            sel.collapse();
            sel.select();
        } else if (typeof obj.selectionStart == 'number' && typeof obj.selectionEnd == 'number') {
            obj.selectionStart = obj.selectionEnd = len;
        }
    }

    /**
     * 转换成金额格式
     * @param number：要格式化的数字
     * @param decimals：保留几位小数
     * @param dec_point：小数点符号
     * @param thousands_sep：千分位符号
     * @returns {string}
     */
    function number_format(number, decimals, dec_point, thousands_sep) {
        number = (number + '').replace(/[^0-9+-Ee.]/g, '');
        var n = !isFinite(+number) ? 0 : +number,
            prec = !isFinite(+decimals) ? 2 : Math.abs(decimals),
            sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
            dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
            s = '',
            toFixedFix = function(n, prec) {
                var k = Math.pow(10, prec);
                return '' + Math.ceil(n * k) / k;
            };

        s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
        var re = /(-?\d+)(\d{3})/;
        while(re.test(s[0])) {
            s[0] = s[0].replace(re, "$1" + sep + "$2");
        }

        if((s[1] || '').length < prec) {
            s[1] = s[1] || '';
            s[1] += new Array(prec - s[1].length + 1).join('0');
        }
        return s.join(dec);
    }

    function is_null(v) {
        var num = parseFloat(v);
        if(isNaN(num)) {
            return true;
        } else {
            return false;
        }
    }

    // 函数防抖
    function debounce(fn, delay) {
        var timer = null;
        return function() {
            timer && clearTimeout(timer);
            var context = this,         // 将执行环境指向当前dom
                arg = arguments;        // 事件e
            timer = setTimeout(function() {
                fn.call(context, arg);
            },delay);
        }
    }

    function getImageInfo(url, callback) {
        var img = new Image();
        img.src = url;
        if (img.complete) {
            // 如果图片被缓存，则直接返回缓存数据
            callback(img.width, img.height);
        } else {
            img.onload = function () {
                callback(img.width, img.height);
            }
        }
    }

    function browser() {
        var u = navigator.userAgent.toLowerCase();
        return {
            txt: u, // 浏览器版本信息
            version: (u.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [])[1], // 版本号
            msie: /msie/.test(u) && !/opera/.test(u), // IE内核
            mozilla: /mozilla/.test(u) && !/(compatible|webkit)/.test(u), // 火狐浏览器
            safari: /safari/.test(u) && !/chrome/.test(u), // 是否为safair
            chrome: /chrome/.test(u), // 是否为chrome
            opera: /opera/.test(u), // 是否为oprea
            presto: u.indexOf('presto/') > -1, // opera内核
            webKit: u.indexOf('applewebkit/') > -1, // 苹果、谷歌内核
            gecko: u.indexOf('gecko/') > -1 && u.indexOf('khtml') == -1, // 火狐内核
            mobile: !!u.match(/applewebkit.*mobile.*/), // 是否为移动终端
            ios: !!u.match(/\(i[^;]+;( u;)? cpu.+mac os x/), // ios终端
            android: u.indexOf('android') > -1, // android终端
            iPhone: u.indexOf('iphone') > -1, // 是否为iPhone
            iPad: u.indexOf('ipad') > -1, // 是否iPad
            webApp: !!u.match(/applewebkit.*mobile.*/) && u.indexOf('safari/') == -1 // 是否web应该程序，没有头部与底部
        };
    }

    function copyToClipboard(text) {
        var textArea = document.createElement('textarea');
        textArea.style.position = 'fixed';
        textArea.style.zIndex = -1;
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.width = '1em';
        textArea.style.height = '1em';
        textArea.style.padding = '0';
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';
        textArea.style.background = 'transparent';
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();

        try {
            document.execCommand('copy');
        } catch (err) {
            console.log('该浏览器不支持点击复制到剪贴板');
        }

        document.body.removeChild(textArea);
    }

    function selectText(element) {
        if (document.body.createTextRange) {
            var range = document.body.createTextRange();
            range.moveToElementText(element);
            range.select();
        } else if (window.getSelection) {
            var selection = window.getSelection();
            var range = document.createRange();
            range.selectNodeContents(element);
            selection.removeAllRanges();
            selection.addRange(range);
        } else {
        }
    }

    function compareDate(date1, date2) {
        return new Date(date1).getTime() <= new Date(date2).getTime()
    }

    function dateFormat(date, fmt) {
        var o = {
            "M+": date.getMonth() + 1, //月份
            "d+": date.getDate(), //日
            "h+": date.getHours(), //小时
            "m+": date.getMinutes(), //分
            "s+": date.getSeconds(), //秒
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度
            "S": date.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }

    function getSearchParam() {
        var search = location.search,
            paramStr = '',
            result = [];
        var param = {};
        if(search) {
            paramStr = search.split('?')[1];
            result = paramStr.split('&');
        }


        if(result.length) {
            result.forEach(function (item, index) {
                var key = item.split('=')[0],
                    value = item.split('=')[1];

                param[key] = value;
            })
        }
        return param;
    }

    function getSearchParam2(searchUrl) {
        var searchParamArr = searchUrl.split('?'),
            searchParamStr = searchParamArr[1];
        var param = {},
            result = [];
        if(searchParamStr) {
            result = searchParamStr.split('&');
        }

        if(result.length) {
            result.forEach(function (item, index) {
                var key = item.split('=')[0],
                    value = item.split('=')[1];

                param[key] = value;
            })
        }
        return param;
    }

    /**
     * 房源组件用
     * @param searchUrl   selecthousebyparks?id=xxx or selecthousebyparks
     * @param searchParam {id: xxx , keyword: xxx}
     * @returns {string}
     */
    function getSearchStr(searchUrl, searchParam) {
        var searchArr = searchUrl.split('?'),
            searchParamArr = [];

        for(var key in searchParam) {
            searchParamArr.push(key + '=' + searchParam[key]);
        }
        return searchArr[0] + '?' + searchParamArr.join('&');
    }

    var Util = {
        getSearchParam: getSearchParam,
        getSearchStr: getSearchStr,
        selectText: selectText,
        copyToClipboard: copyToClipboard,
        compareDate: compareDate,
        dateFormat: dateFormat,
        accAdd: accAdd,
        accSub: accSub,
        accMul: accMul,
        accDiv: accDiv,
        getDuplicateItem: getDuplicateItem,
        getNextMonth: getNextMonth,
        getNextDate: getNextDate,
        prevMonth: prevMonth,
        nextMonth: nextMonth,
        dateFormat: dateFormat,
        replaceUrlParam: replaceUrlParam,
        replaceSerializeName: replaceSerializeName,
        replaceSerializeName2: replaceSerializeName2,
        countDateDiff: countDateDiff,
        getRootDomain: getRootDomain,
        getImageInfo: getImageInfo,
        number_format: number_format,
        debounce: debounce,
        browser: browser
    };

    /**
     * 房源选择组件
     * @param unit
     * @returns {string}
     */

    function getInfo(list) {
        var sum = 0,
            roomNames = {},
            roomArea = [],
            roomIds = [],
            basePrice = [],
            propertyPrice = [];
        list.forEach(function(item, index) {
            sum = Common.Util.accAdd(sum, item.roomArea);

            var buildName = item.buildName;
            if(!roomNames[buildName]) {
                roomNames[buildName] = [];
            }
            roomNames[buildName].push(item.roomName);
            roomArea.push(item.roomArea);
            roomIds.push(item.roomId);
            basePrice.push(item.basePrice);
            propertyPrice.push(item.propertyPrice);
        });

        var result = [];
        for(var key in roomNames) {
            result.push(key + '-' + roomNames[key].join(','))
        }

        return {
            area: sum,
            roomNames: result.join(','),
            roomIds: roomIds.join(','),
            roomArea: roomArea.join(','),
            roomAreas: sum,
            basePrice: basePrice.join(','),
            propertyPrice: propertyPrice.join(','),
            rentUnit: list[0].rentUnit,
            propertyUnit: list[0].propertyUnit,
        }
    }

    // 选中房源结果设置
    function setSelectRoom($target, list) {
        // console.log(list, 'list...');
        var roomList = [],
            stationList = [];
        list.forEach(function (item, index) {
            if(item.roomType == 'room') {
                roomList.push(item);
            } else {
                stationList.push(item);
            }
        });

        // console.log(roomList, 'roomList...');
        // console.log(stationList, 'stationList...');

        var roomInfo = {},
            stationInfo = {};
        roomList.forEach(function (item, index) {
            if(!roomInfo[item.buildId]) {
                roomInfo[item.buildId] = {};
                roomInfo[item.buildId].buildName = item.buildName;
                roomInfo[item.buildId].roomName = [item.roomName];
            } else {
                roomInfo[item.buildId].roomName.push(item.roomName);
            }
        });

        stationList.forEach(function (item, index) {
            if(!stationInfo[item.areaName]) {
                stationInfo[item.areaName] = {};
                stationInfo[item.areaName].roomName = [item.roomName];
            } else {
                stationInfo[item.areaName].roomName.push(item.roomName);
            }
        });

        var roomHtmlArr = [],
            stationHtmlArr = [];

        for(var key in roomInfo) {
            roomHtmlArr.push(roomInfo[key].buildName + '-' + roomInfo[key].roomName.join(','));
        }

        for(var key in stationInfo) {
            stationHtmlArr.push(stationInfo[key].roomName.join(','));
        }

        var allHtmlArr = [];
        roomHtmlArr.length && allHtmlArr.push(roomHtmlArr.join(';'));
        stationHtmlArr.length && allHtmlArr.push(stationHtmlArr.join(';'));

        $target.html(allHtmlArr.join(';'));
        $target.attr('title', allHtmlArr.join(';'));
    }

    /**
     * 房源底价计算
     */
    // 房源为按面积计费
    function calcBasePrice(list) {
        // 按面积计算底价 =  ∑（房源面积*底价）/ ∑ （房源面积）
        var totalSquare = 0, totalPrice = 0;
        list.forEach(function(item, index) {
            totalSquare = Common.Util.accAdd(totalSquare, item.roomArea);
            totalPrice = Common.Util.accAdd(totalPrice, Common.Util.accMul(item.basePrice, item.roomArea));
        });
        return Common.Util.accDiv(totalPrice, totalSquare).toFixed(2);
    }

    // 房源为一口价计费
    function calcBasePrice2(list) {
        // 一口价计算房源租金底价 =  ∑（房源1底价+…+房源N底价）
        var sum = 0;
        list.forEach(function(item, index) {
            sum = Common.Util.accAdd(sum, item.basePrice);
        });
        return sum.toFixed(2);
    }

    function getUnit(unit) {
        if(unit == '1') {
            return '元/㎡/月';
        } else if(unit == '2') {
            return '元/㎡/天';
        } else {
            return '元/天';
        }
    }

    function getHouseDetailHtml(data) {
        if(!data.squarePrice.length && !data.fixedPrice.length) {
            return '';
        }
        var _html = '<div class="sign-details">';
        if(data.squarePrice.length) {
            // 按面积
            _html += '<div class="layui-form-item label-l mb-10">' +
                '<label class="layui-form-label">房源</label>' +
                '<div class="layui-input-block">' +
                '<div class="layui-form-mid">' + getInfo(data.squarePrice).roomNames + '<span class="c-gray-light">（共计'+ getInfo(data.squarePrice).area +'㎡）</span></div>' +
                '</div>' +
                '</div>' +
                '<div class="layui-form-item label-l mb-10">' +
                '<div class="layui-inline inline-02">' +
                '<label class="layui-form-label"><span class="c-orange">* </span>租金单价</label>' +
                '<div class="layui-input-block">' +
                '<div class="layui-input-inline text-w-150">' +
                '<input type="text" class="layui-input rentPrice" name="rentPrice[]" lay-verify="required|onlyDecmal9" data-base="' + calcBasePrice(data.squarePrice) + '" data-rent-unit="' + data.squarePrice[0].rentUnit + '">' +
                '<input type="hidden" name="roomNames[]" value="' + getInfo(data.squarePrice).roomNames + '">' +
                '<input type="hidden" name="roomArea[]" value="' + getInfo(data.squarePrice).roomArea + '">' +
                '<input type="hidden" name="roomAreas[]" value="' + getInfo(data.squarePrice).roomAreas + '">' +
                '<input type="hidden" name="roomIds[]" value="' + getInfo(data.squarePrice).roomIds + '">' +
                '<input type="hidden" name="rentUnit[]" value="' + getInfo(data.squarePrice).rentUnit + '">' +
                '<input type="hidden" name="basePrice[]" value="' + getInfo(data.squarePrice).basePrice + '">' +
                '<input type="hidden" name="propertyPrice2[]" value="' + getInfo(data.squarePrice).propertyPrice + '">' +
                '</div>' +
                '<div class="layui-form-mid">' + data.squarePrice[0].rentUnitStr + '<span class="c-gray-light">（即：</span><span class="c-gray-light convert">'+ getUnit(data.squarePrice[0].rentUnit) +'</span><span class="c-gray-light">）</span></div>' +
                '</div>' +
                '</div>' +
                '<div class="layui-inline inline-02">' +
                '<label class="layui-form-label"><span class="c-orange">* </span>物业服务费单价</label>' +
                '<div class="layui-input-block">' +
                '<div class="layui-input-inline text-w-150">' +
                '<input type="text" class="layui-input propertyPrice" name="propertyPrice[]" lay-verify="required|onlyDecmal9">' +
                '<input type="hidden" name="propertyUnit[]" value="' + getInfo(data.squarePrice).propertyUnit + '">' +
                '</div>' +
                '<div class="layui-form-mid">' + data.squarePrice[0].propertyUnitStr + '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
        }
        if(data.fixedPrice.length) {
            // 按一口价
            _html += '<div class="layui-form-item label-l mb-10">' +
                '<label class="layui-form-label">房源</label>' +
                '<div class="layui-input-block">' +
                '<div class="layui-form-mid">' + getInfo(data.fixedPrice).roomNames + '<span class="c-gray-light">（共计'+ getInfo(data.fixedPrice).area +'㎡）</span><span class="layui-badge ml-5" style="display: none;">一口价</span></div>' +
                '</div>' +
                '</div>' +
                '<div class="layui-form-item label-l mb-10">' +
                '<div class="layui-inline inline-02">' +
                '<label class="layui-form-label"><span class="c-orange">* </span>租金</label>' +
                '<div class="layui-input-block">' +
                '<div class="layui-input-inline text-w-150">' +
                '<input type="text" class="layui-input rentPrice" name="rentPrice[]" lay-verify="required|onlyDecmal9" data-base="'+ calcBasePrice2(data.fixedPrice) +'" data-rent-unit="'+ data.fixedPrice[0].rentUnit +'">' +
                '<input type="hidden" name="roomNames[]" value="'+ getInfo(data.fixedPrice).roomNames +'">' +
                '<input type="hidden" name="roomArea[]" value="'+ getInfo(data.fixedPrice).roomArea +'">' +
                '<input type="hidden" name="roomAreas[]" value="'+ getInfo(data.fixedPrice).roomAreas +'">' +
                '<input type="hidden" name="roomIds[]" value="'+ getInfo(data.fixedPrice).roomIds +'">' +
                '<input type="hidden" name="rentUnit[]" value="'+ getInfo(data.fixedPrice).rentUnit +'">' +
                '<input type="hidden" name="basePrice[]" value="'+ getInfo(data.fixedPrice).basePrice +'">' +
                '<input type="hidden" name="propertyPrice2[]" value="'+ getInfo(data.fixedPrice).propertyPrice +'">' +
                '</div>' +
                '<div class="layui-form-mid">'+ data.fixedPrice[0].rentUnitStr +'<span class="c-gray-light">（即：</span><span class="c-gray-light convert">'+ getUnit(data.fixedPrice[0].rentUnit) +'</span><span class="c-gray-light">）</span></div>' +
                '</div>' +
                '</div>' +
                '<div class="layui-inline inline-02">' +
                '<label class="layui-form-label"><span class="c-orange">* </span>物业服务费</label>' +
                '<div class="layui-input-block">' +
                '<div class="layui-input-inline text-w-150">' +
                '<input type="text" class="layui-input propertyPrice" name="propertyPrice[]" lay-verify="required|onlyDecmal9">' +
                '<input type="hidden" name="propertyUnit[]" value="'+ getInfo(data.fixedPrice).propertyUnit +'">' +
                '</div>' +
                '<div class="layui-form-mid">'+ data.fixedPrice[0].propertyUnitStr +'</div>' +
                '</div>' +
                '</div>' +
                '</div>';
        }

        _html += '</div>';

        return _html;
    }

    function selectHouse(houseUrl, $selectRoomInput, $selectParkInput, callback, changeCb) {
        var list = [];
        Req.getReq(houseUrl, function (res) {
            Dialog.formDialog({
                id: 100000,
                title: '房源选择',
                content: res,
                area: ['720px', 'auto'],
                success: function(layero, index) {
                    var $dialogSearch = layero.find('#dialogSearch'),
                        $keyword = layero.find('input[name=keyword]');
                    var searchUrl = layero.find('#selecthousebyparks').attr('name'),        // 搜索园区\房号url
                        $houseContent = layero.find('.houseContent'),
                        $selectRoom = layero.find('.selectroom'),
                        activeRoomIdArr = [];                                               // 选中的房间或工位

                    form.render(null, 'selectHouseForm');

                    // 编辑
                    if($selectRoomInput.val()) {
                        // 是否有园区下拉列表
                        if($selectParkInput && $selectParkInput.val()) {
                            form.val('selectHouseForm', {parkId: $selectParkInput.val()});
                            var tempSearchParam = {
                                id: $selectParkInput.val(),
                                keyword: '',
                                showinvest: 0
                            };

                            renderForm(tempSearchParam, function () {
                                renderEdit();
                            });
                        } else {
                            // 没有园区列表
                            renderEdit();
                        }
                    }

                    function renderEdit() {
                        activeRoomIdArr = $selectRoomInput.val().split(',');
                        activeRoomIdArr.forEach(function(v, k) {
                            var $o = layero.find('input:checkbox[value='+ v +']');
                            list.push(getListItemParam($o));
                        });
                        renderCheckBoxStatus();
                        $('.selectroom').html($('.allHouseDiv').text());
                    }

                    function renderForm(searchParam, callback) {
                        var reqSearchUrl = Common.Util.getSearchStr(searchUrl, searchParam);

                        Req.getReq(reqSearchUrl, function(res) {
                            if(res.status) {
                                $houseContent.html(res.data.data);
                                $('.selectroom').html('');
                                activeRoomIdArr = [];
                                list = [];
                                form.render(null, 'selectHouseForm');

                                callback && callback();
                            } else {
                                Dialog.errorDialog(res.msg);
                            }
                        })
                    }

                    // 设置checkbox是否选中
                    function renderCheckBoxStatus() {
                        activeRoomIdArr.forEach(function(v, k) {
                            var $o = layero.find('input:checkbox[value='+ v +']');
                            $o.prop('checked', true);
                        });
                        form.render(null, 'selectHouseForm');
                    }

                    function renderSearch(searchParam) {
                        var reqSearchUrl = Common.Util.getSearchStr(searchUrl, searchParam);
                        Req.getReq(reqSearchUrl, function(res) {
                            if(res.status) {
                                $houseContent.html(res.data.data);
                                renderCheckBoxStatus();
                            } else {
                                Dialog.errorDialog(res.msg);
                            }
                        })
                    }

                    function getListItemParam($o) {
                        var buildName = $o.attr('data-build'),
                            buildId = $o.attr('data-build-id'),
                            roomName = $o.attr('data-name'),
                            roomType = $o.attr('data-room-type'),
                            roomId = $o.val(),
                            roomArea = $o.attr('data-room-area'),
                            areaName = $o.attr('data-area-name'),
                            rentUnit = $o.attr('data-rent-unit'),
                            rentUnitStr = $o.attr('data-rent-unit-str'),
                            propertyUnit = $o.attr('data-property-unit'),
                            propertyUnitStr = $o.attr('data-property-unit-str'),
                            basePrice = $o.attr('data-base-price'),
                            propertyPrice = $o.attr('data-property-price');

                        return {
                            buildName: buildName,
                            buildId: buildId,
                            roomName: roomName,
                            roomType: roomType,
                            roomId: roomId,
                            roomArea: roomArea,
                            areaName: areaName,
                            rentUnit: rentUnit,
                            rentUnitStr: rentUnitStr,
                            propertyUnit: propertyUnit,
                            propertyUnitStr: propertyUnitStr,
                            basePrice: basePrice,
                            propertyPrice: propertyPrice
                        }
                    }


                    form.on('select(interest-search)', function(data) {
                        renderForm(getSearchParam());
                    });

                    form.on('checkbox(showinvest)', function (data) {
                        $dialogSearch.trigger('click');
                    });

                    form.on('checkbox(room)', function(data) {

                        if(data.elem.checked) {
                            activeRoomIdArr.push(data.value);
                            list.push(getListItemParam($(data.elem)));
                        } else {
                            var tempIndex = activeRoomIdArr.indexOf(data.value);
                            if(tempIndex != -1) {
                                activeRoomIdArr.splice(tempIndex, 1);
                            }

                            for(var i = 0, len = list.length; i < len; i++) {
                                if(list[i].roomId == data.value) {
                                    list.splice(i, 1);
                                    break;
                                }
                            }
                        }

                        setSelectRoom($selectRoom, list);
                    });

                    function getSearchParam() {
                        var formData = form.val('selectHouseForm');
                        var searchParam = {
                            keyword: formData.keyword
                        };

                        // 园区
                        if(layero.find('select[name=parkId]').length) {
                            searchParam.id = formData.parkId;
                        } else {
                            var o = getSearchParam2(searchUrl);
                            searchParam.id = o.id;
                        }

                        // 只显示可招商房源
                        if(layero.find('input[name=showinvest]').length) {
                            searchParam.showinvest = formData.showinvest ? formData.showinvest : 0;
                        }
                        return searchParam;
                    }

                    // 搜索
                    $dialogSearch.click(function () {
                        renderSearch(getSearchParam());
                    });
                    $keyword.keydown(function (e) {
                        if (e.keyCode == 13) {
                            $dialogSearch.trigger('click');
                        }
                    })

                    changeCb && changeCb(layero);
                },
                yesFn: function(index, layero) {
                    var squarePrice = [],
                        fixedPrice = [],
                        totalArea = 0,
                        roomIds = [];

                    list.forEach(function (item, index) {
                        if(item.rentUnit == '1' || item.rentUnit == '2') {
                            // 按面积
                            squarePrice.push(item);
                        } else {
                            // 一口价
                            fixedPrice.push(item);
                        }
                        roomIds.push(item.roomId);
                        totalArea = Common.Util.accAdd(totalArea, item.roomArea);
                    });

                    var parkId = layero.find('select[name=parkId] option:selected').val(),
                        parkName = layero.find('select[name=parkId] option:selected').text();

                    var data = {
                        parkId: parkId,
                        parkName: parkName,
                        allHouse: layero.find('.selectroom').html(),
                        squarePrice: squarePrice,
                        fixedPrice: fixedPrice,
                        totalArea: totalArea,
                        roomIds: roomIds
                    };

                    callback && callback(data);

                    // 验证是否显示电费单价
                    // checkMeterIsShow(parkId, roomIds);
                    layer.close(index);
                }
            })
        },'html')
    }

    // 是否为精简版
    function isSimplifyV() {
        return typeof simplify != 'undefined' && simplify == '1';
    }

    var Common = {
        selectHouse: selectHouse,
        isSimplifyV: isSimplifyV,
        getHouseDetailHtml: getHouseDetailHtml,
        moveEnd: moveEnd,
        loadWaterMark: loadWaterMark,
        commonPrint: commonPrint,
        getRootDomain: getRootDomain,
        renderAjaxBody: renderAjaxBody,
        leftPad0: left_pad_0,
        isNull: is_null,
        Util: Util
    };

    // 注意，这里是模块输出的核心，模块名必须和use时的模块名一致
    exports('Common', Common);
});