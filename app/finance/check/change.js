/**
 * 财务-校核-变更
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


    var financeRentList = [],           // 财务租金
        financePropertyList = [],       // 财务物业费
        paymentRentList = [],           // 运营租金
        paymentPropertyList = [];       // 运营物业费

    function getDefaultObj() {
        return {
            feeType: 'init',
            dateBegin: '',
            dateEnd: '',
            fee: '',
            payFee: ''
        };
    }

    /**
     * 设置运营或财务默认数据
     * @param type 1: 财务租金 2：运营租金  3：财务物业费 4：运营物业费
     * @param size 添加初始化数据条数
     */
    function setDefaultData(type, size) {
        for(var i = 0; i < size; i++) {
            if(type == '1') {
                financeRentList.push(getDefaultObj());
            } else if(type == '2') {
                paymentRentList.push(getDefaultObj());
            } else if(type == '3') {
                financePropertyList.push(getDefaultObj());
            } else if(type == '4') {
                paymentPropertyList.push(getDefaultObj());
            }
        }
    }

    // 运营\财务数据处理
    function dataHandle() {
        financeRentList = JSON.parse($('#collectrentpaymentlist').val());
        financePropertyList = JSON.parse($('#collectpropertypaymentlist').val());
        paymentRentList = JSON.parse($('#rentpaymentlist').val());
        paymentPropertyList = JSON.parse($('#propertypaymentlist').val());

        var rentSize = Math.abs(paymentRentList.length - financeRentList.length),
            propertySize = Math.abs(paymentPropertyList.length - financePropertyList.length);

        if(paymentRentList.length > financeRentList.length) {
            setDefaultData(1, rentSize);
        }
        if(paymentRentList.length < financeRentList.length) {
            setDefaultData(2, rentSize);
        }
        if(paymentPropertyList.length > financePropertyList.length) {
            setDefaultData(3, propertySize);
        }
        if(paymentPropertyList.length < financePropertyList.length) {
            setDefaultData(4, propertySize);
        }

        // 有可能存在租金或物业费都没有的情况，需要默认加一条
        // if((paymentRentList.length == 0) && (financeRentList.length == 0)) {
        //     setDefaultData(1, 1);
        //     setDefaultData(2, 1);
        // }
        //
        // if((paymentPropertyList.length == 0) && (financePropertyList.length == 0)) {
        //     setDefaultData(3, 1);
        //     setDefaultData(4, 1);
        // }

        // 校核渲染
        renderCheckRent();
        renderCheckProperty();

        // console.log(financeRentList, 'financeRentList');
        // console.log(financePropertyList, 'financePropertyList');
        // console.log(paymentRentList, 'paymentRentList');
        // console.log(paymentPropertyList, 'paymentPropertyList');
    }

    /**
     * 校核数据比较(页面初始化用)
     * @param paymentRent   运营数据
     * @param financeRent   财务数据
     * @param type          1：计费周期比较  2：应收租金比较 3：已收金额比较
     */
    function compare(paymentRent, financeRent, type) {
        var paymentDuration = paymentRent.dateBegin + paymentRent.dateEnd,
            financeDuration = financeRent.dateBegin + financeRent.dateEnd;

        var paymentFee = isNaN(parseFloat(paymentRent.fee)) ? 0 : parseFloat(paymentRent.fee),
            financeFee = isNaN(parseFloat(financeRent.fee)) ? 0 : parseFloat(financeRent.fee),
            paymentPayFee = isNaN(parseFloat(paymentRent.payFee)) ? 0 : parseFloat(paymentRent.payFee),
            financePayFee = isNaN(parseFloat(financeRent.payFee)) ? 0 : parseFloat(financeRent.payFee);

        var defalutCls = 'c-gray-light';

        if(type == '1') {
            if(paymentDuration != financeDuration) {
                defalutCls = 'c-red diff';
            }
        } else if(type == '2') {
            if((paymentRent.fee !== financeRent.fee) || Common.Util.accSub(paymentFee, financeFee) != 0) {
                defalutCls = 'c-red diff';
            }
        } else if(type == '3') {
            if((paymentRent.payFee !== financeRent.payFee) || Common.Util.accSub(paymentPayFee, financePayFee) != 0) {
                defalutCls = 'c-red diff';
            }
        }
        return defalutCls;
    }

    /**
     * 输入比较用
     */
    function compare2($curTr, $nextTr) {
        var $compDate = $nextTr.find('td').eq(1).find('span'),      // 计费周期
            $compFee = $nextTr.find('td').eq(2).find('span');       // 应收金额

        var beginDate = $curTr.find('.datebox').eq(0).val(),
            endDate = $curTr.find('.datebox').eq(1).val();

        // 日期上下比对一致，但输入日期格式不正确时，控件会自动填充上次日期，导致日期明明一致却显示红色
        if(!Regex.date.reg.test(beginDate) || !Regex.date.reg.test(endDate)) {
            return false;
        }

        var compDurStr = $compDate.text().replace(/\s+/g,""),
            compDurArr = compDurStr.split('~'),
            compBeginDate = compDurArr[0],
            compEndDate = compDurArr[1];

        var feeStr = $curTr.find('td').eq(2).find('input').val(),
            compFeeStr = $compFee.text().replace(/,/g, '');

        var fee = isNaN(parseFloat(feeStr)) ? feeStr : parseFloat(feeStr),
            compFee = isNaN(parseFloat(compFeeStr)) ? compFeeStr : parseFloat(compFeeStr);

        $compDate.removeClass('c-red diff c-gray-light');
        $compFee.removeClass('c-red diff c-gray-light');

        if((beginDate + endDate) != (compBeginDate + compEndDate)) {
            $compDate.addClass('c-red diff');
        } else {
            $compDate.addClass('c-gray-light');
        }

        if(fee != compFee) {
            $compFee.addClass('c-red diff');
        } else {
            $compFee.addClass('c-gray-light');
        }
    }

    function renderCheckRent() {
        var _html = '',
            len = paymentRentList.length;
        for(var i = 0; i < len; i++) {
            var payItem = paymentRentList[i],
                financeItem = financeRentList[i];

            if(financeItem.feeType == 'init') {
                // 匹配增加
                _html += '<tr class="check-1">' +
                             '<td class="c-gray-light">第<span class="stage_span">'+ (i + 1) +'</span>期</td>' +
                            '<td class="date-2 dateGroup">' +
                                '<div class="layui-input-inline layui-col-xs6">' +
                                    '<input type="text" name="rentBegindate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="">' +
                                '</div>' +
                                '<div class="layui-form-mid"> ~ </div>' +
                                '<div class="layui-input-inline layui-col-xs6">' +
                                    '<input type="text" name="rentEnddate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="">' +
                                '</div>' +
                            '</td>' +
                             '<td>' +
                                '<div class="layui-inline">' +
                                    '<input type="text" class="layui-input rentFee" lay-verify="required|onlyDecmal8Ex0" autocomplete="off" name="rentFee[]" value="">' +
                                '</div>' +
                             '</td>'+
                             '<td>' +
                                '<span>-</span>' +
                                '<input type="hidden" name="rentPayFee[]" value="">' +
                             '</td>' +
                             '<td class="txt-c">' +
                                '<span class="c-red">未收款</span>' +
                                '<input type="hidden" name="rentStatus[]" value="">' +
                             '</td>' +
                             '<td class="txt-c">' +
                                '<a href="javascript:;" class="iconfont ibs-ico-deletenorml font-16 c-blue deleteTr" title="删除" data-type="rent"></a>' +
                                '<a href="javascript:;" class="iconfont ibs-ico-charuhang font-16 c-blue insertTr" title="插入" data-type="rent"></a>' +
                                '<input type="hidden" name="rentPayDate[]" value="">' +
                                '<input type="hidden" name="rentPayDateStr[]" value="">' +
                                '<input type="hidden" value="" name="rentUuid[]">'+
                             '</td>' +
                         '</tr>';
            } else {

                // 计费周期
                var duration = '';
                if (!financeItem.dateBegin || !financeItem.dateEnd) {
                    duration = '';
                } else {
                    duration = financeItem.dateBegin + ' ~ ' + financeItem.dateEnd;
                }


                // 财务
                if (financeItem.status == '1') {
                    if(financeItem.fee == financeItem.payFee) {
                        // 已收款
                        _html += '<tr class="check-1">' +
                            '<td class="c-gray-light">第<span class="stage_span">' + (i + 1) + '</span>期</td>' +
                            '<td>' +
                            '<span>' + financeItem.dateBegin + ' ~ ' + financeItem.dateEnd + '</span>' +
                            '<input type="hidden" name="rentBegindate[]" value="'+ financeItem.dateBegin +'">' +
                            '<input type="hidden" name="rentEnddate[]" value="'+ financeItem.dateEnd +'">' +
                            '</td>' +
                            '<td>' +
                            '<span>' + financeItem.fee + '</span>' +
                            '<input type="hidden" class="layui-input rentFee" name="rentFee[]" value="' + financeItem.fee + '">' +
                            '</td>' +
                            '<td>' +
                            '<span>' + financeItem.payFee + '</span>' +
                            '<input type="hidden" name="rentPayFee[]" value="' + financeItem.payFee + '">' +
                            '</td>' +
                            '<td class="txt-c">' +
                            '<span>已收款 √</span>' +
                            '<br>' +
                            '<span class="font-12">' + financeItem.payDateStr + '</span>' +
                            '<input type="hidden" name="rentStatus[]" value="' + financeItem.status + '">' +
                            '</td>' +
                            '<td class="txt-c">' +
                            '<input type="hidden" name="rentPayDate[]" value="' + (!financeItem.payDate ? '' : financeItem.payDate) + '">' +
                            '<input type="hidden" name="rentPayDateStr[]" value="' + (!financeItem.payDateStr ? '' : financeItem.payDateStr) + '">' +
                            '<input type="hidden" name="rentUuid[]" value="' + (!financeItem.uuId ? '' : financeItem.uuId) + '">' +
                            '</td>' +
                            '</tr>';
                    } else {
                        // 未结清
                        _html += '<tr class="check-1">' +
                            '<td class="c-gray-light">第<span class="stage_span">' + (i + 1) + '</span>期</td>' +
                            '<td class="date-2 dateGroup">' +
                                '<div class="layui-input-inline layui-col-xs6">' +
                                    '<input type="text" name="rentBegindate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="'+ financeItem.dateBegin +'">' +
                                '</div>' +
                                '<div class="layui-form-mid"> ~ </div>' +
                                '<div class="layui-input-inline layui-col-xs6">' +
                                    '<input type="text" name="rentEnddate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="'+ financeItem.dateEnd +'">' +
                                '</div>' +
                            '</td>' +
                            '<td>' +
                            '<div class="layui-inline">' +
                            '<input type="text" class="layui-input rentFee" lay-verify="required|onlyDecmal8Ex0" autocomplete="off" name="rentFee[]" value="' + financeItem.fee + '">' +
                            '</div>' +
                            '</td>' +
                            '<td>' +
                            '<span>' + financeItem.payFee + '</span>' +
                            '<input type="hidden" name="rentPayFee[]" value="' + financeItem.payFee + '">' +
                            '</td>' +
                            '<td class="txt-c">' +
                            '<span class="c-red">未结清</span>' +
                            '<input type="hidden" name="rentStatus[]" value="' + financeItem.status + '">' +
                            '</td>' +
                            '<td class="txt-c">' +
                            '<a href="javascript:;" class="iconfont ibs-ico-charuhang font-16 c-blue insertTr" title="插入" data-type="rent"></a>' +
                            '<input type="hidden" name="rentPayDate[]" value="' + (!financeItem.payDate ? '' : financeItem.payDate) + '">' +
                            '<input type="hidden" name="rentPayDateStr[]" value="' + (!financeItem.payDateStr ? '' : financeItem.payDateStr) + '">' +
                            '<input type="hidden" name="rentUuid[]" value="' + (!financeItem.uuId ? '' : financeItem.uuId) + '">' +
                            '</td>' +
                            '</tr>';
                    }
                } else {
                    // 未收款
                    _html += '<tr class="check-1">' +
                        '<td class="c-gray-light">第<span class="stage_span">' + (i + 1) + '</span>期</td>' +
                        '<td class="date-2 dateGroup">' +
                            '<div class="layui-input-inline layui-col-xs6">' +
                                '<input type="text" name="rentBegindate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="'+ financeItem.dateBegin +'">' +
                            '</div>' +
                            '<div class="layui-form-mid"> ~ </div>' +
                            '<div class="layui-input-inline layui-col-xs6">' +
                                '<input type="text" name="rentEnddate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="'+ financeItem.dateEnd +'">' +
                            '</div>' +
                        '</td>' +
                        '<td>' +
                        '<div class="layui-inline">' +
                        '<input type="text" class="layui-input rentFee" lay-verify="required|onlyDecmal8Ex0" name="rentFee[]" autocomplete="off" value="' + financeItem.fee + '">' +
                        '</div>' +
                        '</td>' +
                        '<td>' +
                            '<span>' + financeItem.payFee + '</span>' +
                            '<input type="hidden" name="rentPayFee[]" value="' + financeItem.payFee + '">' +
                        '</td>' +
                        '<td class="txt-c">' +
                            '<span class="c-red">未收款</span>' +
                            '<input type="hidden" name="rentStatus[]" value="' + financeItem.status + '">' +
                        '</td>' +
                        '<td class="txt-c">' +
                            '<a href="javascript:;" class="iconfont ibs-ico-deletenorml font-16 c-blue deleteTr" title="删除" data-type="rent"></a>' +
                            '<a href="javascript:;" class="iconfont ibs-ico-charuhang font-16 c-blue insertTr" title="插入" data-type="rent"></a>' +
                            '<input type="hidden" name="rentPayDate[]" value="' + (!financeItem.payDate ? '' : financeItem.payDate) + '">' +
                            '<input type="hidden" name="rentPayDateStr[]" value="' + (!financeItem.payDateStr ? '' : financeItem.payDateStr) + '">' +
                            '<input type="hidden" name="rentUuid[]" value="' + (!financeItem.uuId ? '' : financeItem.uuId) + '">' +
                        '</td>' +
                        '</tr>';
                }
            }

            // 业务提交（运营）
            if(financeItem.status == '1') {
                if(financeItem.fee != financeItem.payFee) {
                    // 未结清
                    var tempDateStr = '-';
                    if(payItem.dateBegin && payItem.dateEnd) {
                        tempDateStr = payItem.dateBegin + ' ~ ' + payItem.dateEnd;
                    }
                    _html +=
                        '<tr class="check-2">' +
                        '<td><span class="c-gray-light">业务提交</span></td>' +
                        '<td><span class="'+ compare(payItem, financeItem, 1) +'">'+ tempDateStr +'</span></td>' +
                        '<td><span class="'+ compare(payItem, financeItem, 2) +'">'+ (Common.isNull(payItem.fee) ? '-' : payItem.fee) +'</span></td>' +
                        '<td><span class="'+ compare(payItem, financeItem, 3) +'">'+ (Common.isNull(payItem.payFee) ? '-' : payItem.payFee) +'</span></td>'+
                        '<td></td>'+
                        '<td></td>' +
                        '</tr>';
                }
            } else {
                // 未收款或financeItem.status == 'undefined'
                var tempDateStr = '-';
                if(payItem.dateBegin && payItem.dateEnd) {
                    tempDateStr = payItem.dateBegin + ' ~ ' + payItem.dateEnd;
                }
                _html +=
                    '<tr class="check-2">' +
                    '<td><span class="c-gray-light">业务提交</span></td>' +
                    '<td><span class="'+ compare(payItem, financeItem, 1) +'">'+ tempDateStr +'</span></td>' +
                    '<td><span class="'+ compare(payItem, financeItem, 2) +'">'+ (Common.isNull(payItem.fee) ? '-' : payItem.fee) +'</span></td>' +
                    '<td><span class="'+ compare(payItem, financeItem, 3) +'">'+ (Common.isNull(payItem.payFee) ? '-' : payItem.payFee) +'</span></td>'+
                    '<td></td>'+
                    '<td></td>' +
                    '</tr>';
            }
        }

        if(len) {
            $('.changerentTbody').html(_html);
        } else {
            $('.changerentTbody').html('<tr class="check-1"><td colspan="6" class="txt-c"><span class="mr-5">暂无收费计划</span><a href="javascript:;" class="c-link insertTr insertOneTr" data-type="rent">添加1行</a></td></tr>');
        }

        updateRentOrPorperty($('.changerentTbody').parent('table'), 'rent');
        updateTotalAmount();
    }

    function renderCheckProperty() {
        var _html = '',
            len = paymentPropertyList.length;
        for(var i = 0; i < len; i++) {
            var payItem = paymentPropertyList[i],
                financeItem = financePropertyList[i];

            if(financeItem.feeType == 'init') {
                // 匹配增加
                _html += '<tr class="check-1">' +
                            '<td class="c-gray-light">第<span class="stage_span">'+ (i + 1) +'</span>期</td>' +
                            '<td class="date-2 dateGroup">' +
                                '<div class="layui-input-inline layui-col-xs6">' +
                                    '<input type="text" name="propertyBegindate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="">' +
                                '</div>' +
                                '<div class="layui-form-mid"> ~ </div>' +
                                '<div class="layui-input-inline layui-col-xs6">' +
                                    '<input type="text" name="propertyEnddate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="">' +
                                '</div>' +
                            '</td>' +
                            '<td>' +
                                '<div class="layui-inline">' +
                                    '<input type="text" class="layui-input propertyFee" lay-verify="required|onlyDecmal8Ex0" autocomplete="off" name="propertyFee[]" value="">' +
                                '</div>' +
                            '</td>'+
                            '<td>' +
                                '<span>-</span>' +
                                '<input type="hidden" name="propertyPayFee[]" value="">' +
                            '</td>' +
                            '<td class="txt-c">' +
                                '<span class="c-red">未收款</span>' +
                                '<input type="hidden" name="propertyStatus[]" value="">' +
                            '</td>' +
                            '<td class="txt-c">' +
                                '<a href="javascript:;" class="iconfont ibs-ico-deletenorml font-16 c-blue deleteTr" title="删除" data-type="property"></a>' +
                                '<a href="javascript:;" class="iconfont ibs-ico-charuhang font-16 c-blue insertTr" title="插入" data-type="property"></a>' +
                                '<input type="hidden" name="propertyPayDate[]" value="">' +
                                '<input type="hidden" name="propertyPayDateStr[]" value="">' +
                                '<input type="hidden" value="" name="propertyUuid[]">'+
                            '</td>' +
                    '</tr>';
            } else {

                // 计费周期
                var duration = '';
                if (!financeItem.dateBegin || !financeItem.dateEnd) {
                    duration = '';
                } else {
                    duration = financeItem.dateBegin + ' ~ ' + financeItem.dateEnd;
                }

                // 财务

                if(financeItem.status == '1') {
                    if (financeItem.fee == financeItem.payFee) {
                        // 已收款
                        _html += '<tr class="check-1">' +
                            '<td class="c-gray-light">第<span class="stage_span">' + (i + 1) + '</span>期</td>' +
                            '<td>' +
                                '<span>' + financeItem.dateBegin + ' ~ ' + financeItem.dateEnd + '</span>' +
                                '<input type="hidden" name="propertyBegindate[]" value="'+ financeItem.dateBegin +'">' +
                                '<input type="hidden" name="propertyEnddate[]" value="'+ financeItem.dateEnd +'">' +
                            '</td>' +
                            '<td>' +
                            '<span>' + financeItem.fee + '</span>' +
                            '<input type="hidden" class="layui-input propertyFee" name="propertyFee[]" value="' + financeItem.fee + '">' +
                            '</td>' +
                            '<td>' +
                            '<span>' + financeItem.payFee + '</span>' +
                            '<input type="hidden" name="propertyPayFee[]" value="' + financeItem.payFee + '">' +
                            '</td>' +
                            '<td class="txt-c">' +
                            '<span>已收款 √</span>' +
                            '<br>' +
                            '<span class="font-12">' + financeItem.payDateStr + '</span>' +
                            '<input type="hidden" name="propertyStatus[]" value="' + financeItem.status + '">' +
                            '</td>' +
                            '<td class="txt-c">' +
                            '<input type="hidden" name="propertyPayDate[]" value="' + (!financeItem.payDate ? '' : financeItem.payDate) + '">' +
                            '<input type="hidden" name="propertyPayDateStr[]" value="' + (!financeItem.payDateStr ? '' : financeItem.payDateStr) + '">' +
                            '<input type="hidden" name="propertyUuid[]" value="' + (!financeItem.uuId ? '' : financeItem.uuId) + '">' +
                            '</td>' +
                            '</tr>';
                    } else {
                        // 未结清
                        _html += '<tr class="check-1">' +
                            '<td class="c-gray-light">第<span class="stage_span">' + (i + 1) + '</span>期</td>' +
                            '<td class="date-2 dateGroup">' +
                                '<div class="layui-input-inline layui-col-xs6">' +
                                    '<input type="text" name="propertyBegindate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="'+ financeItem.dateBegin +'">' +
                                '</div>' +
                                '<div class="layui-form-mid"> ~ </div>' +
                                '<div class="layui-input-inline layui-col-xs6">' +
                                    '<input type="text" name="propertyEnddate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="'+ financeItem.dateEnd +'">' +
                                '</div>' +
                            '</td>' +
                            '<td>' +
                            '<div class="layui-inline">' +
                            '<input type="text" class="layui-input propertyFee" lay-verify="required|onlyDecmal8Ex0" autocomplete="off" name="propertyFee[]" value="' + financeItem.fee + '">' +
                            '</div>' +
                            '</td>' +
                            '<td>' +
                            '<span>' + financeItem.payFee + '</span>' +
                            '<input type="hidden" name="propertyPayFee[]" value="' + financeItem.payFee + '">' +
                            '</td>' +
                            '<td class="txt-c">' +
                            '<span class="c-red">未结清</span>' +
                            '<input type="hidden" name="propertyStatus[]" value="' + financeItem.status + '">' +
                            '</td>' +
                            '<td class="txt-c">' +
                            '<a href="javascript:;" class="iconfont ibs-ico-charuhang font-16 c-blue insertTr" title="插入" data-type="property"></a>' +
                            '<input type="hidden" name="propertyPayDate[]" value="' + (!financeItem.payDate ? '' : financeItem.payDate) + '">' +
                            '<input type="hidden" name="propertyPayDateStr[]" value="' + (!financeItem.payDateStr ? '' : financeItem.payDateStr) + '">' +
                            '<input type="hidden" name="propertyUuid[]" value="' + (!financeItem.uuId ? '' : financeItem.uuId) + '">' +
                            '</td>' +
                            '</tr>';
                    }
                } else {
                    // 未收款
                    _html += '<tr class="check-1">' +
                        '<td class="c-gray-light">第<span class="stage_span">' + (i + 1) + '</span>期</td>' +
                        '<td class="date-2 dateGroup">' +
                            '<div class="layui-input-inline layui-col-xs6">' +
                                '<input type="text" name="propertyBegindate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="'+ financeItem.dateBegin +'">' +
                            '</div>' +
                            '<div class="layui-form-mid"> ~ </div>' +
                            '<div class="layui-input-inline layui-col-xs6">' +
                                '<input type="text" name="propertyEnddate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="'+ financeItem.dateEnd +'">' +
                            '</div>' +
                        '</td>' +
                        '<td>' +
                        '<div class="layui-inline">' +
                        '<input type="text" class="layui-input propertyFee" lay-verify="required|onlyDecmal8Ex0" autocomplete="off" name="propertyFee[]" value="' + financeItem.fee + '">' +
                        '</div>' +
                        '</td>' +
                        '<td>' +
                        '<span>' + financeItem.payFee + '</span>' +
                        '<input type="hidden" name="propertyPayFee[]" value="' + financeItem.payFee + '">' +
                        '</td>' +
                        '<td class="txt-c">' +
                        '<span class="c-red">未收款</span>' +
                        '<input type="hidden" name="propertyStatus[]" value="' + financeItem.status + '">' +
                        '</td>' +
                        '<td class="txt-c">' +
                        '<a href="javascript:;" class="iconfont ibs-ico-deletenorml font-16 c-blue deleteTr" title="删除" data-type="property"></a>' +
                        '<a href="javascript:;" class="iconfont ibs-ico-charuhang font-16 c-blue insertTr" title="插入" data-type="property"></a>' +
                        '<input type="hidden" name="propertyPayDate[]" value="' + (!financeItem.payDate ? '' : financeItem.payDate) + '">' +
                        '<input type="hidden" name="propertyPayDateStr[]" value="' + (!financeItem.payDateStr ? '' : financeItem.payDateStr) + '">' +
                        '<input type="hidden" name="propertyUuid[]" value="' + (!financeItem.uuId ? '' : financeItem.uuId) + '">' +
                        '</td>' +
                        '</tr>';
                }
            }

            // 业务提交（运营）
            if(financeItem.status == '1') {
                if (financeItem.fee != financeItem.payFee) {
                    // 未结清
                    var tempDateStr = '-';
                    if(payItem.dateBegin && payItem.dateEnd) {
                        tempDateStr = payItem.dateBegin + ' ~ ' + payItem.dateEnd;
                    }
                    _html +=
                        '<tr class="check-2">' +
                        '<td><span class="c-gray-light">业务提交</span></td>' +
                        '<td><span class="'+ compare(payItem, financeItem, 1) +'">'+  tempDateStr +'</span></td>' +
                        '<td><span class="'+ compare(payItem, financeItem, 2) +'">'+ (Common.isNull(payItem.fee) ? '-' : payItem.fee) +'</span></td>' +
                        '<td><span class="'+ compare(payItem, financeItem, 3) +'">'+ (Common.isNull(payItem.payFee) ? '-' : payItem.payFee) +'</span></td>'+
                        '<td></td>' +
                        '<td></td>' +
                        '</tr>';
                }
            } else {
                // 未收款或financeItem.status == 'undefined'
                var tempDateStr = '-';
                if(payItem.dateBegin && payItem.dateEnd) {
                    tempDateStr = payItem.dateBegin + ' ~ ' + payItem.dateEnd;
                }
                _html +=
                    '<tr class="check-2">' +
                    '<td><span class="c-gray-light">业务提交</span></td>' +
                    '<td><span class="'+ compare(payItem, financeItem, 1) +'">'+ tempDateStr +'</span></td>' +
                    '<td><span class="'+ compare(payItem, financeItem, 2) +'">'+ (Common.isNull(payItem.fee) ? '-' : payItem.fee) +'</span></td>' +
                    '<td><span class="'+ compare(payItem, financeItem, 3) +'">'+ (Common.isNull(payItem.payFee) ? '-' : payItem.payFee) +'</span></td>'+
                    '<td></td>' +
                    '<td></td>' +
                    '</tr>';
            }
        }

        if(len) {
            $('.propertyTbody').html(_html);
        } else {
            $('.propertyTbody').html('<tr class="check-1"><td colspan="6" class="txt-c"><span class="mr-5">暂无收费计划</span><a href="javascript:;" class="c-link insertTr insertOneTr" data-type="property">添加1行</a></td></tr>');
        }

        updateRentOrPorperty($('.propertyTbody').parent('table'), 'property');
        updateTotalAmount();
    }

    function init() {
        if($('#collectrentpaymentlist').length) {
            // 校核
            dataHandle();
        }
        renderDatebox();
        renderDatebox2();
        MUpload({
            elem: $('.upload'),
            size: 1024 * 5,
            choose:function(){},
        });
    }

    function renderDatebox() {
        lay('.datebox').each(function(index, o){
            laydate.render({
                elem: this,
                trigger: 'click',
                // showBottom: false,
                btns: ['clear', 'now'],
                done: function () {
                    $(o).change();
                }
            });
        });
    }

    function renderDatebox2() {
        lay('.datebox2').each(function(){
            laydate.render({
                elem: this,
                trigger: 'click',
                range: '~',
                done: function () {
                    if($('#collectrentpaymentlist').length) {
                        var $curTr = $(this.elem).parents('.check-1'),
                            $nextTr = $curTr.next();
                        setTimeout(function() {
                            compare2($curTr, $nextTr);
                        },10);
                    }
                }
            });
        });
    }

    // 租金收费计划\物业服务费收费计划插入
    function getRowHtml(type) {
        var _html = '';
        if(type == 'rent') {
            _html += '<tr class="check-1">' +
                        '<td class="c-gray-light">第<span class="stage_span"></span>期</td>' +
                        '<td class="date-2 dateGroup">' +
                            '<div class="layui-input-inline layui-col-xs6">' +
                                '<input type="text" name="rentBegindate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="">' +
                            '</div>' +
                            '<div class="layui-form-mid"> ~ </div>' +
                            '<div class="layui-input-inline layui-col-xs6">' +
                                '<input type="text" name="rentEnddate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="">' +
                            '</div>' +
                        '</td>' +
                        '<td>' +
                            '<div class="layui-inline">' +
                                '<input type="text" class="layui-input rentFee" lay-verify="required|onlyDecmal8Ex0" autocomplete="off" name="rentFee[]" value="">' +
                            '</div>' +
                        '</td>' +
                        '<td>-' +
                            '<input type="hidden" name="rentPayFee[]" value="">' +
                        '</td>' +
                        '<td class="txt-c">' +
                            '<span class="c-red">未收款</span>' +
                            '<input type="hidden" name="rentStatus[]" value="">'+
                        '</td>' +
                        '<td class="txt-c">' +
                            '<a href="javascript:;" class="iconfont ibs-ico-deletenorml font-16 c-blue deleteTr" title="删除" data-type="rent"></a>' +
                            '<a href="javascript:;" class="iconfont ibs-ico-charuhang font-16 c-blue insertTr" title="插入" data-type="rent"></a>' +
                            '<input type="hidden" name="rentPayDate[]" value="">' +
                            '<input type="hidden" name="rentPayDateStr[]" value="">' +
                            '<input type="hidden" value="" name="rentUuid[]">'+
                        '</td>' +
                     '</tr>';
            if($('#collectrentpaymentlist').length) {
                // 业务提交
                _html += '<tr class="check-2">' +
                    '<td><span class="c-gray-light">业务提交</span></td>' +
                    '<td><span class="c-red">-</span></td>' +
                    '<td><span class="c-red">-</span></td>' +
                    '<td><span class="c-red">-</span></td>' +
                    '<td></td>' +
                    '<td></td>' +
                    '</tr>';
            }
        } else if(type == 'property') {
            _html += '<tr class="check-1">' +
                        '<td class="c-gray-light">第<span class="stage_span"></span>期</td>' +
                        '<td class="date-2 dateGroup">' +
                            '<div class="layui-input-inline layui-col-xs6">' +
                                '<input type="text" name="propertyBegindate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="">' +
                            '</div>' +
                            '<div class="layui-form-mid"> ~ </div>' +
                            '<div class="layui-input-inline layui-col-xs6">' +
                                '<input type="text" name="propertyEnddate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="">' +
                            '</div>' +
                        '</td>' +
                        '<td>' +
                            '<div class="layui-inline">' +
                                '<input type="text" class="layui-input propertyFee" lay-verify="required|onlyDecmal8Ex0" autocomplete="off" name="propertyFee[]" value="">' +
                            '</div>' +
                        '</td>' +
                        '<td>-' +
                            '<input type="hidden" name="propertyPayFee[]" value="">' +
                        '</td>' +
                        '<td class="txt-c">' +
                            '<span class="c-red">未收款</span>' +
                            '<input type="hidden" name="propertyStatus[]" value="">'+
                        '</td>' +
                        '<td class="txt-c">' +
                            '<a href="javascript:;" class="iconfont ibs-ico-deletenorml font-16 c-blue deleteTr" title="删除" data-type="property"></a>' +
                            '<a href="javascript:;" class="iconfont ibs-ico-charuhang font-16 c-blue insertTr" title="插入" data-type="property"></a>' +
                            '<input type="hidden" name="propertyPayDate[]" value="">' +
                            '<input type="hidden" name="propertyPayDateStr[]" value="">' +
                            '<input type="hidden" value="" name="propertyUuid[]">'+
                        '</td>' +
                     '</tr>';
            if($('#collectrentpaymentlist').length) {
                // 业务提交
                _html += '<tr class="check-2">' +
                    '<td><span class="c-gray-light">业务提交</span></td>' +
                    '<td><span class="c-red">-</span></td>' +
                    '<td><span class="c-red">-</span></td>' +
                    '<td><span class="c-red">-</span></td>' +
                    '<td></td>' +
                    '<td></td>' +
                    '</tr>';
            }
        }
        return _html;
    }

    function insertRow($curTr, type) {
        if($('#collectrentpaymentlist').length) {
            // 校核
            if($curTr.find('.insertOneTr').length) {
                $curTr.after(getRowHtml(type));
            } else {
                $curTr.next().after(getRowHtml(type));
            }
        } else {
            $curTr.after(getRowHtml(type));
        }
    }

    // 期数更新(校核)
    function updatePeriod($curTable) {
        var $trs = $curTable.find('.check-1');
        $trs.each(function(i, o) {
            $(o).find('td').eq(0).find(".stage_span").text(i + 1);
        })
    }

    // 应收租金\应收物业服务费更新（校核）
    function updateRentOrPorperty($curTable, type) {
        var $trs = $curTable.find('.check-1');
        var sum = 0;
        $trs.each(function (i, o) {
            var fee = $(o).find('td').eq(2).find('input').val();
            if(isNaN(parseFloat(fee))) {
                fee = 0;
            } else {
                fee = parseFloat(fee);
            }
            sum = Common.Util.accAdd(sum, fee);
        });

        if(type == 'rent') {
            $curTable.find('.totalRent').text(sum.toFixed(2));
            $('.contactRent').text(sum.toFixed(2));
            $('#totalRent').val(sum);
        } else if(type == 'property') {
            $curTable.find('.totalProperty').text(sum.toFixed(2));
            $('.contactProperty').text(sum.toFixed(2));
            $('#totalProperty').val(sum);
        }
    }

    // 合同总金额更新
    function updateTotalAmount() {
        var contactBond = parseFloat($('.contactBond').text().replace(/,/g, '')),
            // contactBond = parseFloat($('input[name=newbond]').val()),

            contactRent = parseFloat($('.contactRent').text().replace(/,/g, '')),
            contactProperty = parseFloat($('.contactProperty').text().replace(/,/g, ''));
        var r1 = Common.Util.accAdd(contactRent, contactBond);
        var r2 = Common.Util.accAdd(contactProperty, r1);
        var result = parseFloat(r2).toFixed(2);
        $('.contactTotal').text(result);
        $('#totalAmount').val(parseFloat(r2));
    }

    function getBackSubmitDialogHtml() {
        var _html = '<div class="layui-card-body">' +
            '<form class="layui-form" action="" lay-filter="formDialog">' +
            '<div class="layui-form-item">' +
            '<label class="layui-form-label">退回原因</label>' +
            '<div class="layui-input-block">' +
            '<textarea placeholder="请描述校核退回的具体原因" lay-verify="required" maxlength="500" lay-reqText="请描述校核退回的具体原因" class="layui-textarea" name="reason"></textarea>' +
            '</div>' +
            '</div>' +
            '<!--写一个隐藏的btn -->' +
            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
            '</button>' +
            '</form>' +
            '</div>';
        return _html;
    }


    $(function() {
        init();

        // 删除
        $(document).on('click', '.deleteTr', function () {
            var $o = $(this),
                $curTr = $o.parents('.check-1'),
                $nextTr = $curTr.next(),
                $curTable = $o.parents('table'),
                $tbody = $curTable.find('tbody'),
                $curBatchAppendTr = $curTable.find('.batchAppendTr'),
                type = $o.attr('data-type'),
                $trs = $curTable.find('.check-1');

            // if($curTable.find('.deleteTr').length == 1) {
            //     Dialog.errorDialog('至少保留一行');
            //     return false;
            // }

            if($('#collectrentpaymentlist').length) {
                // 校核
                $curTr.remove();
                $nextTr.remove();
            } else {
                $curTr.remove();
            }

            if(!$curTable.find('.insertTr').length) {
                // 删除所有行之后
                var hasPlanHtml = '';
                if(!$tbody.find('.check-1').length) {
                    hasPlanHtml = '<span class="mr-5">暂无收费计划</span>';
                }
                var html = '<tr class="check-1">' +
                    '<td colspan="6" class="txt-c">'+ hasPlanHtml +'<a href="javascript:;" class="c-link insertTr insertOneTr" data-type="'+ type +'">添加1行</a></td>' +
                    '</tr>';
                if($curBatchAppendTr.length) {
                    // 存在批量追加
                    $curBatchAppendTr.before(html);
                } else {
                    $tbody.append(html);
                }
            }

            updatePeriod($curTable);
            updateRentOrPorperty($curTable, type);
            updateTotalAmount();
        });

        $(document).on('click', '.insertTr', function () {
            var $o = $(this),
                $curTr = $o.parents('.check-1'),
                $curTable = $o.parents('table'),
                type = $o.attr('data-type');
            insertRow($curTr, type);

            if($o.hasClass('insertOneTr')) {
                $curTr.remove();
            }

            updatePeriod($curTable);
            updateRentOrPorperty($curTable, type);
            updateTotalAmount();
            renderDatebox();
        });

        $(document).on('change', '.rentFee,.propertyFee', function() {
            var $o = $(this),
                $curTable = $o.parents('table'),
                $curTr = $o.parents('.check-1'),
                $nextTr = $curTr.next(),
                type = 'rent';
            if($o.hasClass('propertyFee')) {
                type = 'property';
            }
            updateRentOrPorperty($curTable, type);
            updateTotalAmount();

            if($('#collectrentpaymentlist').length) {
                // 校核
                compare2($curTr, $nextTr);
            }
        });

        $(document).on('change', 'input[name^=rentBegindate], input[name^=rentEnddate], input[name^=propertyBegindate], input[name^=propertyEnddate]', function() {
            var $o = $(this),
                name = $o.attr('name'),
                $curTr = $o.parents('.check-1'),
                $nextTr = $curTr.next();

            var $curTbody = $o.parents('tbody'),
                $check1s = $curTbody.find('.check-1'),
                curIndex = $check1s.index($curTr);          // 当前check1所处的索引
            var $nextCheck1Tr = $check1s.eq(curIndex + 1),
                $curTrEndDate = $curTr.find('.datebox').eq(1);

            if($('#collectrentpaymentlist').length) {
                // 校核
                compare2($curTr, $nextTr);
            }

            if($nextCheck1Tr.length &&
                ((name.indexOf('rentEnddate') != -1) || (name.indexOf('propertyEnddate') != -1))
            ) {
                var $beginDate = $nextCheck1Tr.find('.datebox').eq(0);
                if(!$beginDate.val()) {
                    $beginDate.val(Common.Util.getNextDate($curTrEndDate.val(), 1));
                }
            }

        });

        // 调整后的应收账款金额不能小于已到账的金额
        function checkRentAmount() {
            var flag = true;
            var $trs = $('.layui-table').eq(0).find('tbody tr').not('.check-2');
            $trs.each(function (i, o) {
                var $curTr = $(o);

                // 未结清
                var rentFee = parseFloat($curTr.find('input[name^="rentFee"]').val()),
                    rentPayFee = $curTr.find('input[name^="rentPayFee"]').val();

                if(rentPayFee) {
                    rentPayFee = parseFloat(rentPayFee);
                    if(rentFee < rentPayFee) {
                        Dialog.errorDialog('调整后的应收账款金额不能小于已到账的金额');
                        flag = false;

                        return false;
                    }
                }
            });

            if(flag) {
                var $trs2 = $('.layui-table').eq(1).find('tbody tr').not('.check-2');
                $trs2.each(function (i, o) {
                    var $curTr = $(o);

                    // 未结清
                    var fee = parseFloat($curTr.find('input[name^="propertyFee"]').val()),
                        payFee = $curTr.find('input[name^="propertyPayFee"]').val();

                    if(payFee) {
                        payFee = parseFloat(payFee);
                        if(fee < payFee) {
                            Dialog.errorDialog('调整后的应收账款金额不能小于已到账的金额');
                            flag = false;

                            return false;
                        }
                    }
                });
            }
            return flag;
        }

        // 计费周期开始-结束日期校验
        function checkPlanDate() {
            var flag = true;
            var $dateBar = $('.dateGroup');

            $dateBar.each(function (i, o) {
                var $o = $(o);
                var $beginDate = $o.find('.datebox').eq(0),
                    $endDate = $o.find('.datebox').eq(1);
                if(!Common.Util.compareDate($beginDate.val(), $endDate.val())) {
                    Dialog.errorDialog("计费周期开始日期不得大于结束日期");
                    $beginDate.addClass('layui-form-danger').focus();
                    flag = false;
                    return false;
                }
            });

            return flag;
        }

        // 完成校核
        form.on('submit(checkComplete)', function (data) {
            var unpassUrl = $('#checkComplete').attr('data-unpass-url'),
                url = $('#checkComplete').attr('data-url'),
                $form = $('form');

            Common.Util.replaceSerializeName2($form);
            var param = $form.serializeArray();

            if(!checkPlanDate()) {
                return false;
            }

            if(!checkRentAmount()) {
                return false;
            }

            // 保证金
            if(typeof(applyBond)!= 'undefined'){
                var applyBondStr = JSON.stringify(applyBond);
                param.push({name: "applyBond", value: applyBondStr});

                var applyBond_diffStr = JSON.stringify(applyBond_diff);
                param.push({name: "applyBond_diff", value: applyBond_diffStr});
            }

            Req.postReq(url, param, function (res) {
                if(res.status) {
                    // 正常提交
                    Dialog.successDialogByTime('合同校核通过，相关收款计划已生效。', 3000, function() {
                        if(res.data.url) {
                            window.location.href = res.data.url;
                        } else {
                            window.location.reload();
                        }
                    });
                } else {
                    if(!res.msg) {
                        Dialog.confirmDialog({
                            title: '校核确认',
                            btn: ['继续提交', '取消'],
                            content: '所填信息与业务提交的数据不一致，确定要继续提交吗？',
                            yesFn: function(index, layero) {
                                Req.postReqCommon(unpassUrl, param);
                            }
                        });
                    } else {
                        Dialog.errorDialog(res.msg);
                    }
                }
            });
            return false;
        });

        // 暂存
        form.on('submit(checkSubmit)', function (data) {
            var url = $('#checkSubmit').attr('data-url'),
                $form = $('form');

            Common.Util.replaceSerializeName2($form);
            var param = $form.serializeArray();

            if(!checkPlanDate()) {
                return false;
            }

            if(!checkRentAmount()) {
                return false;
            }

            // 保证金
            if(typeof(applyBond)!= 'undefined'){
                var applyBondStr = JSON.stringify(applyBond);
                param.push({name: "applyBond", value: applyBondStr});

                var applyBond_diffStr = JSON.stringify(applyBond_diff);
                param.push({name: "applyBond_diff", value: applyBond_diffStr});
            }

            Req.postReqCommon(url, param);
            return false;
        });

        // 确认通过
        form.on('submit(passCompanySubmit)', function (data) {
            var $elem = $(data.elem),
                url = $elem.attr('data-url');
            var $form = $('form'),
                param = $form.serializeArray();

            param.push({name: 'applyBond', value: JSON.stringify(applyBond)});
            param.push({name: 'applyBond_diff', value: JSON.stringify(applyBond_diff)});
            param.push({name: 'cps', value: JSON.stringify(cps)});
            param.push({name: 'applyCps', value: JSON.stringify(applyCps)});

            Req.postReqCommon(url, param);
        });


        // 确认通过
        $(document).on('click', '.passSubmit', function() {
            var url = $(this).attr('data-url'),
                $form = $('form');

            Common.Util.replaceSerializeName2($form);
            var param = $form.serializeArray();

            var applyCpsStr = JSON.stringify(applyCps);

            param.push({name: "applyCps", value: applyCpsStr});
            //add by huang 2019/12/05
            if(typeof(applyBond)!='undefined')
            {
                var applyBondStr = JSON.stringify(applyBond);
                param.push({name: "applyBond", value: applyBondStr});

                var applyBond_diffStr = JSON.stringify(applyBond_diff);
                param.push({name: "applyBond_diff", value: applyBond_diffStr});
            }
            //end

            Dialog.confirmDialog({
                title: '财务校核确认',
                content: '请仔细核对业务人员<span style="color:#f00;">所填收费计划与实际合同的收费计划是否一致</span>,确定要继续提交吗？',
                yesFn: function(index, layero) {
                    Req.postReqCommon(url, param);
                }
            });
        });

        // 退回修改
        $(document).on('click', '.backSubmit', function () {
            var url = $(this).attr('data-url');

            Dialog.formDialog({
                title: '退回修改',
                content: getBackSubmitDialogHtml(),
                success: function(layero, index) {
                    form.on('submit(bind)', function(data) {
                        var $form = layero.find('form'),
                            param = $form.serializeArray();
                        //add by huang2019/12/05
                        if(typeof(applyBond)!='undefined')
                        {
                            var applyBondStr = JSON.stringify(applyBond);
                            param.push({name: "applyBond", value: applyBondStr});

                            var applyBond_diffStr = JSON.stringify(applyBond_diff);
                            param.push({name: "applyBond_diff", value: applyBond_diffStr});

                            var applyCpsStr = JSON.stringify(applyCps);
                            param.push({name: "applyCps", value: applyCpsStr});
                        }
                        //end
                        Req.postReqCommon(url, param);
                        return false;
                    })
                }
            })
        });
    });
});