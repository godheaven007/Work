/**
 * 招商-列表
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Pager', 'Common', 'OTree', 'ListModule'], function() {
    var $ = layui.jquery,
        form = layui.form,
        element = layui.element;
    var Common = layui.Common;
    var Pager = layui.Pager;
    var Req = layui.Req;
    var Dialog = layui.Dialog;
    var ListModule = layui.ListModule;
    var OTree = layui.OTree;
    var deptMemberList = [];      // 部门成员

    function loadDeptMemberList() {
        var url = $('#deptListAjaxUrl').val();
        Req.getReq(url, function(res) {
            if(res.status) {
                deptMemberList = res.data.data;
            }
        });
    }

    // 转移客户
    function getTransferDialogHtml() {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label text-w-120">转移选中的客户给</label>' +
                                '<div class="layui-input-inline text-w-250">' +
                                    '<input type="text" name="transferName" readonly placeholder="选择人员" lay-verify="required"  lay-reqText="选择人员" autocomplete="off" class="layui-input" >'+
                                    '<input type="hidden" name="transferId">' +
                                '</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    function init() {
        loadDeptMemberList();

        ListModule.init(function () {
            $('#selectAll').prop('checked', false);
            form.render();
        });
    }

    $(function() {
        init();

        // 转移客户
        $(document).on('click', '.ajaxMoveCustomer', function() {
            var url = $(this).attr('data-url'),
                $selectedCustomers = $('.selectcheckbox:checked'),
                result = [];
            if(!$selectedCustomers.length) {
                Dialog.errorDialog('请至少选中一条客户记录');
                return false;
            } else {
                $selectedCustomers.each(function (i, o) {
                    result.push($(o).val());
                })
            }
            if(deptMemberList.length) {
                Dialog.formDialog({
                    title: '客户转移',
                    content: getTransferDialogHtml(),
                    success: function (layero, index) {
                        form.render(null, 'formDialog');

                        var $transferName = layero.find('input[name=transferName]'),
                            $transferId = layero.find('input[name=transferId]');

                        $transferName.click(function () {
                            if (!$transferId.val()) {
                                // 未添加过
                                OTree({
                                    type: false,
                                    data: deptMemberList,
                                    callback: function (instance) {
                                        $transferName.val(instance.eidTextArr.join(','));
                                        $transferId.val(instance.eidArr.join(','));
                                        instance.removeEventListener();
                                        instance.$tree.remove();
                                    },
                                    zIndex: 99999999
                                });
                            } else {
                                OTree({
                                    type: false,
                                    data: deptMemberList,
                                    callback: function (instance) {
                                        $transferName.val(instance.eidTextArr.join(','));
                                        $transferId.val(instance.eidArr.join(','));
                                        instance.removeEventListener();
                                        instance.$tree.remove();
                                    },
                                    edit: $transferId.val().split(','),
                                    zIndex: 99999999
                                });
                            }
                        });

                        form.on('submit(bind)', function (data) {
                            var $form = layero.find('form'),
                                param = $form.serializeArray();

                            param.push({name: "customerIds", value: result.join(',')});

                            Req.postReqCommon(url, param);
                            return false;
                        })
                    }
                })
            }
        });

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
        form.on('checkbox(layTableChoose)', function (data) {
            var allSize = $('.selectcheckbox').length,
                selectedSize = $('.selectcheckbox:checked').length;

            if(selectedSize == allSize) {
                $('#selectAll').prop('checked', true);
            } else {
                $('#selectAll').prop('checked', false);
            }
            form.render();
        })

        form.on('submit', function(data){
            return false;
        });

        // 导出
        $(document).on('click', '.exportData', function (e) {
            e.preventDefault();
            var url = $(this).attr('data-url'),
                key = $(this).attr('data-key');

            var param = ListModule.getSplitParam();
            param.key = key;

            Req.postReq(url, param, function (res) {
                if(res.status) {
                    Dialog.downloadDialog({
                        downloadUrl: res.data.url
                    });
                } else {
                    Dialog.errorDialog(res.msg);
                }
            });
        });
    });
});