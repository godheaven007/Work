/**
 * 财务-回款-列表
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'laydate', 'Common', 'Pager', 'Regex','upload', 'MUpload', 'ListModule'], function() {
    var $ = layui.jquery,
        form = layui.form,
        laydate = layui.laydate,
        element = layui.element;
    var Common = layui.Common;
    var Pager = layui.Pager;
    var Req = layui.Req;
    var Dialog = layui.Dialog;
    var MUpload = layui.MUpload;
    var ListModule = layui.ListModule;

    function init() {

        ListModule.init(function () {
            $('#selectAll').prop('checked', false);
            form.render();
        });
    }

    // 撤销对账
    function getCancelBalanceDialogHtml() {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label">撤销原因</label>' +
                                '<div class="layui-input-block">' +
                                    '<textarea placeholder="请填写500字以内..." lay-verify="required" maxlength="500" lay-reqText="请填写撤销原因" class="layui-textarea" name="reason"></textarea>' +
                                '</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    // 退回修改
    function getRefuseCheckDialogHtml() {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label"><span class="c-orange">* </span>退回原因</label>' +
                                '<div class="layui-input-block">' +
                                    '<textarea placeholder="请填写30字以内" lay-verify="required" maxlength="30"  lay-reqText="请填写退回原因" class="layui-textarea" name="reason" id="refuseReason"></textarea>' +
                                '</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    // 获取对账明细
    function getBalanceInfo(list, viewContractUrl) {
        var subjectHtml = '';
        if(list.length) {
            for(var i = 0; i < list.length; i++) {
                var subList = list[i];
                for(var j = 0; j < subList.checkTos.length; j++) {
                    subjectHtml += '<tr>' +
                            '<td class="txt-c" style="width: 20%;">'+ subList.acCustomerName +'</td>' +
                            '<td class="txt-c" style="width: 20%;">'+ subList.acProjectName +'</td>' +
                            '<td class="txt-c" style="width: 20%;">'+ subList.checkTos[j].checkSubName +'</td>' +
                            '<td class="txt-c" style="width: 20%;">'+ subList.checkTos[j].checkSubAmount +'</td>';
                    if(subList.checkTos[j].checkCustomerId && subList.checkTos[j].checkCustomerType == 'ibs') {
                        subjectHtml += '<td class="txt-c" style="width: 20%;"><a class="c-link" target="_blank" href="'+ viewContractUrl + subList.checkTos[j].checkCustomerId +'">查看合同</a></td>';
                    } else {
                        subjectHtml += '<td class="txt-c" style="width: 20%;">-</td>';
                    }
                    subjectHtml +=
                        '</tr>';
                }
            }
        }
        return subjectHtml;
    }

    function getLogInfo(list) {
        var _html = '';
        list.forEach(function (item, index) {
            _html += '<tr>' +
                '<td class="txt-c" style="width: 25%;">'+ Common.Util.dateFormat(new Date(item.revokeOperatorDate), 'yyyy-MM-dd') +'</td>' +
                '<td class="txt-c" style="width: 25%;">'+ item.revokeOperator +'</td>' +
                '<td class="txt-c" style="width: 25%;">对账撤销</td>' +
                '<td class="txt-c" style="width: 25%;">'+ item.revokeExplain +'</td>' +
                '</tr>';
        });
        return _html;
    }

    // 对账复核
    function getToCheckDialogHtml(data, list, viewContractUrl) {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label">到账金额：</label>' +
                                '<div class="layui-input-block">' +
                                    '<div class="layui-form-mid"><span style="color:#f00;">'+ data.paymentAmount +'元</span></div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label">对账人：</label>' +
                                '<div class="layui-input-block">' +
                                    '<div class="layui-form-mid">'+ data.checkName +'</div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label">对账时间：</label>' +
                                '<div class="layui-input-block">' +
                                    '<div class="layui-form-mid">'+ data.checkDate +'</div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="title-02">对账明细</div>' +
                            '<div class="clearfix"></div>' +
                            '<div>' +
                                '<table class="layui-table">' +
                                    '<thead>' +
                                        '<tr>' +
                                            '<td class="txt-c" style="width: 20%;">归属客户</td>' +
                                            '<td class="txt-c" style="width: 20%;">归属项目</td>' +
                                            '<td class="txt-c" style="width: 20%;">归属科目</td>' +
                                            '<td class="txt-c" style="width: 20%;">归属金额(元)</td>' +
                                            '<td class="txt-c" style="width: 20%;">操作</td>' +
                                        '</tr>' +
                                    '</thead>' +
                                '</table>' +
                            '</div>' +
                            '<div class="tableBox" style="margin-top: -6px;">' +
                                '<table class="layui-table">' +
                                    '<tbody>' +
                                        getBalanceInfo(data.checkJson, viewContractUrl) +
                                    '</tbody>' +
                                '</table>' +
                            '</div>';
        if(list.length) {
            _html += '<div class="title-02">对账撤销记录</div>' +
                    '<div class="clearfix"></div>' +
                    '<div>' +
                        '<table class="layui-table">' +
                            '<thead>' +
                                '<tr>' +
                                    '<td class="txt-c" style="width: 25%;">操作时间</td>' +
                                    '<td class="txt-c" style="width: 25%;">操作人员</td>' +
                                    '<td class="txt-c" style="width: 25%;">操作类型</td>' +
                                    '<td class="txt-c" style="width: 25%;">操作说明</td>' +
                                '</tr>' +
                            '</thead>' +
                        '</table>' +
                    '</div>' +
                    '<div class="tableBox" style="margin-top: -6px;">' +
                        '<table class="layui-table">' +
                            '<tbody>' +
                                getLogInfo(list) +
                            '</tbody>' +
                        '</table>' +
                    '</div>'
        }
        _html +=
                        '</form>' +
                    '</div>';
        return _html;
    }


    $(function() {

        init();

        // 删除对账登记信息
        $(document).on('click', '.delBalance', function() {
            var url = $(this).attr('data-url');
            Dialog.confirmDialog({
                title: '删除确认',
                content: '对账数据删除后不再显示，确认要删除此条对账吗？',
                yesFn: function (index, layero) {
                    Req.getReqCommon(url);
                }
            })
        });

        // 撤销对账
        $(document).on('click', '.cancelBalance', function() {
            var url = $(this).attr('data-url'),
                checkUrl = $(this).attr('data-check-url');
            if(!!checkUrl) {
                Req.getReq(checkUrl, function (res) {
                    if(res.status) {
                        Dialog.formDialog({
                            title: '撤销对账',
                            content: getCancelBalanceDialogHtml(),
                            success: function (layero, index) {
                                form.on('submit(bind)', function(data) {
                                    var $form = layero.find('form'),
                                        param = $form.serializeArray();

                                    Req.postReq(url, param, function (result) {
                                       if(result.status) {
                                           Dialog.successDialog(result.info, function () {
                                               if(result.data.url) {
                                                   window.location.href = result.data.url;
                                               } else {
                                                   window.location.reload();
                                               }
                                           });
                                       } else {
                                           Dialog.confirmDialog({
                                               title: '友情提醒',
                                               content: result.info,
                                               btn: ['我知道了'],
                                               yesFn: function (index, layero) {
                                                   layer.close(index);
                                               }
                                           })
                                       }
                                    });
                                    return false;
                                })
                            }
                        })
                    } else {
                        Dialog.confirmDialog({
                            title: '撤销对账',
                            content: res.info,
                            btn: ['确定'],
                            yesFn: function (index, layero) {
                                layer.close(index);
                            }
                        })
                    }
                })
            }
        });

        // 对账复核
        $(document).on('click', '.toCheck', function() {
            var data = {}, $o = $(this);
            data.paymentAmount =  $o.attr('data-payment-amount');
            data.projectName = $o.attr('data-project-name');
            data.customerName = $o.attr('data-customer-name');
            data.checkName = $o.attr('data-check-name');
            data.checkDate = $o.attr('data-check-date');
            data.uuId = $(this).attr('data-uuid');
            data.url = $(this).attr('data-url');
            var checkJson = $o.attr('data-check-json');
            data.checkJson = JSON.parse(checkJson);

            var showLogUrl = $o.attr('data-show-log-url');
            var viewContractUrl= $o.attr('data-view-contract-url');
            Req.getReq(showLogUrl, function (res) {
                if(res.status) {
                    layer.open({
                        title: '对账复核',
                        area: ['680px', 'auto'],
                        content: getToCheckDialogHtml(data, res.data.lists, viewContractUrl),
                        btn: ['通过复核', '退回修改'],
                        yes: function(index, layero){
                            Dialog.confirmDialog({
                                id: 100151,
                                title: '财务复核',
                                content: '确认以上对账信息正确无误吗？',
                                yesFn: function (ind, lay) {
                                    var param = {uuId: data.uuId, status: 2, remark: ''};

                                    Req.postReq(data.url, param, function (res) {
                                        if (res.status) {
                                            Dialog.successDialog(res.msg, function() {
                                                if (res.data.url) {
                                                    window.location.href = res.data.url;
                                                } else {
                                                    window.location.reload();
                                                }
                                            });
                                        } else {
                                            Dialog.errorDialog(res.msg);
                                        }
                                    });
                                    return false;
                                }
                            });
                            return false;
                        },
                        btn2: function(index, layero){
                            //按钮【按钮二】的回调
                            Dialog.formDialog({
                                title: '退回修改',
                                content: getRefuseCheckDialogHtml(),
                                success: function (layero, index) {
                                    var $form = layero.find('form'),
                                        param = $form.serializeArray();

                                    form.on('submit(bind)', function (d) {
                                        var remark = layero.find('#refuseReason').val();
                                        Req.postReqCommon(data.url, {
                                            uuId: data.uuId,
                                            status: 3,
                                            remark: remark
                                        })
                                        return false;
                                    });
                                }
                            });
                            return false;
                        }
                    });
                }
            });
        });

        // 批量复合
        $(document).on('click', '.selectAll', function() {
            var $selectedBox = $('.selectcheckbox:checked');
            if(!$selectedBox.length) {
                Dialog.errorDialog('至少选择一条复核数据');
                return false;
            }

            var url = $('.toCheck').attr('data-url'),
                data = [];

            $.each($selectedBox, function(index, obj) {
                data.push($(obj).val())
            });

            Dialog.confirmDialog({
                title: '财务复核',
                content: '确认以上对账信息正确无误吗？',
                yesFn: function (index, layero) {
                    var param = {
                        uuId: data.join(','),
                        status: 2,
                        remark: ''
                    };
                    Req.postReqCommon(url, param)
                }
            });
        });

        // 全选
        form.on('checkbox(layTableAllChoose)', function (data) {
            var $boxes = $('.selectcheckbox');

            var status = data.elem.checked;
            if(status) {
                $boxes.prop('checked', true);
            } else {
                $boxes.prop('checked', false);
            }
            form.render();
        });

        // 单选
        form.on('checkbox(layTableChoose)', function (data) {
            var allSize = $('.selectcheckbox').length,
                selectedSize = $('.selectcheckbox:checked').length;

            if(selectedSize == allSize) {
                $('#selectAll').prop('checked', true);
            } else {
                $('#selectAll').prop('checked', false);
            }
            form.render();
        });


        // 导出
        $(document).on('click', '.financeExport', function (e) {
            e.preventDefault();
            var url = $(this).attr('data-url'),
                key = $(this).attr('data-key');

            var param = ListModule.getSplitParam();
            param.key = key;
            param.subIdKey = $('select[name=subId]').next('.layui-form-select').find('input').val();

            if(!param.beginDate && !param.endDate) {
                param.dateExist = 0;
                var curDate = Common.Util.dateFormat(new Date(new Date().getTime()), 'yyyy-MM-dd');
                param.beginDate = Common.Util.getNextDate(curDate, 30, true);
                param.endDate = curDate;
                Dialog.confirmDialog({
                    title: '数据导出',
                    content: '当前默认导出最近30天内的到账数据，如果导出日期超过30天时，请选择具体的到账日期再操作',
                    yesFn: function (index, layero) {
                        Req.postReq(url, param, function (res) {
                            if(res.status) {
                                layer.close(index);
                                Dialog.downloadDialog({
                                    downloadUrl: res.data.url
                                });
                            } else {
                                Dialog.errorDialog(res.msg);
                            }
                        });
                    }
                })
            } else {
                param.dateExist = 1;
                Req.postReq(url, param, function (res) {
                    if(res.status) {
                        Dialog.downloadDialog({
                            downloadUrl: res.data.url
                        });
                    } else {
                        Dialog.errorDialog(res.msg);
                    }
                });
            }
        });
    });
});