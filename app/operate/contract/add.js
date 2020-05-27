/**
 * 运营-合同-存量合同登记
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
        // console.log(paymentPropertyList,'paymentPropertyList');
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
                        if(paymentRentList[i].feeType == 'init') {
                            _html += '<td class="date-2 dateGroup">' +
                                        '<div class="layui-input-inline layui-col-xs6">' +
                                            '<input type="text" name="rentBegindate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="">' +
                                        '</div>' +
                                            '<div class="layui-form-mid"> ~ </div>' +
                                        '<div class="layui-input-inline layui-col-xs6">' +
                                            '<input type="text" name="rentEnddate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="">' +
                                        '</div>' +
                                    '</td>' +
                                     '<td><input type="text" name="rentFee[]" lay-verify="required|onlyDecmal8Ex0" class="layui-input rentFee" autocomplete="off" value=""></td>';
                        } else {
                            _html += '<td class="date-2 dateGroup">' +
                                        '<div class="layui-input-inline layui-col-xs6">' +
                                            '<input type="text" name="rentBegindate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="'+ paymentRentList[i].dateBegin +'">' +
                                        '</div>' +
                                            '<div class="layui-form-mid"> ~ </div>' +
                                        '<div class="layui-input-inline layui-col-xs6">' +
                                            '<input type="text" name="rentEnddate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="'+ paymentRentList[i].dateEnd +'">' +
                                        '</div>' +
                                    '</td>' +
                                     '<td><input type="text" name="rentFee[]" lay-verify="required|onlyDecmal8Ex0" class="layui-input rentFee" autocomplete="off" value="'+ paymentRentList[i].fee +'"></td>';
                        }
                        _html +=     '<td>' +
                                        '<a href="javascript:;" class="iconfont ibs-ico-deletenorml font-16 c-blue deleteTr" data-type="rent" title="删除"></a>' +
                                        '<a href="javascript:;" class="iconfont ibs-ico-charuhang font-16 c-blue insertTr" data-type="rent" title="插入"></a>' +
                        '</td>' +
                    '</tr>' +
                    // 财务
                    '<tr class="check-2">' +
                        '<td><span class="c-gray-light">财务校核</span></td>';
                        if(financeRentList[i].feeType == 'init') {
                            _html += '<td><span class="c-red diff ml-10">-</span></td>' +
                                     '<td><span class="c-red diff ml-10">-</span></td>';
                        } else {
                            _html += '<td><span class="ml-10 '+ compare(paymentRentList[i], financeRentList[i], 1) +'">'+ financeRentList[i].dateBegin + ' ~ ' + financeRentList[i].dateEnd +'</span></td>' +
                                     '<td><span class="ml-10 '+ compare(paymentRentList[i], financeRentList[i], 2) +'">'+ financeRentList[i].fee +'</span></td>';
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
                    if(paymentPropertyList[i].feeType == 'init') {
                        _html += '<td class="date-2 dateGroup">' +
                                    '<div class="layui-input-inline layui-col-xs6">' +
                                        '<input type="text" name="propertyBegindate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="">' +
                                    '</div>' +
                                        '<div class="layui-form-mid"> ~ </div>' +
                                    '<div class="layui-input-inline layui-col-xs6">' +
                                        '<input type="text" name="propertyEnddate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="">' +
                                    '</div>' +
                                '</td>' +
                                 '<td><input type="text" name="propertyFee[]" lay-verify="required|onlyDecmal8Ex0" class="layui-input propertyFee" autocomplete="off" value=""></td>';
                    } else {
                        _html += '<td class="date-2 dateGroup">' +
                                    '<div class="layui-input-inline layui-col-xs6">' +
                                        '<input type="text" name="propertyBegindate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="'+ paymentPropertyList[i].dateBegin +'">' +
                                    '</div>' +
                                        '<div class="layui-form-mid"> ~ </div>' +
                                    '<div class="layui-input-inline layui-col-xs6">' +
                                        '<input type="text" name="propertyEnddate[]" lay-verify="required|date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox" value="'+ paymentPropertyList[i].dateEnd +'">' +
                                    '</div>' +
                                '</td>' +
                                 '<td><input type="text" name="propertyFee[]" lay-verify="required|onlyDecmal8Ex0" class="layui-input propertyFee" autocomplete="off" value="'+ paymentPropertyList[i].fee +'"></td>';
                    }
                    _html +=     '<td>' +
                                    '<a href="javascript:;" class="iconfont ibs-ico-deletenorml font-16 c-blue deleteTr" data-type="property" title="删除"></a>' +
                                    '<a href="javascript:;" class="iconfont ibs-ico-charuhang font-16 c-blue insertTr" data-type="property" title="插入"></a>' +
                                '</td>' +
                    '</tr>' +
                    // 财务
                    '<tr class="check-2">' +
                        '<td><span class="c-gray-light">财务校核</span></td>';
                    if(financePropertyList[i].feeType == 'init') {
                        _html += '<td><span class="c-red diff ml-10">-</span></td>' +
                                 '<td><span class="c-red diff ml-10">-</span></td>';
                    } else {
                        _html += '<td><span class="ml-10 '+ compare(paymentPropertyList[i], financePropertyList[i], 1) +'">'+ financePropertyList[i].dateBegin + ' ~ ' + financePropertyList[i].dateEnd +'</span></td>' +
                                 '<td><span class="ml-10 '+ compare(paymentPropertyList[i], financePropertyList[i], 2) +'">'+ financePropertyList[i].fee +'</span></td>';
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

        MUpload({
            elem: $('.upload1'),
            iframeIndex: 0,
            size: 1024 * 5,
            choose:function(){},
        });

        MUpload({
            elem: $('.upload2'),
            iframeIndex: 1,
            size: 1024 * 5,
            choose:function(){},
        });

        MUpload({
            elem: $('.upload3'),
            iframeIndex: 2,
            size: 1024 * 5,
            choose:function(){},
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
                                '<input type="text" class="layui-input rentFee" name="rentFee[]" lay-verify="required|onlyDecmal8Ex0" autocomplete="off" value="'+ param.fee +'">' +
                            '</div>' +
                        '</td>' +
                        '<td>' +
                            '<a href="javascript:;" class="iconfont ibs-ico-deletenorml font-16 c-blue deleteTr" data-type="rent" title="删除"></a>' +
                            '<a href="javascript:;" class="iconfont ibs-ico-charuhang font-16 c-blue insertTr" data-type="rent" title="插入"></a></td>' +
                    '</tr>';
            if($('#collectrentpaymentlist').length) {
                // 校核
                _html += '<tr class="check-2">' +
                            '<td><span class="c-gray-light">财务校核</span></td>' +
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
                            '<td><span class="c-gray-light">财务校核</span></td>' +
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

    function renderSingleDateBox() {
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

    $(function() {
        init();
        // 初始化房源选择
        $(document).on('click', '.selectHouse', function() {
            var $o = $(this),
                url = $('#selectHouse').val();
            var $selectRoomInput = $('input[name=selectRoomIds]'),
                $selectParkInput = null;

            Common.selectHouse(url, $selectRoomInput, $selectParkInput, function (data) {
                $('.houseDetail').html(Common.getHouseDetailHtml(data));

                if(data.squarePrice.length || data.fixedPrice.length) {
                    $('.houseRoomDiv').html('<span class="allHouseDiv">' + data.allHouse + '</span>');
                } else {
                    $('.houseRoomDiv').html('');
                }

                $('input[name=selectRoomIds]').val(data.roomIds.join(','));
                $('input[name=selectRoomNames]').val(data.allHouse);
                $('input[name=selectTotalArea]').val(data.totalArea);
            });
        });

        // 租金单价
        $(document).on('blur', '.rentPrice', function() {
            var $o = $(this),
                $target = $o.parent().next().find('.convert'),
                $parent = $o.parent(),
                rentUnit = $o.attr('data-rent-unit'),
                convert = '';
            if(!Regex.onlyDecmal8Ex0.reg.test($o.val())) {
                Dialog.errorDialog(Regex.onlyDecmal8Ex0.msg);
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
            if(!Regex.onlyDecmal8Ex0.reg.test($o.val())) {
                Dialog.errorDialog(Regex.onlyDecmal8Ex0.msg);
                return false;
            }
        });

        // 添加免租期
        $(document).on('click', '.addMoreFreeDate', function() {
            $('.moreFreeDate').append(getFreeDateHtml());
            renderSingleDateBox();
        });

        // 删除免租期
        $(document).on('click', '.delFreeDate', function () {
            $(this).parent().parent().parent().remove();
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
                compV = isNaN(parseFloat(compV)) ? 0 : parseFloat(compV);
                var result = Common.Util.accSub(money, compV);
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

            // 允许删除所有行
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
                                '<td colspan="4" class="txt-c"><span class="mr-5">暂无收费计划</span><a href="javascript:;" class="c-link insertTr insertOneTr" data-type="'+ type +'">添加1行</a></td>' +
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

        // 验证
        form.verify({
            // 电费单价
            // elecamount: function(value, item) {
            //     if($(item).parent().parent().is(":visible")) {
            //         if(!Regex.onlyDecmal8Ex0.reg.test(value)) {
            //             return Regex.onlyDecmal8Ex0.msg;
            //         }
            //     }
            // },
        });

        function validateFreeDate() {
            var flag = true;
            var $contractFreeBegins = $('input[name^=contractFreeBeginDate]');
            if($contractFreeBegins.length) {
                for(var i = 0, len = $contractFreeBegins.length; i < len; i++) {
                    var $curDateGroup = $contractFreeBegins.eq(i).parents('.dateGroup'),
                        $freeBegin = $curDateGroup.find('input[name^=contractFreeBeginDate]'),
                        $freeEnd = $curDateGroup.find('input[name^=contractFreeEndDate]'),
                        begin = $freeBegin.val(),
                        end = $freeEnd.val();

                    if((begin && !end)) {
                        Dialog.errorDialog("免租期结束日期未填");
                        $freeEnd.addClass('layui-form-danger');
                        flag = false;
                        break;
                    }

                    if(!begin && end) {
                        Dialog.errorDialog("免租期开始日期未填");
                        $freeBegin.addClass('layui-form-danger');
                        flag = false;
                        break;
                    }

                    if(begin && end) {
                        // 日期比较
                        if(!Common.Util.compareDate(begin, end)) {
                            Dialog.errorDialog("免租期开始日期不得大于结束日期");
                            $freeBegin.addClass('layui-form-danger');
                            flag = false;
                            break;
                        }
                    }
                }
            }

            return flag;
        }

        function getFreeDate() {
            var freeDateArr = [];
            var $contractFreeBegins = $('input[name^=contractFreeBeginDate]');
            if($contractFreeBegins.length) {
                for(var i = 0, len = $contractFreeBegins.length; i < len; i++) {
                    var $curDateGroup = $contractFreeBegins.eq(i).parents('.dateGroup'),
                        $freeBegin = $curDateGroup.find('input[name^=contractFreeBeginDate]'),
                        $freeEnd = $curDateGroup.find('input[name^=contractFreeEndDate]'),
                        begin = $freeBegin.val(),
                        end = $freeEnd.val();

                    if(begin && end) {
                        freeDateArr.push({
                            begin: begin,
                            end: end
                        });
                    }
                }
            }
            return freeDateArr;
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

        form.on('submit(saveSubmit)', function(data){
            var $form = $('form'),
                url = $(this).attr('data-url');

            if($('input[name=selectRoomIds]').length && !$('input[name=selectRoomIds]').val()) {
                Dialog.errorDialog('未选择房源');
                return false;
            }

            // 租期验证
            var $contarctDateStart = $('input[name=contarctDateStart]'),
                $contarctDateEnd = $('input[name=contarctDateEnd]');

            if($contarctDateStart.length && $contarctDateEnd.length) {
                if(!Common.Util.compareDate($contarctDateStart.val(), $contarctDateEnd.val())) {
                    Dialog.errorDialog("开始日期不得大于结束日期");
                    $contarctDateStart.addClass('layui-form-danger');
                    return false;
                }
            }

            // 免租期验证
            var $contractFreeBegins = $('input[name^=contractFreeBeginDate]');
            if($contractFreeBegins.length) {
                if(validateFreeDate()) {
                    var freeDateArr = getFreeDate();

                    if(!checkContractFreeDate(freeDateArr)) {
                        Dialog.errorDialog("免租期时间段出现重叠，请重新选择");
                        return false;
                    }
                    var newData = [];
                    freeDateArr.forEach(function (item, index) {
                        newData.push(item.begin + '~' + item.end);
                    });
                    $('input[name=contractFreePeriod]').val(newData.join('/'));
                } else {
                    return false;
                }
            }

            Common.Util.replaceSerializeName2($form);
            var param = $form.serializeArray();

            var auditStatus = $(data.elem).attr('data-audit-status');
            var contractType = $(data.elem).attr('data-contract-type');

            param.push({
                name: 'auditStatus',
                value: auditStatus
            });

            // 续租
            if(contractType) {
                param.push({name: 'contractType', value: contractType});
            }

            if(!checkPlanDate()) {
                return false;
            }

            if (auditStatus == '0') {
                // 暂存
                Req.postReqCommon(url, param);
            } else {
                // 提交
                if ($('#collectrentpaymentlist').length) {
                    // 校核
                    if ($('.diff').length) {
                        Dialog.confirmDialog({
                            title: '提醒',
                            content: '所填信息与财务校验数据仍然不一致，确定要继续提交吗？',
                            yesFn: function (index, layero) {
                                param.push({name: 'isSame', value: 0});
                                Req.postReqCommon(url, param);
                            }
                        });
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

        form.on('submit', function () {
            return false;
        })
    });
});