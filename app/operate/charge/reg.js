/**
 * 登记应收账
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Pager','laydate', 'Regex', 'OTree', 'Flow'], function() {
    var $ = layui.jquery,
        laydate = layui.laydate,
        form = layui.form,
        Pager = layui.Pager,
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var OTree = layui.OTree;
    var Flow = layui.Flow;
    var Dialog = layui.Dialog;
    var Regex = layui.Regex;

    function renderDatebox(Date) {
        lay('.datebox').each(function(){
            laydate.render({
                elem: this,
                trigger: 'click',
                // showBottom: false,
                btns: ['clear', 'now'],
                value: Date
            });
        });
    }

    function init() {
        renderDatebox();
    }

    function getCustomerOpts() {
        var opts = '<option value="">输入客户名称</option>';

        if(customerList && customerList.length) {
            for(var i = 0, len = customerList.length; i < len; i++) {
                var item = customerList[i];
                opts += '<option value="'+ item.customerId +'" data-sub="'+ item.contractRooms +'">'+ item.customerName +'</option>';
            }
        }

        return opts;
    }

    function getSubejctOpts() {
        var opts = '<option value="">输入费用科目</option>';

        if(subjectList && subjectList.length) {
            for(var i = 0, len = subjectList.length; i < len; i++) {
                var curSubItem = subjectList[i];
                opts += '<optgroup label="'+ curSubItem.subName +'">';
                var threeSubList = curSubItem.threeSubjects;
                threeSubList.forEach(function (item, index) {
                    opts += '<option value="'+ item.subId +'">'+ item.subName +'</option>';
                });
                opts += '</optgroup>';
            }
        }

        return opts;
    }

    function getRowItem() {
        return '<tr class="rowItem">' +
                    '<td>' +
                        '<select name="customerId[]" lay-filter="customerId" lay-search="" class="customerName">' +
                            getCustomerOpts() +
                        '</select>' +
                        '<input type="hidden" name="customerName[]" value="" class="customerNameInput">' +
                    '</td>' +
                    '<td class="rentHouse">--</td>' +
                    '<td>' +
                        '<select name="subject[]" lay-filter="" lay-search="">' +
                        getSubejctOpts() +
                        '</select>' +
                    '</td>' +
                    '<td class="date-2 dateGroup">' +
                        '<div class="layui-input-inline layui-col-xs6">' +
                        '<input type="text" name="begindate[]" lay-verify="date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox">' +
                        '</div>' +
                        '<div class="layui-form-mid">-</div>' +
                        '<div class="layui-input-inline layui-col-xs6">' +
                        '<input type="text" name="enddate[]" lay-verify="date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox">' +
                        '</div>' +
                    '</td>' +
                    '<td><input type="text" name="shoulddate[]" lay-verify="date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox">' +
                    '</td>' +
                    '<td><input type="text" name="shouldprice[]" class="layui-input" placeholder="输入应收金额" value="" lay-verify="onlyDecmal9Ex0" autocomplete="off"></td>' +
                    '<td class="txt-c"><a href="javascript:;" class="c-link delRow"><i class="iconfont ibs-ico-deletenorml"></i></a><a href="javascript:;" class="c-link"><i class="iconfont ibs-ico-charuhang insertRow"></i></a></td>' +
                '</tr>';
    }

    function getMoreRowHtml(len) {
        var _html = '';

        for(var i = 0; i < len; i++) {
            _html += getRowItem();
        }
        return _html;
    }

    // 当前行对应的数据是否需要验证
    function curRowIsValidate($row) {
        var $customer = $row.find('select[name^=customerId]'),
            $subject = $row.find('select[name^=subject]'),
            $dateboxs = $row.find('.datebox'),
            $shouldprice = $row.find('input[name^=shouldprice]');
        var customerId = $customer.find('option:selected').val(),
            subjectId = $subject.find('option:selected').val(),
            shouldPrice = $shouldprice.val();

        return customerId || subjectId || shouldPrice || $dateboxs.eq(0).val() || $dateboxs.eq(1).val() || $dateboxs.eq(2).val();
    }

    function validate() {
        var $rowItems = $('.rowItem');

        for(var i = 0, len = $rowItems.length; i < len; i++) {
            var $curRowItem = $rowItems.eq(i);
            if(curRowIsValidate($curRowItem)) {
                var $customer = $curRowItem.find('select[name^=customerId]'),
                    $subject = $curRowItem.find('select[name^=subject]'),
                    $beginDate = $curRowItem.find('input[name^=begindate]'),
                    $endDate = $curRowItem.find('input[name^=enddate]'),
                    $shouldDate = $curRowItem.find('input[name^=shoulddate]'),
                    $shouldprice = $curRowItem.find('input[name^=shouldprice]');

                var customerId = $customer.find('option:selected').val(),
                    subjectId = $subject.find('option:selected').val(),
                    shouldPrice = $shouldprice.val();

                if(!customerId) {
                    Dialog.errorDialog("客户名称不能为空");
                    $customer.addClass('layui-form-danger').focus();
                    return false;
                }

                if(!subjectId) {
                    Dialog.errorDialog("费用科目不能为空");
                    $subject.addClass('layui-form-danger').focus();
                    return false;
                }

                if(!$beginDate.val()) {
                    Dialog.errorDialog("计费周期开始日期不能为空");
                    $beginDate.addClass('layui-form-danger').focus();
                    return false;
                }

                if(!$endDate.val()) {
                    Dialog.errorDialog("计费周期结束日期不能为空");
                    $endDate.addClass('layui-form-danger').focus();
                    return false;
                }

                if($beginDate.val() && $endDate.val()) {
                    if(!Common.Util.compareDate($beginDate.val(), $endDate.val())) {
                        Dialog.errorDialog("开始日期不得大于结束日期");
                        $beginDate.addClass('layui-form-danger');
                        return false;
                    }
                }

                if(!$shouldDate.val()) {
                    Dialog.errorDialog("应收日期不能为空");
                    $shouldDate.addClass('layui-form-danger').focus();
                    return false;
                }

                if(!shouldPrice) {
                    Dialog.errorDialog("应收金额不能为空");
                    $shouldprice.addClass('layui-form-danger').focus();
                    return false;
                }
            }
        }
        return true;
    }

    function getSubmitData() {
        var $rowItems = $('.rowItem'),
            result = [];

        for(var i = 0, len = $rowItems.length; i < len; i++) {
            var $curRowItem = $rowItems.eq(i);
            var o = {};
            if(curRowIsValidate($curRowItem)) {
                var $customer = $curRowItem.find('select[name^=customerId]'),
                    $contractRooms = $curRowItem.find('input[name^=contractRooms]'),
                    $customerName = $curRowItem.find('input[name^=customerName]'),
                    $subject = $curRowItem.find('select[name^=subject]'),
                    $beginDate = $curRowItem.find('input[name^=begindate]'),
                    $endDate = $curRowItem.find('input[name^=enddate]'),
                    $shouldDate = $curRowItem.find('input[name^=shoulddate]'),
                    $shouldprice = $curRowItem.find('input[name^=shouldprice]');

                var customerId = $customer.find('option:selected').val(),
                    subjectId = $subject.find('option:selected').val(),
                    shouldPrice = $shouldprice.val();

                o.customerId = customerId;
                o.contractRooms = $contractRooms.val();
                o.customerName = $customerName.val();
                o.subject = subjectId;
                o.begindate = $beginDate.val();
                o.enddate = $endDate.val();
                o.shoulddate = $shouldDate.val();
                o.shouldprice = shouldPrice;

                result.push(o);
            }
        }

        return result;
    }

    function getFeeDescDialogHtml() {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item">' +
                                '<div class="layui-input-blockxxx">' +
                                    '<textarea placeholder="费用说明" maxlength="500" lay-verify="required" lay-reqText="请填写费用说明" class="layui-textarea desc" name="desc">' +

                                    '</textarea>' +
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
        
        // 新增行数
        $(document).on('click', '.addMoreRow', function () {
            var $o = $(this),
                len = $o.attr('data-len');
            var $tbody = $('tbody');
            $tbody.append(getMoreRowHtml(len));
            renderDatebox();
            form.render();
        });

        $(document).on('click', '.insertRow', function () {
            var $o = $(this),
                $curItem = $o.parents('.rowItem');
            $curItem.after(getRowItem());
            renderDatebox();
            form.render();
        });

        $(document).on('click', '.delRow', function () {
            var $o = $(this),
                $curItem = $o.parents('.rowItem'),
                $rowItems = $('.rowItem');

            if($rowItems.length == 1) {
                Dialog.errorDialog("至少保留一行");
                return false;
            }
            $curItem.remove();
        });


        form.on('select(customerId)', function (data) {
            var $elem = $(data.elem),
                customerId = data.value;
            var curRoomName = $elem.find('option:selected').attr('data-sub'),
                curCustomerName = $elem.find('option:selected').text();

            var $curRowItem = $elem.parents('.rowItem'),
                $curRentHouse = $curRowItem.find('.rentHouse');
            if(curRoomName) {
                $curRentHouse.html(curRoomName + '<input type="hidden" name="contractRooms[]" value="'+ curRoomName +'">');
                $curRowItem.find('input[name^=customerName]').val(curCustomerName);
            } else {
                $curRentHouse.html('--');
                $curRentHouse.find('input[name^=contractRooms]').remove();
                $curRowItem.find('input[name^=customerName]').val('');
            }
        });

        form.on('submit(saveSubmit)', function (data) {
            var elem = data.elem,
                $elem = $(elem),
                url = $elem.attr('data-url'),
                flowUrl = $elem.attr('data-flow-url');
            var param = {};

            if(validate()) {
                param.list = getSubmitData();
                param.uuId = $('input[name=uuId]').val();
                param.instanceId = $('input[name=instanceId]').val();
                if(!param.list.length) {
                    Dialog.errorDialog("暂无可提交数据，请先填写!");
                    return false;
                }
                Dialog.formDialog({
                    title: '费用说明',
                    content: getFeeDescDialogHtml(),
                    success: function (layero, index) {

                        form.on('submit(bind)', function(data) {
                            var desc = layero.find('.desc').val();
                            param.desc = desc;

                            Flow.handleFlowByJSON(flowUrl, url, param, function () {
                                layer.close(index);
                            });

                            return false;
                        })
                    }
                });
            }

            return false;
        })
    });
});