/**
 * 运营-合同-变更
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
            if(Common.Util.accSub(paymentPayFee, financePayFee) != 0) {
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
                financeItem = financeRentList[i],
                statusStr = '';

            // 收款状态
            if(payItem.paystatus == '2') {
                statusStr = '<span>已收款 √</span>';
            } else if(payItem.paystatus == '1') {
                statusStr = '<span class="c-red">未结清</span>';
            } else {
                statusStr = '<span class="c-red">未收款</span>';
            }

            _html +=
                // 运营
                '<tr class="check-1">' +
                '<td>第<span class="stage_span">'+ (i + 1) +'</span>期</td>';
            if(payItem.feeType == 'init') {
                _html +='<td class="date-2 dateGroup">' +
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
                                '<input type="text" class="layui-input rentFee" lay-verify="required|onlyDecmal8Ex0" name="rentFee[]" autocomplete="off" value="">' +
                            '</div>' +
                        '</td>' +
                        '<td><span>-</span>' +
                        '</td>' +
                        '<td class="txt-c">' +
                            '<span class="c-red">未收款</span>' +
                            '<input type="hidden" name="rentStatus[]" value="">'+
                        '</td>' +
                        '<td>' +
                            '<a href="javascript:;" class="iconfont ibs-ico-deletenorml font-16 c-blue deleteTr" title="删除" data-type="rent"></a>' +
                            '<a href="javascript:;" class="iconfont ibs-ico-charuhang font-16 c-blue insertTr" title="插入" data-type="rent"></a>' +
                            '<input type="hidden" name="rentPayStatus[]" value="">' +
                            '<input type="hidden" name="rentPayDate[]" value="">' +
                            '<input type="hidden" name="rentPayFee[]" value="">' +
                            '<input type="hidden" name="rentFinance[]" value="">' +
                        '</td>';
            } else {
                if(payItem.paystatus == '2') {
                    // 已收款
                    _html += '<td>' +
                                '<span>'+ payItem.dateBegin + ' ~ ' + payItem.dateEnd +'</span>' +
                                '<input type="hidden" name="rentBegindate[]" value="'+ payItem.dateBegin +'">' +
                                '<input type="hidden" name="rentEnddate[]" value="'+ payItem.dateEnd +'">' +
                             '</td>' +
                            '<td>' +
                                '<span>'+ payItem.fee +'</span>' +
                                '<input type="hidden" name="rentFee[]"  value="'+ payItem.fee +'">' +
                            '</td>' +
                             '<td>' +
                                '<span>'+ payItem.payFee +'</span>' +
                             '</td>' +
                             '<td class="txt-c">' +
                                statusStr +
                                '<br>' +
                                '<span class="font-12">'+ payItem.payDate +'</span>' +
                                '<input type="hidden" name="rentStatus[]" value="'+ payItem.status +'">'+
                             '</td>' +
                             '<td>' +
                                '<input type="hidden" name="rentPayStatus[]" value="'+ payItem.paystatus +'">' +
                                '<input type="hidden" name="rentPayDate[]" value="'+ payItem.payDate +'">' +
                                '<input type="hidden" name="rentPayFee[]" value="'+ payItem.payFee +'">' +
                                '<input type="hidden" name="rentFinance[]" value="'+ (!payItem.financialRelation ? '' : payItem.financialRelation) +'">' +
                             '</td>';

                } else if(payItem.paystatus == '1') {
                    // 未结清
                    _html += '<td class="date-2 dateGroup">' +
                                '<div class="layui-input-inline layui-col-xs6">' +
                                    '<input type="text" name="rentBegindate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="'+ payItem.dateBegin +'">' +
                                '</div>' +
                                '<div class="layui-form-mid"> ~ </div>' +
                                '<div class="layui-input-inline layui-col-xs6">' +
                                    '<input type="text" name="rentEnddate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="'+ payItem.dateEnd +'">' +
                                '</div>' +
                            '</td>' +
                             '<td>' +
                                '<div class="layui-inline">' +
                                    '<input type="text" class="layui-input rentFee" lay-verify="required|onlyDecmal8Ex0" name="rentFee[]" autocomplete="off" value="'+ payItem.fee +'">' +
                                '</div>' +
                             '</td>' +
                             '<td>' +
                                '<span>'+ payItem.payFee +'</span>' +
                             '</td>' +
                            '<td class="txt-c">' +
                                statusStr +
                                '<br>' +
                                '<span class="font-12">'+ payItem.payDate +'</span>' +
                                '<input type="hidden" name="rentStatus[]" value="'+ payItem.status +'">'+
                            '</td>' +
                            '<td>' +
                                '<a href="javascript:;" class="iconfont ibs-ico-charuhang font-16 c-blue insertTr" title="插入" data-type="rent"></a>' +
                                '<input type="hidden" name="rentPayStatus[]" value="'+ payItem.paystatus +'">' +
                                '<input type="hidden" name="rentPayDate[]" value="'+ payItem.payDate +'">' +
                                '<input type="hidden" name="rentPayFee[]" value="'+ payItem.payFee +'">' +
                                '<input type="hidden" name="rentFinance[]" value="'+ (!payItem.financialRelation ? '' : payItem.financialRelation) +'">' +
                            '</td>';
                } else {
                    // 未收款
                    _html +=
                        '<td class="date-2 dateGroup">' +
                            '<div class="layui-input-inline layui-col-xs6">' +
                                '<input type="text" name="rentBegindate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="'+ payItem.dateBegin +'">' +
                            '</div>' +
                            '<div class="layui-form-mid"> ~ </div>' +
                            '<div class="layui-input-inline layui-col-xs6">' +
                                '<input type="text" name="rentEnddate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="'+ payItem.dateEnd +'">' +
                            '</div>' +
                        '</td>' +
                        '<td>' +
                            '<div class="layui-inline">' +
                                '<input type="text" class="layui-input rentFee" lay-verify="required|onlyDecmal8Ex0" name="rentFee[]" autocomplete="off" value="'+ payItem.fee +'">' +
                            '</div>' +
                        '</td>' +
                        '<td><span>'+ payItem.payFee +'</span></td>' +
                        '<td class="txt-c">' +
                            statusStr +
                            '<input type="hidden" name="rentStatus[]" value="'+ payItem.status +'">'+
                        '</td>' +
                        '<td>' +
                            '<a href="javascript:;" class="iconfont ibs-ico-deletenorml font-16 c-blue deleteTr" title="删除" data-type="rent"></a>' +
                            '<a href="javascript:;" class="iconfont ibs-ico-charuhang font-16 c-blue insertTr" title="插入" data-type="rent"></a>' +
                            '<input type="hidden" name="rentPayStatus[]" value="'+ payItem.paystatus +'">' +
                            '<input type="hidden" name="rentPayDate[]" value="'+ payItem.payDate +'">' +
                            '<input type="hidden" name="rentPayFee[]" value="'+ payItem.payFee +'">' +
                            '<input type="hidden" name="rentFinance[]" value="'+ (!payItem.financialRelation ? '' : payItem.financialRelation) +'">' +
                        '</td>';
                }
            }
            _html += '</tr>';
            // 财务校核
            if(payItem.paystatus == '2') {
                // 已收款
            } else {
                // 未收款 && 未结清 && payItem.paystatus=='undefined'
                if(financeItem.feeType == "init") {
                    _html += '<tr class="check-2">' +
                        '<td><span class="c-gray-light">财务校核</span></td>' +
                        '<td><span class="c-red diff">-</span></td>' +
                        '<td><span class="c-red diff">-</span></td>' +
                        '<td><span class="c-red diff">-</span></td>'+
                        '<td></td>' +
                        '<td></td>' +
                        '</tr>';
                } else {
                    var tempDateStr = '-';
                    if(financeItem.dateBegin && financeItem.dateEnd) {
                        tempDateStr = financeItem.dateBegin + ' ~ ' + financeItem.dateEnd;
                    }
                    _html += '<tr class="check-2">' +
                        '<td><span class="c-gray-light">财务校核</span></td>' +
                        '<td><span class="'+ compare(payItem, financeItem, 1) +'">'+ tempDateStr +'</span></td>' +
                        '<td><span class="'+ compare(payItem, financeItem, 2) +'">'+ (Common.isNull(financeItem.fee) ? '-' : financeItem.fee)  +'</span></td>' +
                        '<td><span class="'+ compare(payItem, financeItem, 3) +'">'+ ((Common.isNull(financeItem.payFee) || financeItem.payFee == 0) ? '-' : financeItem.payFee) +'</span></td>'+
                        '<td></td>' +
                        '<td></td>' +
                        '</tr>';
                }
            }

        }

        if(len) {
            $('.rentChangeTbody').html(_html);
        } else {
            $('.rentChangeTbody').html('<tr class="check-1"><td colspan="6" class="txt-c"><span class="mr-5">暂无收费计划</span><a href="javascript:;" class="c-link insertTr insertOneTr" data-type="rent">添加1行</a></td></tr>');
        }

        updateRentOrPorperty($('.rentChangeTbody').parent('table'), 'rent');
        updateTotalAmount();
    }

    function renderCheckProperty() {
        var _html = '',
            len = paymentPropertyList.length;
        for(var i = 0; i < len; i++) {
            var payItem = paymentPropertyList[i],
                financeItem = financePropertyList[i],
                statusStr = '';

            // 收款状态
            if(payItem.paystatus == '2') {
                statusStr = '<span>已收款 √</span>';
            } else if(payItem.paystatus == '1') {
                statusStr = '<span class="c-red">未结清</span>';
            } else {
                statusStr = '<span class="c-red">未收款</span>';
            }

            _html +=
                // 运营
                '<tr class="check-1">' +
                '<td>第<span class="stage_span">'+ (i + 1) +'</span>期</td>';
            if(payItem.feeType == 'init') {
                _html +=
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
                            '<input type="text" class="layui-input propertyFee" lay-verify="required|onlyDecmal8Ex0" name="propertyFee[]" autocomplete="off" value="">' +
                        '</div>' +
                    '</td>' +
                    '<td><span>-</span>' +
                    '</td>' +
                    '<td class="txt-c">' +
                        '<span class="c-red">未收款</span>' +
                        '<input type="hidden" name="propertyStatus[]" value="">'+
                    '</td>' +
                    '<td>' +
                        '<a href="javascript:;" class="iconfont ibs-ico-deletenorml font-16 c-blue deleteTr" title="删除" data-type="property"></a>' +
                        '<a href="javascript:;" class="iconfont ibs-ico-charuhang font-16 c-blue insertTr" title="插入" data-type="property"></a>' +
                        '<input type="hidden" name="propertyPayStatus[]" value="">' +
                        '<input type="hidden" name="propertyPayDate[]" value="">' +
                        '<input type="hidden" name="propertyPayFee[]" value="">' +
                        '<input type="hidden" name="propertyFinance[]" value="">' +
                    '</td>';
            } else {
                if(payItem.paystatus == '2') {
                    // 已收款
                    _html += '<td>' +
                                '<span>'+ payItem.dateBegin + ' ~ ' + payItem.dateEnd +'</span>' +
                                '<input type="hidden" name="propertyBegindate[]" value="'+ payItem.dateBegin +'">' +
                                '<input type="hidden" name="propertyEnddate[]" value="'+ payItem.dateEnd +'">' +
                             '<td>' +
                                '<span>'+ payItem.fee +'</span>' +
                                '<input type="hidden" name="propertyFee[]" value="'+ payItem.fee +'">' +
                             '</td>' +
                             '<td>' +
                                '<span>'+ payItem.payFee +'</span>' +
                             '</td>' +
                             '<td class="txt-c">' +
                                statusStr +
                                '<br>' +
                                '<span class="font-12">'+ payItem.payDate +'</span>' +
                                '<input type="hidden" name="propertyStatus[]" value="'+ payItem.status +'">'+
                             '</td>' +
                            '<td>' +
                                '<input type="hidden" name="propertyPayStatus[]" value="'+ payItem.paystatus +'">' +
                                '<input type="hidden" name="propertyPayDate[]" value="'+ payItem.payDate +'">' +
                                '<input type="hidden" name="propertyPayFee[]" value="'+ payItem.payFee +'">' +
                                '<input type="hidden" name="propertyFinance[]" value="'+ (!payItem.financialRelation ? '' : payItem.financialRelation) +'">' +
                            '</td>';
                } else if(payItem.paystatus == '1') {
                    // 未结清
                    _html += '<td class="date-2 dateGroup">' +
                                '<div class="layui-input-inline layui-col-xs6">' +
                                    '<input type="text" name="propertyBegindate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="'+ payItem.dateBegin +'">' +
                                '</div>' +
                                '<div class="layui-form-mid"> ~ </div>' +
                                '<div class="layui-input-inline layui-col-xs6">' +
                                    '<input type="text" name="propertyEnddate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="'+ payItem.dateEnd +'">' +
                                '</div>' +
                            '</td>' +
                            '<td>' +
                                '<div class="layui-inline">' +
                                    '<input type="text" class="layui-input propertyFee" lay-verify="required|onlyDecmal8Ex0" name="propertyFee[]" autocomplete="off" value="'+ payItem.fee +'">' +
                                '</div>' +
                            '</td>' +
                            '<td>' +
                                '<span>'+ payItem.payFee +'</span>' +
                            '</td>' +
                            '<td class="txt-c">' +
                                statusStr +
                                '<br>' +
                                '<span class="font-12">'+ payItem.payDate +'</span>' +
                                '<input type="hidden" name="propertyStatus[]" value="'+ payItem.status +'">'+
                            '</td>' +
                            '<td>' +
                                '<a href="javascript:;" class="iconfont ibs-ico-charuhang font-16 c-blue insertTr" title="插入" data-type="property"></a>' +
                                '<input type="hidden" name="propertyPayStatus[]" value="'+ payItem.paystatus +'">' +
                                '<input type="hidden" name="propertyPayDate[]" value="'+ payItem.payDate +'">' +
                                '<input type="hidden" name="propertyPayFee[]" value="'+ payItem.payFee +'">' +
                                '<input type="hidden" name="propertyFinance[]" value="'+ (!payItem.financialRelation ? '' : payItem.financialRelation) +'">' +
                            '</td>';
                } else {
                    // 未收款
                    _html +=
                            '<td class="date-2 dateGroup">' +
                                '<div class="layui-input-inline layui-col-xs6">' +
                                    '<input type="text" name="propertyBegindate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="'+ payItem.dateBegin +'">' +
                                '</div>' +
                                    '<div class="layui-form-mid"> ~ </div>' +
                                '<div class="layui-input-inline layui-col-xs6">' +
                                    '<input type="text" name="propertyEnddate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="'+ payItem.dateEnd +'">' +
                                '</div>' +
                            '</td>' +
                            '<td>' +
                                '<div class="layui-inline">' +
                                    '<input type="text" class="layui-input propertyFee" lay-verify="required|onlyDecmal8Ex0" name="propertyFee[]" autocomplete="off" value="'+ payItem.fee +'">' +
                                '</div>' +
                            '</td>' +
                                '<td><span>'+ payItem.payFee +'</span>' +
                            '</td>' +
                            '<td class="txt-c">' +
                                statusStr +
                                '<br>' +
                                '<input type="hidden" name="propertyStatus[]" value="'+ payItem.status +'">'+
                            '</td>' +
                            '<td>' +
                                '<a href="javascript:;" class="iconfont ibs-ico-deletenorml font-16 c-blue deleteTr" title="删除" data-type="property"></a>' +
                                '<a href="javascript:;" class="iconfont ibs-ico-charuhang font-16 c-blue insertTr" title="插入" data-type="property"></a>' +
                                '<input type="hidden" name="propertyPayStatus[]" value="'+ payItem.paystatus +'">' +
                                '<input type="hidden" name="propertyPayDate[]" value="'+ payItem.payDate +'">' +
                                '<input type="hidden" name="propertyPayFee[]" value="'+ payItem.payFee +'">' +
                                '<input type="hidden" name="propertyFinance[]" value="'+ (!payItem.financialRelation ? '' : payItem.financialRelation) +'">' +
                            '</td>';
                }
            }
            _html += '</tr>';


            // 财务校核
            if(payItem.paystatus == '2') {
                // 已收款
            } else {
                // 未收款 && 未结清
                if(financeItem.feeType == 'init') {
                    _html += '<tr class="check-2">' +
                        '<td><span class="c-gray-light">财务校核</span></td>' +
                        '<td><span class="c-red diff">-</span></td>' +
                        '<td><span class="c-red diff">-</span></td>' +
                        '<td><span class="c-red diff">-</span></td>'+
                        '<td></td>' +
                        '<td></td>' +
                        '</tr>';
                } else {
                    var tempDateStr = '-';
                    if(financeItem.dateBegin && financeItem.dateEnd) {
                        tempDateStr = financeItem.dateBegin + ' ~ ' + financeItem.dateEnd;
                    }
                    _html += '<tr class="check-2">' +
                        '<td><span class="c-gray-light">财务校核</span></td>' +
                        '<td><span class="'+ compare(payItem, financeItem, 1) +'">'+ tempDateStr +'</span></td>' +
                        '<td><span class="'+ compare(payItem, financeItem, 2) +'">'+ (Common.isNull(financeItem.fee) ? '-' : financeItem.fee) +'</span></td>' +
                        '<td><span class="'+ compare(payItem, financeItem, 3) +'">'+ ((Common.isNull(financeItem.payFee) || financeItem.payFee == 0) ? '-' : financeItem.payFee) +'</span></td>'+
                        '<td></td>' +
                        '<td></td>' +
                        '</tr>';
                }
            }

        }

        if(len) {
            $('.propertyChangeTbody').html(_html);
        } else {
            $('.propertyChangeTbody').html('<tr class="check-1"><td colspan="6" class="txt-c"><span class="mr-5">暂无收费计划</span><a href="javascript:;" class="c-link insertTr insertOneTr" data-type="property">添加1行</a></td></tr>');
        }

        updateRentOrPorperty($('.propertyChangeTbody').parent('table'), 'property');
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
                                '<input type="text" class="layui-input rentFee" lay-verify="required|onlyDecmal8Ex0" name="rentFee[]" autocomplete="off" value="">' +
                            '</div>' +
                        '</td>' +
                        '<td><span>-</span>' +
                        '</td>' +
                        '<td class="txt-c">' +
                            '<span class="c-red">未收款</span>' +
                            '<input type="hidden" name="rentStatus[]" value="">'+
                        '</td>' +
                        '<td>' +
                            '<a href="javascript:;" class="iconfont ibs-ico-deletenorml font-16 c-blue deleteTr" title="删除" data-type="rent"></a>' +
                            '<a href="javascript:;" class="iconfont ibs-ico-charuhang font-16 c-blue insertTr" title="插入" data-type="rent"></a>' +
                            '<input type="hidden" name="rentPayStatus[]" value="">' +
                            '<input type="hidden" name="rentPayDate[]" value="">' +
                            '<input type="hidden" name="rentPayFee[]" value="">' +
                            '<input type="hidden" name="rentFinance[]" value="">' +
                        '</td>' +
                     '</tr>';
                    if($('#collectrentpaymentlist').length) {
                        // 校核
                        _html += '<tr class="check-2">' +
                            '<td><span class="c-gray-light">财务校核</span></td>' +
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
                                '<input type="text" class="layui-input propertyFee" lay-verify="required|onlyDecmal8Ex0" name="propertyFee[]" autocomplete="off" value="">' +
                            '</div>' +
                        '</td>' +
                        '<td><span>-</span>' +
                        '</td>' +
                        '<td class="txt-c">' +
                            '<span class="c-red">未收款</span>' +
                            '<input type="hidden" name="propertyStatus[]" value="">'+
                        '</td>' +
                        '<td>' +
                            '<a href="javascript:;" class="iconfont ibs-ico-deletenorml font-16 c-blue deleteTr" title="删除" data-type="property"></a>' +
                            '<a href="javascript:;" class="iconfont ibs-ico-charuhang font-16 c-blue insertTr" title="插入" data-type="property"></a>' +
                            '<input type="hidden" name="propertyPayStatus[]" value="">' +
                            '<input type="hidden" name="propertyPayDate[]" value="">' +
                            '<input type="hidden" name="propertyPayFee[]" value="">' +
                            '<input type="hidden" name="propertyFinance[]" value="">' +
                        '</td>' +
                     '</tr>';

                    if($('#collectrentpaymentlist').length) {
                        // 校核
                        _html += '<tr class="check-2">' +
                            '<td><span class="c-gray-light">财务校核</span></td>' +
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
        var contactBond = parseFloat($('input[name=bond]').val()),
            // contactBond = parseFloat($('.contactBond').text().replace(/,/g, '')),
            contactRent = parseFloat($('.contactRent').text().replace(/,/g, '')),
            contactProperty = parseFloat($('.contactProperty').text().replace(/,/g, ''));
        var r1 = Common.Util.accAdd(contactRent, contactBond);
        var r2 = Common.Util.accAdd(contactProperty, r1);
        var result = parseFloat(r2).toFixed(2);
        $('.contactTotal').text(result);
        $('#totalAmount').val(parseFloat(r2));
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

                // 收款状态
                var status = $curTr.find('input[name^="rentPayStatus"]').val();
                if(status == '1') {
                    // 未结清
                    var rentFee = parseFloat($curTr.find('input[name^="rentFee"]').val()),
                        rentPayFee = parseFloat($curTr.find('input[name^="rentPayFee"]').val());

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

                    // 收款状态
                    var status = $curTr.find('input[name^="propertyPayStatus"]').val();
                    if(status == '1') {
                        // 未结清
                        var fee = parseFloat($curTr.find('input[name^="propertyFee"]').val()),
                            payFee = parseFloat($curTr.find('input[name^="propertyPayFee"]').val());

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
            var $dateBar = $('tbody .dateGroup');

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

        form.on('submit(saveSubmit)', function(data){
            var $elem = $(data.elem),
                url = $elem.attr('data-url'),
                auditStatus = $elem.attr('data-audit-status'),
                contractType = $elem.attr('data-contract-type');

            var $form = $('form');
            Common.Util.replaceSerializeName2($form);
            var param = $form.serializeArray();

            param.push({name: 'auditStatus', value: auditStatus});
            param.push({name: 'contractType', value: contractType});

            if(!checkPlanDate()) {
                return false;
            }

            if(!checkRentAmount()) {
                return false;
            }

            if(auditStatus == '0') {
                // 暂存
                Req.postReqCommon(url, param);
            } else {
                // 提交
                if($('#collectrentpaymentlist').length) {
                    // 校核
                    if($('.diff').length) {
                        param.push({name: 'isSame', value: 0});
                        Req.postReqCommon(url, param);
                    } else {
                        param.push({name: 'isSame', value: 1});
                        Req.postReqCommon(url, param);
                    }
                } else {
                    Req.postReqCommon(url, param);
                }
            }
            return false;
        });
    });
});