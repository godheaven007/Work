/**
 * 财务-开票-待开票-批量登记发票
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common'], function() {
    var $ = layui.jquery,
        form = layui.form,
        laydate = layui.laydate,
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var Dialog = layui.Dialog;

    function init() {}

    // 含税总金额
    function getTotalAmount() {
        var $ajaxDel = $('.ajaxDel');
        var sum = 0;

        $ajaxDel.each(function(i, o) {
            var curAmount = parseFloat($(o).attr('data-amount'));
            sum = Common.Util.accAdd(sum, curAmount);
        });

        return sum;
    }

    // 财务导入已开发票数据更新
    function updateTotalAmount($target, callback) {
        var $curTr = $target.parent().parent();

        var $tbody = $('.ajaxTableTbody'),
            $totalRecord = $('.totalRecord'),
            // $totalAmount = $('.totalAmount').eq(0),
            curAmount = $target.attr('data-amount') ? parseFloat($target.attr('data-amount')) : 0,
            trSize = $tbody.find('tr').length - 1;

        $totalRecord.text(parseInt(trSize) - 1);

        // var totalAmount = parseFloat($totalAmount.text().replace(/,/g, ''));
        var totalAmount = getTotalAmount(),
            lastTotalAmount = parseFloat(Common.Util.accSub(curAmount, totalAmount));

        $('.totalAmount').text(lastTotalAmount.toFixed(2));

        $curTr.remove();

        if(callback && Object.prototype.toString.call(callback) == '[object Function]') {
            callback();
        }
    }

    function renderHandle(invoiceData) {
        var customerListUrl = $('#customerList').val();
        Req.getReq(customerListUrl, function (res) {
            if(res.status) {
                renderManual(invoiceData, res.data.data);
            } else {
                Dialog.errorDialog(res.msg);
            }
        });
    }

    // 手工匹配完成回填数据
    function matchBackFill(key, invoiceId, customerName, billNo, version) {

        var $invoiceInput = $('input[name="invoiceId['+ key +']"]');
        if($invoiceInput.val()) {
            // 自动匹配成功
        } else {
            // 图标
            var $icon = $('input[name="invoiceType['+ key +']"]').prev();
            $icon.removeClass('c-gray-light');
            $icon.addClass('c-green');
        }


        $('input[name="invoiceId['+ key +']"]').val(invoiceId);

        // 客户名称
        var $customerName = $('input[name="customerName['+ key +']"]');
        $customerName.val(customerName);
        var customerNameHtml = $customerName.prop('outerHTML');
        var $customerNameParent = $customerName.parent();
        $customerNameParent.html(customerName + customerNameHtml);

        // 单据编号
        var $documentNo = $('input[name="documentNumber['+ key +']"]');
        $documentNo.val(billNo);
        var documentNoHtml = $documentNo.prop('outerHTML');
        var $documentNoParent = $documentNo.parent();
        $documentNoParent.html(billNo + documentNoHtml);

        // version
        var $version = $('input[name="version['+ key +']"]');
        $version.val(version);
    }

    function getRelatedCustomerOpts(customerName, relatedCustomerArr) {
        var opts = '<option value="">请选择</option>';
        relatedCustomerArr.forEach(function (item, index) {
            if(item == customerName) {
                opts += '<option value="'+ item +'" selected>'+ item +'</option>';
            } else {
                opts += '<option value="'+ item +'">'+ item +'</option>';
            }
        });
        return opts;
    }

    function getManualDialogHtml(invoiceData, customerName, relatedCustomerArr) {
        var _html = '<div class="layui-card-body" style="height: 480px; overflow-y: scroll;">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item label-l" style="margin-bottom: 5px">' +
                                '<label class="layui-form-label text-w-100">发票代码：</label>' +
                                '<div class="layui-form-mid">'+ invoiceData.invoiceCode +'</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l" style="margin-bottom: 5px">' +
                                '<label class="layui-form-label text-w-100">发票号码：</label>' +
                                '<div class="layui-form-mid">'+ invoiceData.invoiceNum +'</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l" style="margin-bottom: 5px">' +
                                '<label class="layui-form-label text-w-100">购方企业：</label>' +
                                '<div class="layui-form-mid">'+ invoiceData.company +'</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l" style="margin-bottom: 5px">' +
                                '<label class="layui-form-label text-w-100">含税金额：</label>' +
                                '<div class="layui-form-mid">'+ invoiceData.amount +'</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l" style="margin-bottom: 5px">' +
                                '<label class="layui-form-label text-w-100">开票日期：</label>' +
                                '<div class="layui-form-mid">'+ invoiceData.markDate +'</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">关联客户：</label>' +
                                '<div class="layui-input-inline text-w-250">' +
                                    '<select name="customerName" id="customerName" lay-filter="customerName">' +
                                        getRelatedCustomerOpts(customerName, relatedCustomerArr) +
                                    '</select>' +
                                '</div>' +
                            '</div>' +
                            '<div style="height: 40px; position: relative;">' +
                                '<h1 style="width: 140px; background-color:#fff; position: absolute; left: 50%; margin-left: -70px; font-size: 16px; z-index: 20;">可选择的开票申请</h1>'+
                                '<div style="position: absolute; bottom: 28px; left: 0; background-color:#eee; width: 100%; height: 1px; z-index: 10;"></div>' +
                            '</div>'+
                            '<div class="wrap">' +


                            '</div>'+

                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    // 暂无可选择的记录
    function hasRecord(data) {
        var len = data.length,
            sum = 0;
        data.forEach(function(item, i) {
            if(item.status == '1' && Object.prototype.toString.call(item.matchedInvoiceDetailList) == '[object Array]'
                && item.matchedInvoiceDetailList.length) {
                sum = sum + 1;
            }
        });

        return sum;
    }

    // 设置关联金额
    function setRelateAmount(amount, param, checked) {
        // if(!!checked) {
        //     return Util.accAdd(amount, param.amount);
        // }
        return amount;
    }

    // 渲染关联客户
    function renderRelatedCustomerList(list, param, layero) {
        var _html = '',
            invoiceId = param.invoiceId,
            invoiceList = list.invoiceExcelInfoByCustomerNameList;

        if(hasRecord(invoiceList)) {
            // 有匹配数据
            invoiceList.forEach(function(item, index) {
                if(!!item.matchedInvoiceDetailList) {
                    var isChecked = item.invoiceId == invoiceId ? "checked" : '';

                    if(item.status == '1') {
                        _html += '<dl class="popup-invoice">'+
                                    '<dt>' +
                                        '<input type="radio" name="apply" class="vm" data-version="'+ item.version +'" data-billno="'+ item.invoiceBillNum +'" data-relatedmoney="'+ setRelateAmount(item.relateAmount, param, isChecked) +'" value="'+ item.invoiceId +'" '+ isChecked +'>' +
                                    '</dt>'+
                                    '<dd>';
                        if(item.invoiceMakeType == '2') {
                            // 预开票申请图标
                            _html += '<div class="ico-stamp stamp-invoice2"></div>';
                        }

                        item.matchedInvoiceDetailList.forEach(function(curDetail, idx) {
                            _html += '<div class="row">'+
                                        '<span class="title txt-ellipsis" title="'+ curDetail.financeSubject +'">'+ curDetail.financeSubject +'：</span>'+
                                        '<span class="info">¥ '+ curDetail.subjectAmount;
                            if(item.invoiceMakeType == '2') {

                            } else {
                                _html += '<span class="float-r">到账时间：'+ curDetail.invoiceApplyDateString +'</span>';
                            }
                            _html +=
                                         '</span>'+
                                    '</div>';
                        });

                    _html +=        '<div class="row c-orange">'+
                                        '<span class="title txt-ellipsis">可关联金额：</span>'+
                                        '<span class="info">¥ '+ item.relateAmountDisplay +'</span>'+
                                    '</div>'+
                                    '<div class="row c-gray-light">'+
                                        '<span class="title txt-ellipsis">申请人：</span>'+
                                        '<span class="info">'+ item.invoiceApplyOperator +'<span class="ml-20">'+ item.invoiceApplyDateString +'</span></span>'+
                                    '</div>'+
                                    '</dd>'+
                                '</dl>';
                    }
                }
            });
        } else {
            // 无匹配数据
            _html += '<div class="row txt-c c-gray-light">暂无可选择的记录</div>';
        }
        layero.find('.wrap').html(_html);
        form.render(null, 'formDialog');
    }

    // 获取关联客户数据
    function getRelatedCustomerData(param, layero) {
        var customerDataUrl = $('#getCustomerListByUserId').val();
        var queryObj = {
            companyName: param.customerName,
            amount: param.amount,
            invoiceId: param.invoiceId
        };

        Req.postReq(customerDataUrl, queryObj, function (res) {
            if(res.status) {
                renderRelatedCustomerList(res.data.data[0], param, layero);
            } else {
                Dialog.errorDialog(res.msg);
            }
        });
    }

    // 手工匹配
    function renderManual(invoiceData, relatedCustomerArr) {
        var key = invoiceData.key,
            matchUrl = invoiceData.matchUrl,
            amount = invoiceData.amount,
            originAmount = invoiceData.originAmount,
            oldInvoiceId = $('input[name="invoiceId['+ key +']"]').val(),
            customerName = $('input[name="customerName['+ key +']"]').val();

        var param = {
            invoiceId: oldInvoiceId,
            amount: originAmount,
            customerName: customerName
        };

        Dialog.formDialog({
            title: '手工匹配发票',
            content: getManualDialogHtml(invoiceData, customerName, relatedCustomerArr),
            area: ['620px', '600px'],
            success: function (layero, index) {
                form.render(null, 'formDialog');

                // 已匹配的发票
                if(customerName && oldInvoiceId) {
                    getRelatedCustomerData(param, layero);
                }

                form.on('select(customerName)', function (data) {
                    layero.find('.wrap').html('');
                    if(data.value) {
                        param.customerName = data.value;
                        getRelatedCustomerData(param, layero);
                    }
                });

                form.on('submit(bind)', function () {
                    var $apply = layero.find('input[name=apply]'),
                        $applySlt = layero.find('input[name=apply]:checked');
                    if(!$apply.length) {
                        Dialog.errorDialog('暂无可选择的开票申请');
                        return false;
                    }
                    if(!$applySlt.length) {
                        Dialog.errorDialog('未选择开票申请');
                        return false;
                    }

                    // 发票金额 > 可关联金额
                    var relatedAmount = $applySlt.attr('data-relatedmoney');
                    if(Common.Util.accSub(parseFloat(relatedAmount), invoiceData.originAmount) > 0) {
                        Dialog.confirmDialog({
                            title: '操作提示',
                            btn: ['我知道了'],
                            content: '当前发票金额已超出开票申请金额，请重新选择',
                            yesFn: function (index, layero) {
                                layer.close(index);
                            }
                        });
                        return false;
                    }

                    var customerName = layero.find('#customerName').find('option:selected').val(),
                        billNo = $applySlt.attr('data-billno'),
                        version = $applySlt.attr('data-version'),
                        relatedAmount = $applySlt.attr('data-relatedmoney'),
                        newInvoiceId = $applySlt.val();

                    var queryObj = {
                        amount: invoiceData.originAmount,
                        relatedAmount: relatedAmount,
                        invoiceId: newInvoiceId,
                        oldInvoiceId: oldInvoiceId
                    };

                    Req.postReq(matchUrl, queryObj, function (res) {
                        if(res.status) {
                            matchBackFill(key, newInvoiceId, customerName, billNo, version);
                            layer.close(index);
                        } else {
                            Dialog.errorDialog(res.msg);
                        }
                    });
                    return false;
                })
            }
        });
    }

    function getBatchImportDialogHtml(list) {
        var _html = '<div class="layui-card-body" style="max-height: 320px; overflow-y: scroll;">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                        '<div>发票数据上传失败，失败原因：开票申请已被关联（或没有登记发票的权限）</div>' +
                        '<table class="layui-table">' +
                            '<colgroup>' +
                                '<col width="50%">' +
                                '<col width="50%">' +
                            '</colgroup>'+
                            '<thead>' +
                                '<tr>' +
                                    '<th class="txt-c">发票代码</th>' +
                                    '<th class="txt-c">发票号码</th>' +
                                '</tr>' +
                            '</thead>' +
                            '<tbody class="tbody">';
                                for(var i = 0, len = list.length; i < len; i++) {
                                    _html += '<tr>' +
                                                '<td class="txt-c" width="50%">'+ list[i].invoiceCode +'</td>' +
                                                '<td class="txt-c" width="50%">'+ list[i].invoiceNum +'</td>' +
                                             '</tr>';
                                }
                        _html +=
                            '</tbody>'+
                        '</table>'+
                        '<!--写一个隐藏的btn -->' +
                        '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                        '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    // 批量导入提醒
    function batchImportTip(list, url) {
        Dialog.confirmDialog({
            title: '批量导入发票提醒',
            content: getBatchImportDialogHtml(list),
            area:['580px', 'auto'],
            btn: ['我知道了'],
            success: function (layero, index) {},
            yesFn: function (index, layero) {
                if(url) {
                    window.location.href = url;
                } else {
                    layer.close(index);
                    // window.location.reload();
                }
            }
        })
    }

    $(function() {

        init();

        // 删除发票
        $(document).on('click', '.ajaxDel', function() {
            var $target = $(this),
                // invoiceId = $target.attr('data-invoice-id'),
                key = $target.attr('data-id'),
                invoiceId = $('input[name="invoiceId['+ key +']"]').val(),
                amount = $(this).attr('data-amount'),
                url = $target.attr('data-url');

            Dialog.confirmDialog({
                title: '删除确认',
                content: '确认要删除导入的此条发票数据吗？',
                success: function () {},
                yesFn: function (index, layero) {
                    if(!!invoiceId) {
                        // 真删除
                        url = url + '&invoiceId=' + invoiceId + '&amount=' + amount;
                        Req.getReq(url, function (res) {
                            if(res.status) {
                                updateTotalAmount($target);
                                layer.close(index);
                            } else {
                                Dialog.errorDialog(res.msg);
                            }
                        })
                    } else {
                        updateTotalAmount($target);
                        layer.close(index);
                    }
                }
            });
        });

        // 手工匹配
        $(document).on('click', '.ajaxManual', function() {
            var invoiceCode = $(this).attr('data-invoice-code'),
                invoiceNum = $(this).attr('data-invoice-num'),
                amount = $(this).attr('data-amount'),
                originAmount = $(this).attr('data-orgin-amount'),
                markDate = $(this).attr('data-mark-date'),
                documentNumber = $(this).attr('data-document-number') == '' ? 0 : $(this).attr('data-document-number'),
                company = $(this).attr('data-company'),
                matchUrl = $(this).attr('data-url'),
                key = $(this).attr('data-key');

            var invoiceData = {
                invoiceCode: invoiceCode,
                invoiceNum: invoiceNum,
                amount: amount,
                originAmount: originAmount,
                markDate: markDate,
                documentNumber: documentNumber,
                company: company,
                matchUrl: matchUrl,
                key: key
            };
            renderHandle(invoiceData);
        });


        form.on('submit(saveSubmit)', function (data) {
            var $elem = $(data.elem),
                url = $elem.attr('data-url');
            var $form = $('form'),
                param = $form.serializeArray();

            Req.postReq(url, param, function (res) {
                if(res.status) {
                    if(res.status == '2') {
                        batchImportTip(res.data.operateCompanyList, res.data.url);
                    } else {
                        Dialog.successDialog(res.msg, function () {
                           if(res.data.url) {
                               window.location.href = res.data.url;
                           } else {
                               window.location.reload();
                           }
                        });
                    }
                } else {
                    Dialog.errorDialog(res.msg);
                }
            });
        })
    });
});