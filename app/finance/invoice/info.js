/**
 * 财务-开票-详情
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'laydate', 'Common', 'Pager'], function() {
    var $ = layui.jquery,
        form = layui.form,
        laydate = layui.laydate,
        element = layui.element;
    var Common = layui.Common;
    var Pager = layui.Pager;
    var Req = layui.Req;
    var Dialog = layui.Dialog;

    function renderDatebox() {
        lay('.datebox').each(function(){
            laydate.render({
                elem: this,
                trigger: 'click',
                btns: ['clear', 'now']
            });
        });
    }

    function addRow($tr) {
        var html ='<tr>' +
            '<td><input type="text" class="layui-input text-160" lay-verify="required" name="invoice_code[]"></td>' +
            '<td><input type="text" class="layui-input text-160" lay-verify="required" name="invoice_number[]"></td>' +
            '<td><input type="text" class="layui-input text-160" lay-verify="required|onlyDecmal9" name="invoice_amount[]"></td>' +
            '<td><input type="text" class="layui-input text-160 datebox" lay-verify="required" name="invoice_date[]"></td>' +
            '<td>' +
                '<a href="javascript:;" class="c-link addInvoiceRow mr-10 ml-10 uline-hover">增加一行</a>' +
                '<a href="javascript:;" class="c-link ml-10 delInvoiceRow">删除</a>' +
            '</td>' +
            '</tr>';
        $tr.after(html);
    }

    function updateTotalInvoice () {
        var $invoice_amounts = $('input[name^="invoice_amount"]'),
            total = 0;
        $invoice_amounts.each(function(i, o) {
            var curAmount = (isNaN($(o).val()) || $(o).val() == '') ? 0 : parseFloat($(o).val());
            total = Common.Util.accAdd(total, curAmount);
        });
        $('.totalInvoice').text(total);
    }

    function getInvoiceReturnDialogHtml() {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item">' +
                                '<div style="margin-bottom: 10px;">开票退回原因说明</div>' +
                                '<div>' +
                                    '<textarea placeholder="请填写500字以内的原因说明" lay-verify="required" maxlength="500"  lay-reqText="请填写开票退回原因" class="layui-textarea" name="reason"></textarea>' +
                                '</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    function replaceSerializeName() {
        var $invoiceCodes = $('input[name^=invoice_code]');
        var $invoiceNumbers = $('input[name^=invoice_number]');
        var $invoiceAmounts = $('input[name^=invoice_amount]');
        var $invoiceDates = $('input[name^=invoice_date]');

        $invoiceCodes.each(function (i, o) {
            Common.Util.replaceSerializeName($(o));
        });
        $invoiceNumbers.each(function (i, o) {
            Common.Util.replaceSerializeName($(o));
        });
        $invoiceAmounts.each(function (i, o) {
            Common.Util.replaceSerializeName($(o));
        });
        $invoiceDates.each(function (i, o) {
            Common.Util.replaceSerializeName($(o));
        });
    }

    function checkAmount() {
        var flag = false;
        var invoiceAmount = parseFloat($('input[name=invoiceAmount]').val()),
            totalInvoice = parseFloat($('.totalInvoice').text());
        if(Common.Util.accSub(invoiceAmount, totalInvoice) == 0) {
            flag = true;
        }
        return flag;
    }

    function doSubmit(url, param) {
        Req.postReq(url, param, function (res) {
            if (!res.status) {
                Dialog.errorDialog(res.msg);
            } else {
                if(res.status == '2') {
                    Dialog.confirmDialog({
                        title: '操作提示',
                        content: res.msg,
                        btn: ['我知道了'],
                        yesFn: function (index, layero) {
                            if(res.data.url) {
                                window.location.href = res.data.url;
                            }
                        }
                    });
                } else {
                    Dialog.successDialog(res.msg, function () {
                        if (res.data.url) {
                            window.location.href = res.data.url;
                        } else {
                            window.location.reload();
                        }
                    });
                }
            }
        });
    }

    function init() {
        renderDatebox();
    }

    $(function() {
        init();

        // 增加一行
        $(document).on('click', '.addInvoiceRow', function() {
            var $curTr = $(this).parents('tr');

            addRow($curTr);
            renderDatebox();
        });

        // 删除一行
        $(document).on('click', '.delInvoiceRow', function() {
            var $tbody = $('.totalTr').parents('tbody'),
                $curTr = $(this).parent().parent();
            if($tbody.find('tr').length == 2) {
                Dialog.errorDialog('开票数据至少要保留一行');
                return false;
            }
            $curTr.remove();
            updateTotalInvoice();
        });

        $(document).on('change', 'input[name^="invoice_amount"]', function() {
            updateTotalInvoice();
        });

        // 开票申请-提交
        form.on('submit(saveSubmit)', function (data) {
            var $elem = $(data.elem),
                url = $elem.attr('data-url');

            replaceSerializeName();
            var $form = $('form'),
                param = $form.serializeArray();
            if(!checkAmount()) {
                Dialog.confirmDialog({
                    title: '操作确认',
                    content: '本次登记的发票合计金额与申请金额不一致，确认要继续提交吗？',
                    yesFn: function () {
                        doSubmit(url, param);
                    }
                });
            } else {
                doSubmit(url, param);
            }
            return false;
        });

        // 退回修改
        $(document).on('click', '#invoiceReturn', function() {
            var url = $(this).attr('data-url');
            Dialog.formDialog({
                title: '退回修改',
                content: getInvoiceReturnDialogHtml(),
                success: function (layero, index) {
                    form.on('submit(bind)', function(data) {
                        var $form = layero.find('form'),
                            param = $form.serializeArray();

                        Req.postReq(url, param, function (res) {
                            if(!res.status) {
                                Dialog.errorDialog(res.msg);
                            } else {
                                if(res.status == '2') {
                                    Dialog.confirmDialog({
                                        title: '操作提示',
                                        message: res.msg,
                                        btn: ['我知道了'],
                                        yesFn: function(index, layero) {
                                            if(res.data.url) {
                                                window.location.href = res.data.url;
                                            }
                                        }
                                    })
                                } else {
                                    Dialog.successDialog(res.msg, function () {
                                        if (res.data.url) {
                                            window.location.href = res.data.url;
                                        } else {
                                            window.location.reload();
                                        }
                                    });
                                }
                            }
                        });
                        return false;
                    })
                }
            });
        });

        // 确认发票作废
        $(document).on('click', '.ajaxVoid', function() {
            var url = $(this).attr('data-url');
            Dialog.confirmDialog({
                title: '发票作废',
                content: '发票作废前请确认本次开具出的发票全部已回收？',
                yesFn: function (index, layero) {
                    Req.getReq(url, function (res) {
                        if(res.status) {
                            if(res.status == '2') {
                                Dialog.confirmDialog({
                                    title: '操作提示',
                                    content: res.msg,
                                    btn: ['我知道了'],
                                    yesFn: function (index, layero) {
                                        if(res.data.url) {
                                            window.location.href = res.data.url;
                                        }
                                        layer.close(index);
                                    }
                                });
                            } else {
                                Dialog.successDialog(res.msg, function () {
                                    if(res.data.url) {
                                        if (res.data.url) {
                                            window.location.href = res.data.url;
                                        } else {
                                            window.location.reload();
                                        }
                                    }
                                });
                            }
                        } else {
                            Dialog.errorDialog(res.msg);
                        }
                    })
                }
            });
        });

        form.on('select(companyId)', function (data) {
            var $elem = $(data.elem),
                $curDl = $elem.parents('dl'),
                curCompName = $elem.find('option:selected').text();
            var $companyNameInput = $curDl.find('.companyName');
            if(curCompName == '请选择') {
                curCompName = '';
            }
            $companyNameInput.val(curCompName);
        });

        // 开票-待确认（提交）
        form.on('submit(waitSubmit)', function (data) {
            var $elem = $(data.elem),
                url = $elem.attr('data-url');
            var param = $('form').serializeArray();

            Req.postReq(url, param, function (res) {
                if(res.status) {
                    if(res.status == '2') {
                        Dialog.confirmDialog({
                            title: '操作提示',
                            content: res.msg,
                            btn: ['我知道了'],
                            yesFn: function (index, layero) {
                                if(res.data.url) {
                                    window.location.href = res.data.url;
                                }
                                layer.close(index);
                            }
                        });
                    } else {
                        Dialog.successDialog(res.msg, function () {
                           if(res.data.url) {
                               if (res.data.url) {
                                   window.location.href = res.data.url;
                               } else {
                                   window.location.reload();
                               }
                           }
                        });
                    }
                } else {
                    Dialog.errorDialog(res.msg);
                }
            });
        });
    });
});