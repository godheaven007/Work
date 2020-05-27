/**
 * 财务-校核-校核详情
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'laydate', 'Regex'], function() {
    var $ = layui.jquery,
        form = layui.form,
        laydate = layui.laydate,
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var Regex = layui.Regex;
    var Dialog = layui.Dialog;
    var financeRentList = [],           // 财务租金
        financePropertyList = [],       // 财务物业费
        paymentRentList = [],           // 运营租金
        paymentPropertyList = [];       // 运营物业费


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

    function getDefaultObj() {
        return {feeType: 'init'};
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
     * @param type          1：日期比较  2：费用比较
     */
    function compare(paymentRent, financeRent, type) {
        var paymentDuration = paymentRent.dateBegin + paymentRent.dateEnd,
            financeDuration = financeRent.dateBegin + financeRent.dateEnd;

        var paymentFee = parseFloat(paymentRent.fee),
            financeFee = parseFloat(financeRent.fee);

        var defalutCls = 'c-gray-light';

        if(type == '1') {
            if(paymentDuration != financeDuration) {
                defalutCls = 'c-red diff';
            }
        } else if(type == '2') {
            if(Common.Util.accSub(paymentFee, financeFee) != 0) {
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
            _html +=
                // 运营
                '<tr class="check-1">' +
                '<td>第<span class="stage_span">'+ (i + 1) +'</span>期</td>';
            if(financeRentList[i].feeType == 'init') {
                _html += '<td class="date-2 dateGroup">' +
                            '<div class="layui-input-inline layui-col-xs6">' +
                                '<input type="text" name="rentBegindate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="">' +
                            '</div>' +
                            '<div class="layui-form-mid"> ~ </div>' +
                            '<div class="layui-input-inline layui-col-xs6">' +
                                '<input type="text" name="rentEnddate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="">' +
                            '</div>' +
                        '</td>' +
                    '<td><input type="text" name="rentFee[]" class="layui-input rentFee" lay-verify="required|onlyDecmal8Ex0" autocomplete="off" value=""></td>';
            } else {
                _html +=
                    '<td class="date-2 dateGroup">' +
                        '<div class="layui-input-inline layui-col-xs6">' +
                            '<input type="text" name="rentBegindate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="'+ financeRentList[i].dateBegin +'">' +
                        '</div>' +
                        '<div class="layui-form-mid"> ~ </div>' +
                        '<div class="layui-input-inline layui-col-xs6">' +
                            '<input type="text" name="rentEnddate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="'+ financeRentList[i].dateEnd +'">' +
                        '</div>' +
                    '</td>' +
                    '<td><input type="text" name="rentFee[]" class="layui-input rentFee" lay-verify="required|onlyDecmal8Ex0" autocomplete="off" value="'+ financeRentList[i].fee +'"></td>';
            }
            _html +=     '<td>' +
                '<a href="javascript:;" class="iconfont ibs-ico-deletenorml font-16 c-blue deleteTr" data-type="rent" title="删除"></a>' +
                '<a href="javascript:;" class="iconfont ibs-ico-charuhang font-16 c-blue insertTr" data-type="rent" title="插入"></a>' +
                '</td>' +
                '</tr>' +
                // 财务
                '<tr class="check-2">' +
                '<td><span class="c-gray-light">业务提交</span></td>';
            if(paymentRentList[i].feeType == 'init') {
                _html += '<td><span class="c-red ml-10">-</span></td>' +
                    '<td><span class="c-red ml-10">-</span></td>';
            } else {
                _html += '<td><span class="ml-10 '+ compare(paymentRentList[i], financeRentList[i], 1) +'">'+ paymentRentList[i].dateBegin + ' ~ ' + paymentRentList[i].dateEnd +'</span></td>' +
                    '<td><span class="ml-10 '+ compare(paymentRentList[i], financeRentList[i], 2) +'">'+ paymentRentList[i].fee +'</span></td>';
            }
            _html +=     '<td></td>' +
                '</tr>';
        }

        if(len) {
            $('.rentTbody').html(_html);
        } else {
            $('.rentTbody').html('<tr class="check-1"><td colspan="4" class="txt-c"><span class="mr-5">暂无收费计划</span><a href="javascript:;" class="c-link insertTr insertOneTr" data-type="rent">添加1行</a></td></tr>');
        }
    }

    function renderCheckProperty() {
        var _html = '',
            len = paymentPropertyList.length;
        for(var i = 0; i < len; i++) {
            _html +=
                // 运营
                '<tr class="check-1">' +
                '<td>第<span class="stage_span">'+ (i + 1) +'</span>期</td>';
            if(financePropertyList[i].feeType == 'init') {
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

                    '<td><input type="text" name="propertyFee[]" class="layui-input propertyFee" lay-verify="required|onlyDecmal8Ex0" autocomplete="off" value=""></td>';
            } else {
                _html +=
                    '<td class="date-2 dateGroup">' +
                        '<div class="layui-input-inline layui-col-xs6">' +
                            '<input type="text" name="propertyBegindate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="'+ financePropertyList[i].dateBegin +'">' +
                        '</div>' +
                        '<div class="layui-form-mid"> ~ </div>' +
                        '<div class="layui-input-inline layui-col-xs6">' +
                            '<input type="text" name="propertyEnddate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="'+ financePropertyList[i].dateEnd +'">' +
                        '</div>' +
                    '</td>' +

                    '<td><input type="text" name="propertyFee[]" class="layui-input propertyFee" lay-verify="required|onlyDecmal8Ex0" autocomplete="off" value="'+ financePropertyList[i].fee +'"></td>';
            }
            _html +=     '<td>' +
                '<a href="javascript:;" class="iconfont ibs-ico-deletenorml font-16 c-blue deleteTr" data-type="property" title="删除"></a>' +
                '<a href="javascript:;" class="iconfont ibs-ico-charuhang font-16 c-blue insertTr" data-type="property" title="插入"></a>' +
                '</td>' +
                '</tr>' +
                // 财务
                '<tr class="check-2">' +
                '<td><span class="c-gray-light">业务提交</span></td>';
            if(paymentPropertyList[i].feeType == 'init') {
                _html += '<td><span class="c-red ml-10">-</span></td>' +
                    '<td><span class="c-red ml-10">-</span></td>';
            } else {
                _html += '<td><span class="ml-10 '+ compare(paymentPropertyList[i], financePropertyList[i], 1) +'">'+ paymentPropertyList[i].dateBegin + ' ~ ' + paymentPropertyList[i].dateEnd +'</span></td>' +
                    '<td><span class="ml-10 '+ compare(paymentPropertyList[i], financePropertyList[i], 2) +'">'+ paymentPropertyList[i].fee +'</span></td>';
            }
            _html +=     '<td></td>' +
                '</tr>';
        }

        if(len) {
            $('.propertyTbody').html(_html);
        } else {
            $('.propertyTbody').html('<tr class="check-1"><td colspan="4" class="txt-c"><span class="mr-5">暂无收费计划</span><a href="javascript:;" class="c-link insertTr insertOneTr" data-type="property">添加1行</a></td></tr>');
        }
    }

    function init() {
        if($('#collectrentpaymentlist').length) {
            // 校核
            dataHandle();
        }
        renderDatebox();
        renderDatebox2();
    }
    /**
     * 批量添加
     */

    // 租金收费计划\物业服务费收费计划插入
    function getRowHtml(param, type) {
        var _html = '';
        if(type == 'rent') {
            _html = '<tr class="check-1">' +
                '<td class="c-gray-light">第<span class="stage_span"></span>期</td>' +
                '<td class="date-2 dateGroup">' +
                    '<div class="layui-input-inline layui-col-xs6">' +
                        '<input type="text" name="rentBegindate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="'+ param.beginDate +'">' +
                    '</div>' +
                    '<div class="layui-form-mid"> ~ </div>' +
                    '<div class="layui-input-inline layui-col-xs6">' +
                        '<input type="text" name="rentEnddate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="'+ param.endDate +'">' +
                    '</div>' +
                '</td>' +
                '<td>' +
                    '<div class="layui-inline">' +
                        '<input type="text" class="layui-input rentFee" lay-verify="required|onlyDecmal8Ex0" name="rentFee[]" autocomplete="off" value="'+ param.fee +'">' +
                    '</div>' +
                '</td>' +
                '<td>' +
                '<a href="javascript:;" class="iconfont ibs-ico-deletenorml font-16 c-blue deleteTr" data-type="rent" title="删除"></a>' +
                '<a href="javascript:;" class="iconfont ibs-ico-charuhang font-16 c-blue insertTr" data-type="rent" title="插入"></a></td>' +
                '</tr>';
            if($('#collectrentpaymentlist').length) {
                // 校核
                _html += '<tr class="check-2">' +
                    '<td><span class="c-gray-light">业务提交</span></td>' +
                    '<td><span class="c-red ml-10">-</span></td>' +
                    '<td><span class="c-red ml-10">-</span></td>' +
                    '<td></td>' +
                    '</tr>';
            }
        } else if(type == 'property') {
            _html += '<tr class="check-1">' +
                '<td class="c-gray-light">第<span class="stage_span"></span>期</td>' +
                '<td class="date-2 dateGroup">' +
                    '<div class="layui-input-inline layui-col-xs6">' +
                        '<input type="text" name="propertyBegindate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="'+ param.beginDate +'">' +
                    '</div>' +
                    '<div class="layui-form-mid"> ~ </div>' +
                    '<div class="layui-input-inline layui-col-xs6">' +
                        '<input type="text" name="propertyEnddate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="'+ param.endDate +'">' +
                    '</div>' +
                '</td>' +

                '<td>' +
                    '<div class="layui-inline">' +
                        '<input type="text" class="layui-input propertyFee" lay-verify="required|onlyDecmal8Ex0" name="propertyFee[]" autocomplete="off" value="'+ param.fee +'">' +
                    '</div>' +
                '</td>' +
                '<td>' +
                '<a href="javascript:;" class="iconfont ibs-ico-deletenorml font-16 c-blue deleteTr" data-type="property" title="删除"></a>' +
                '<a href="javascript:;" class="iconfont ibs-ico-charuhang font-16 c-blue insertTr" data-type="property" title="插入"></a>' +
                '</td>' +
                '</tr>';
            if($('#collectrentpaymentlist').length) {
                // 校核
                _html += '<tr class="check-2">' +
                    '<td><span class="c-gray-light">业务提交</span></td>' +
                    '<td><span class="c-red ml-10">-</span></td>' +
                    '<td><span class="c-red ml-10">-</span></td>' +
                    '<td></td>' +
                    '</tr>';
            }
        }
        return _html;
    }

    function insertRow($curTr, type) {
        var param = {
            fee: '',
            beginDate: '',
            endDate: ''
        };
        if($('#collectrentpaymentlist').length) {
            // 校核
            if($curTr.find('.insertOneTr').length) {
                $curTr.after(getRowHtml(param,type));
            } else {
                $curTr.next().after(getRowHtml(param,type));
            }
        } else {
            $curTr.after(getRowHtml(param,type));
        }
    }

    // 期数更新(校核)
    function updatePeriod($curTable) {
        var $trs = $curTable.find('.check-1');
        $trs.each(function(i, o) {
            $(o).find('td').eq(0).find(".stage_span").text(i + 1);
        })
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
                    var $curTr = $(this.elem).parents('.check-1'),
                        $nextTr = $curTr.next();
                    setTimeout(function() {
                        compare2($curTr, $nextTr);
                    },10);
                }
            });
        });
    }

    function getBatchAppendHtml(type) {
        var period = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            periodHtml = '<option value="">请选择</option>',
            payModeHtml = '<option value="">请选择</option>';

        period.forEach(function (v, k) {
            periodHtml += '<option value="'+ v +'">'+ v +'</option>';
        });

        paycode_list.forEach(function(item, index) {
            payModeHtml += '<option value="'+ item.codeValue +'">'+ item.codeKey +'</option>';
        });

        var _html = '<div class="layui-card-body">' +
            '<form class="layui-form" action="" lay-filter="formDialog">' +
            '<div class="layui-form-item">' +
            '<label class="layui-form-label text-w-120">开始日期</label>' +
            '<div class="layui-input-inline" style="width: 260px;">' +
            '<input type="text" name="startDate" lay-verify="required|date" placeholder="yyyy-MM-dd" lay-reqText="请选择开始日期" autocomplete="off" class="layui-input datebox">' +
            '</div>' +
            '</div>' +
            '<div class="layui-form-item">' +
            '<label class="layui-form-label text-w-120">支付方式</label>' +
            '<div class="layui-input-inline" style="width: 260px;">' +
            '<select name="payMode" lay-filter="payMode" lay-verify="required" lay-reqText="请选择支付方式">' +
            payModeHtml +
            '</select>' +
            '</div>' +
            '</div>' +
            '<div class="layui-form-item">' +
            '<label class="layui-form-label text-w-120">共计生成</label>' +
            '<div class="layui-input-inline" style="width: 260px;">' +
            '<select name="period" filter="period" lay-verify="required" lay-reqText="请选择期数">' +
            periodHtml +
            '</select>'+
            '</div>' +
            '<div class="layui-form-mid">期</div>'+
            '</div>'+
            '<div class="layui-form-item">';
        if(type == 'rent') {
            _html += '<label class="layui-form-label text-w-120">每期租金</label>';
        } else if(type == 'property') {
            _html += '<label class="layui-form-label text-w-120">每期物业服务费</label>';
        }
        _html +=
            '<div class="layui-input-inline" style="width: 260px;">' +
            '<input type="text" name="fee" lay-verify="required|number" lay-reqText="请输入每期租金" required placeholder="请输入每期租金" autocomplete="off" class="layui-input" >'+
            '</div>' +
            '<div class="layui-form-mid">元</div>'+
            '</div>' +
            '<div class="layui-form-item">' +
            '<label class="layui-form-label"></label>' +
            '<div class="layui-input-block">';
        if(type == 'rent') {

            _html += '<p class="c-gray-light">说明：若有租金递增，请分多批追加。</p>';
        } else if(type == 'property') {
            _html += '<p class="c-gray-light">说明：若有物业服务费递增，请分多批追加。</p>';
        }
        _html +=

            '</div>' +
            '</div>'+
            '<!--写一个隐藏的btn -->' +
            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
            '</button>' +
            '</form>' +
            '</div>';
        return _html;
    }

    // 支付时间间隔
    function getMatchMonth(num) {
        switch (num) {
            case '1': return 1; break;
            case '2': return 2; break;
            case '3': return 3; break;
            case '31': return 4; break;
            case '32': return 5; break;
            case '4': return 6; break;
            case '5': return 12; break;
            case '6': return 24; break;
            default: return 1;
        }
    }

    function renderBatchFeePlan(param) {
        var _html = '',
            type = param.type,
            period = parseInt(param.period),
            month = getMatchMonth(param.payMode);
        var start = param.startDate,
            end = Common.Util.getNextMonth(param.startDate, month);
        var param = {
            fee: param.fee,
            beginDate: start,
            endDate: end
        };

        for(var i = 1, len = period; i <= len; i++) {
            _html += getRowHtml(param, type);
            if(i < len) {
                start = Common.Util.getNextDate(end, 1);
                end = Common.Util.getNextMonth(start, month);
                param.beginDate = start;
                param.endDate = end;
            }
        }
        return _html;
    }

    function batchAppendHandle($batchAppendTr, type, callback) {
        var $curTable = $batchAppendTr.parents('table');
        // var size = $curTable.find('.check-1').length - 1;
        var title = '批量追加租金';

        if(type == 'property') {
            title = '批量追加物业服务费';
        }

        Dialog.formDialog({
            title: title,
            area: ['500px', 'auto'],
            content: getBatchAppendHtml(type),
            success: function (layero, index) {
                form.render(null, 'formDialog');
                renderDatebox();

                form.on('submit(bind)', function(data) {

                    var param = data.field;
                    // param.size = size;
                    param.type = type;
                    $batchAppendTr.before(renderBatchFeePlan(param));

                    if($curTable.find('.insertOneTr').length) {
                        $curTable.find('.insertOneTr').parents('.check-1').remove();
                    }

                    updatePeriod($curTable);
                    updateRentOrPorperty($curTable, type);
                    updateTotalAmount();
                    renderDatebox();
                    callback && callback();
                    layer.close(index);
                    return false;
                })
            }
        })
    }
    // function batchAppendHandle($batchAppendTr, type, callback) {
    //     var $curTbody = $batchAppendTr.parent(),
    //         $curTable = $batchAppendTr.parents('table'),
    //         size = $curTbody.find('tr').length - 1,
    //         title = '批量追加租金';
    //
    //     if(type == 'property') {
    //         title = '批量追加物业服务费';
    //     }
    //
    //     Dialog.formDialog({
    //         title: title,
    //         content: getBatchAppendHtml(type),
    //         success: function (layero, index) {
    //             form.render(null, 'formDialog');
    //             renderDatebox();
    //
    //             form.on('submit(bind)', function(data) {
    //
    //                 var param = data.field;
    //                 param.size = size;
    //                 param.type = type;
    //                 $batchAppendTr.before(renderBatchFeePlan(param));
    //                 layer.close(index);
    //                 updatePeriod($curTbody);
    //                 updateRentOrPorperty($curTable, type);
    //                 updateTotalAmount();
    //                 renderDatebox();
    //                 callback && callback();
    //                 return false;
    //             })
    //         }
    //     })
    // }

    $(function() {

        init();
		//变更企业抬头确认通过  add by huang 2019/12/05
//		form.on('submit(passCompanySubmit)', function (data) {
//            var url = $('.passCompanySubmit').attr('data-url'),
//                $form = $('form'),
//                param = $form.serializeArray();
//				var applyCpsStr = JSON.stringify(applyCps);
//
//				param.push({name: "applyCps", value: applyCpsStr});
//				//add by huang 2019/12/05
//				if(typeof(applyBond))
//				{
//					var applyBondStr = JSON.stringify(applyBond);
//					param.push({name: "applyBond", value: applyBondStr});
//
//					var applyBond_diffStr = JSON.stringify(applyBond_diff);
//					param.push({name: "applyBond_diff", value: applyBond_diffStr});
//				}
//            });
//            Req.postReqCommon(url, param);
//            return false;
//        });
		//end

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


        // 批量追加
        $(document).on('click', '.batchAppend', function() {
            var $o = $(this),
                $batchAppendTr = $(this).parents('.batchAppendTr'),
                type = $o.attr('data-type');

            var $tbody = $batchAppendTr.parents('tbody');

            batchAppendHandle($batchAppendTr, type, function () {
                if($tbody.find('.insertOneTr').length) {
                    $tbody.find('.insertOneTr').parents('.check-1').remove();
                }
            });
        });

        // 保证金
        $(document).on('change', 'input[name=bond]', function () {
            var money = parseFloat($(this).val()),
                $bondCheck = $('.bondcheck');
            if(isNaN(money)) {
                money = 0;
            } else {
                money = money.toFixed(2);
            }
            $('.contactBond').text(money);
            if($('.contactTotal').length) {
                updateTotalAmount();
            }
            if($bondCheck.length) {
                // 校核
                var compV = $bondCheck.attr('data-value');
                var result = Common.Util.accSub(money, parseFloat(compV));
                if(result == 0) {
                    $bondCheck.removeClass('c-red diff');
                } else {
                    $bondCheck.addClass('c-red diff');
                }
            }
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
                var html = '<tr class="check-1">' +
                    '<td colspan="4" class="txt-c"><span class="mr-5">暂无收费计划</span><a href="javascript:;" class="c-link insertTr insertOneTr" data-type="'+ type +'">添加1行</a></td>\n' +
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
            Req.postReqCommon(url, param);
            return false;
        });
    });
});