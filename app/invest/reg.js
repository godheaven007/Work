/**
 * 招商-拟签约客户-登记合同
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Regex', 'laydate', 'upload', 'MUpload'], function() {
    var $ = layui.jquery,
        form = layui.form,
        laydate = layui.laydate,
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var Regex = layui.Regex;
    var Dialog = layui.Dialog;
    var MUpload = layui.MUpload;


    function renderDateBox() {
        var $dateBox = $('.datebox');
        $dateBox.each(function (i, o) {
            laydate.render({
                elem: $(o)[0],
                trigger: 'click',
                // showBottom: false
                btns: ['clear', 'now']
            });
        });
    }

    function init() {
        renderDateBox();

        MUpload({
            elem: $('.upload'),
            size: 1024 * 5,
            choose:function(){}
        });
    }

    // 免租期
    function getFreeDateHtml() {
        var _html = '<div class="layui-input-block clearfix mb-10">' +
                        '<div class="dateGroup">' +
                            '<div class="layui-input-inline">' +
                                '<input type="text" class="layui-input test-laydate-item datebox" name="contractFreeBeginDate[]" lay-verify="date" placeholder="yyyy-MM-dd" value="" autocomplete="off">' +
                            '</div>' +
                            '<div class="layui-form-mid">-</div>' +
                            '<div class="layui-input-inline">' +
                                '<input type="text" class="layui-input test-laydate-item datebox" name="contractFreeEndDate[]" lay-verify="date" placeholder="yyyy-MM-dd" value="" autocomplete="off">' +
                            '</div>' +
                            '<div class="layui-form-mid">' +
                                '<a href="javascript:;" class="c-orange delFreeDate" title="删除"><i class="iconfont ibs-ico-deletenorml"></i></a>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
        return _html;
    }

    $(function() {

        init();

        // 租金单价
        $(document).on('blur', '.rentPrice', function() {
            var $o = $(this),
                $target = $o.parent().next().find('.convert'),
                $parent = $o.parent(),
                rentUnit = $o.attr('data-rent-unit'),
                convert = '';
            if(!Regex.onlyDecmal9.reg.test($o.val())) {
                Dialog.errorDialog(Regex.onlyDecmal9.msg);
                return false;
            }
            if(rentUnit == '1') {
                // 日租金->月租金（元/㎡/天 -> 元/㎡/月）
                convert = Common.Util.accDiv(Common.Util.accMul($o.val(), 365), 12).toFixed(2) + '元/㎡/月';
            } else if(rentUnit == '2') {
                // 月租金->日租金（元/㎡/月 -> 元/㎡/天）
                convert = Common.Util.accDiv(Common.Util.accMul($o.val(), 12), 365).toFixed(2) + '元/㎡/天';
            } else {
                // 一口价
                convert = Common.Util.accDiv(Common.Util.accMul($o.val(), 12), 365).toFixed(2) + '元/天';
            }
            $target.text(convert);

            if($parent.find('.convertPrice').length) {
                $parent.find('.convertPrice').val(convert);
            } else {
                $parent.append('<input type="hidden" class="convertPrice" name="convertPrice[]" value="'+ convert +'">');
            }
        });

        // 物业服务费单价
        $(document).on('blur', '.propertyPrice', function() {
            var $o = $(this);
            if(!Regex.onlyDecmal9.reg.test($o.val())) {
                Dialog.errorDialog(Regex.onlyDecmal9.msg);
                return false;
            }
        });

        // 添加免租期
        $(document).on('click', '.addMoreFreeDate', function() {
            $('.moreFreeDate').append(getFreeDateHtml());
            renderDateBox();
        });

        // 删除免租期
        $(document).on('click', '.delFreeDate', function (e) {
            e.stopPropagation();
            $(this).parent().parent().parent().remove();
        });

        // 验证
        form.verify({

        });

        // 免租期验证
        function checkContractFreeDate(freeDateArr) {

            // 时间段重合验证
            if(freeDateArr && freeDateArr.length) {
                var len = freeDateArr.length;
                for(var i = 0; i < len; i++) {
                    for(var j = 0; j < len; j++) {
                        if(i != j) {
                            // 不需要与自身比
                            return checkDateRange(freeDateArr[i], freeDateArr[j]);
                        }
                    }
                }
            }
            return true;
        }

        /**
         * 时间段重合验证
         * @param dur1
         * @param dur2
         * @returns {boolean}
         */
        function checkDateRange(dur1, dur2) {
            var a = dur1.begin,
                b = dur1.end,
                x = dur2.begin,
                y = dur2.end;

            a = new Date(a).getTime();
            b = new Date(b).getTime();
            x = new Date(x).getTime();
            y = new Date(y).getTime();

            if(y < a || b < x) {
                // 不重合
                return true;
            } else {
                // 重合
                return false;
            }
        }

        form.on('submit(regSubmit)', function(data){
            var $form = $('form'),
                url = $(this).attr('data-url'),
                checkUrl = $(this).attr('data-check-url');

            if(!$('.upload-file-item').length) {
                Dialog.errorDialog('请上传客户证件');
                return false;
            }

            // 租期验证
            var $contarctDateStart = $('input[name=contarctDateStart]'),
                $contarctDateEnd = $('input[name=contarctDateEnd]');

            if(!Common.Util.compareDate($contarctDateStart.val(), $contarctDateEnd.val())) {
                Dialog.errorDialog("开始日期不得大于结束日期");
                $contarctDateStart.addClass('layui-form-danger');
                return false;
            }

            // bug16572 合同登记时签约信息的“免租期”与拟签约信息“免租期”对比判断不正确

            var $contractFreeBegins = $('input[name^=contractFreeBeginDate]');
            var freeDateArr = [];
            for(var i = 0, len = $contractFreeBegins.length; i < len; i++) {
                var $curDateGroup = $contractFreeBegins.eq(i).parents('.dateGroup'),
                    $freeBegin = $curDateGroup.find('input[name^=contractFreeBeginDate]'),
                    $freeEnd = $curDateGroup.find('input[name^=contractFreeEndDate]'),
                    begin = $freeBegin.val(),
                    end = $freeEnd.val();

                if((begin && !end)) {
                    Dialog.errorDialog("免租期结束日期未填");
                    $freeEnd.addClass('layui-form-danger');
                    return false;
                }

                if(!begin && end) {
                    Dialog.errorDialog("免租期开始日期未填");
                    $freeBegin.addClass('layui-form-danger');
                    return false;
                }

                if(begin && end) {
                    // 日期比较
                    if(!Common.Util.compareDate(begin, end)) {
                        Dialog.errorDialog("开始日期不得大于结束日期");
                        $freeBegin.addClass('layui-form-danger');
                        return false;
                    }

                    var param = {
                        begin: begin,
                        end: end
                    };

                    freeDateArr.push(param);
                }
            }

            var freeLeaseDay = $('input[name=freeLeaseDay]').val();     // 拟签约信息-免租期
            var sum = 0;
            if(freeDateArr && freeDateArr.length) {
                freeDateArr.forEach(function (item, index) {
                    var beginDate = item.begin;
                    var endDate = item.end;
                    sum += Common.Util.countDateDiff(endDate, beginDate) + 1;
                });
            }
            if(sum > freeLeaseDay) {
                Dialog.errorDialog('签约信息免租期总天数不得大于拟签约免租期天数');
                return false;
            }

            if(checkContractFreeDate(freeDateArr)) {
                var newData = [];
                if(freeDateArr.length) {
                    freeDateArr.forEach(function (item, index) {
                        newData.push(item.begin + '~' + item.end);
                    })
                }
                $('input[name=contractFreePeriod]').val(newData.join('/'));

                Common.Util.replaceSerializeName2($form);
                var param = $form.serializeArray();

                // bug17052
                Req.postReq(checkUrl, param, function (res) {
                    if(res.status) {
                        Req.postReqCommon(url, param);
                    } else {
                        Dialog.confirmDialog({
                            title: '友情提醒',
                            content: res.msg,
                            btn: ['继续', '取消'],
                            yesFn: function () {
                                Req.postReqCommon(url, param);
                            }
                        })
                    }
                });
            } else {
                Dialog.errorDialog("免租期时间段出现重叠，请重新选择");
            }

            return false;
        });
    });
});