/**
 * 审批-审批详情
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'OTree', 'Print', 'Pager', 'Pager2'], function() {
    var $ = layui.jquery,
        form = layui.form,
        Pager2 = layui.Pager2,
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var Dialog = layui.Dialog;
    var Print = layui.Print;
    var Pager = layui.Pager;
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

    function getBackNodeListOpts() {
        var _html = '';
        if(backNodeArr.length) {
            backNodeArr.forEach(function(item, index) {
                _html += '<option value="'+ item.id +'">'+ item.name +'</option>'
            });
        }
        return _html;
    }

    function getApprovalDialogHtml(isBack, approveType) {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label"><span class="c-orange">* </span>审批意见</label>' +
                                '<div class="layui-input-block">' +
                                    '<div class="layui-input-inline" style="width:auto;">' +
                                        '<input type="radio" name="approveType" lay-filter="approveType" value="1" title="同意" checked>' +
                                        '<input type="radio" name="approveType" lay-filter="approveType" value="-1" title="不同意">';
        if(isBack == '1') {
            _html += '<input type="radio" name="approveType" lay-filter="approveType" value="0" title="回退至">';
        }
        _html += '</div>';
        if(isBack == '1') {
            _html += '<div class="layui-input-inline">' +
                        '<select name="backNode" lay-filter="backNode" lay-verify="backNode"  lay-reqText="请选择回退节点" disabled>' +
                            '<option value="">请选择回退节点</option>'+
                            getBackNodeListOpts() +
                        '</select>' +
                    '</div>';
        }
        _html +=
                                '</div>'+
                            '</div>';
        if(approveType == 'free') {
            _html += '<div class="layui-form-item freeWrap">' +
                        '<label class="layui-form-label">下一审批人</label>' +
                        '<div class="layui-input-block">' +
                            '<input type="text" name="nextPerson" readonly placeholder="点击选择审批人" autocomplete="off" class="layui-input" >' +
                            '<input type="hidden" name="nextPersonIds">' +
                            '<div style="color:#999;" class="mt-5">不选择审批人，流程将同意并结束</div>' +
                        '</div>' +
                    '</div>';
        }
        _html +=
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label"><span class="c-orange">* </span>意见说明</label>' +
                                '<div class="layui-input-block">' +
                                    '<textarea placeholder="请填写审批意见" lay-verify="required" maxlength="500"  lay-reqText="请填写审批意见" class="layui-textarea" name="adviseDesc">同意</textarea>' +
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                            '<label class="layui-form-label">抄送人</label>' +
                            '<div class="layui-input-block">' +
                                '<input type="text" name="ccPerson" readonly placeholder="点击选择抄送人" autocomplete="off" class="layui-input" >'+
                                '<input type="hidden" name="ccPersonIds">' +
                            '</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    // 获取分页参数
    function getSplitParam() {
        var param = {
            limit: $('.ajaxpageselect option:selected').val() || 10,
            page: $('.inputpage').val() || 1
        };
        return param;
    }

    function renderPage() {
        var pageAjaxUrl = $('#pageAjaxUrl').val();

        Pager2({
            type: 1,
            url: pageAjaxUrl,
            callback: getSplitParam,
            pageContainer: $('.ajaxTableTbody'),
            pageBar: $('.ajaxTablePage')
        });
    }

    function init() {
        loadDeptMemberList();
    }


    function submitApprove(url, data) {
        Req.postReq(url, data, function (res) {
            if(res.status) {
                Dialog.successDialog(res.msg, function () {
                    if(res.data.url) {
                        window.location.href = res.data.url;
                    }
                    // layer.close(index);
                    layer.closeAll();
                });
            } else {
                Dialog.errorDialog(res.msg);
            }
        });
    }

    $(function() {

        loadDeptMemberList();
        init();

        // 审批
        $(document).on('click', '.ajaxProcess', function() {
            var isBack = $(this).attr('data-is-back'),          // 0: 不显示  1：显示
                approveType = $(this).attr('data-approve-type'),
                url = $(this).attr('data-url');

            Dialog.formDialog({
                title: '审批处理',
                content: getApprovalDialogHtml(isBack, approveType),
                area: ['620px', 'auto'],
                success: function(layero, index) {
                    form.render(null, 'formDialog');

                    var $backNodeSelect = layero.find('select[name=backNode]'),
                        $adviseDesc = layero.find('textarea[name=adviseDesc]');

                    var $ccPerson = layero.find('input[name=ccPerson]'),
                        $ccPersonIds = layero.find('input[name=ccPersonIds]');

                    var $nextPerson = layero.find('input[name=nextPerson]'),
                        $nextPersonIds = layero.find('input[name=nextPersonIds]');

                    var $freeWrap = layero.find('.freeWrap');

                    $ccPerson.click(function() {
                        if(!$ccPersonIds.val()) {
                            // 未添加过
                            OTree({
                                isConfirmBtnShow: true,
                                data: deptMemberList,
                                callback: function(instance) {
                                    $ccPerson.val(instance.eidTextArr.join(','));
                                    $ccPersonIds.val(instance.eidArr.join(','));
                                    instance.removeEventListener();
                                    instance.$tree.remove();
                                },
                                zIndex:99999999
                            });
                        } else {
                            OTree({
                                isConfirmBtnShow: true,
                                data: deptMemberList,
                                callback: function(instance) {
                                    $ccPerson.val(instance.eidTextArr.join(','));
                                    $ccPersonIds.val(instance.eidArr.join(','));
                                    instance.removeEventListener();
                                    instance.$tree.remove();
                                },
                                edit: $ccPersonIds.val().split(','),
                                zIndex:99999999
                            });
                        }
                    });

                    $nextPerson.click(function() {
                        if(!$nextPerson.val()) {
                            // 未添加过
                            OTree({
                                isConfirmBtnShow: true,
                                data: deptMemberList,
                                callback: function(instance) {
                                    $nextPerson.val(instance.eidTextArr.join(','));
                                    $nextPersonIds.val(instance.eidArr.join(','));
                                    instance.removeEventListener();
                                    instance.$tree.remove();
                                },
                                zIndex:99999999
                            });
                        } else {
                            OTree({
                                isConfirmBtnShow: true,
                                data: deptMemberList,
                                callback: function(instance) {
                                    $nextPerson.val(instance.eidTextArr.join(','));
                                    $nextPersonIds.val(instance.eidArr.join(','));
                                    instance.removeEventListener();
                                    instance.$tree.remove();
                                },
                                edit: $nextPersonIds.val().split(','),
                                zIndex:99999999
                            });
                        }
                    });

                    form.verify({
                        backNode: function() {
                            var approveType = layero.find('input[name=approveType]:checked').val(),
                                selectBackNode = layero.find('select[name=backNode] option:selected').val();

                            if(approveType == '0') {
                                if(!selectBackNode) {
                                    return '请选择回退节点';
                                }
                            }
                        }
                    });

                    form.on('radio(approveType)', function (data) {
                        // 1: 同意 -1：不同意 0：回退至
                        if(data.value == '1') {
                            $backNodeSelect.prop('disabled', true);
                            form.val('formDialog', {
                                'backNode': ''
                            });
                            $adviseDesc.val('同意');

                            if(approveType == 'free') {
                                $freeWrap.removeClass('hidden');
                            }
                        } else if(data.value == '-1') {
                            $backNodeSelect.prop('disabled', true);
                            $adviseDesc.val('');
                            form.val('formDialog', {
                                'backNode': ''
                            });

                            if(approveType == 'free') {
                                $freeWrap.addClass('hidden');
                            }
                        } else {
                            $adviseDesc.val('');
                            $backNodeSelect.prop('disabled', false);

                            if(approveType == 'free') {
                                $freeWrap.addClass('hidden');
                            }
                        }
                        form.render(null, 'formDialog');
                    });

                    form.on('submit(bind)', function(data) {
                        var $form = layero.find('form'),
                            data = $form.serializeArray();

                        if(approveType == 'free' && $freeWrap.is(':visible')) {
                            if(!$nextPersonIds.val()) {
                                Dialog.confirmDialog({
                                    title: '温馨提示',
                                    content: '您没有选择下一审批人，流程将同意并结束，您确定继续提交吗？',
                                    yesFn: function (index, layero) {
                                        submitApprove(url, data);
                                    }
                                })
                            } else {
                                submitApprove(url, data);
                            }
                        } else {
                            submitApprove(url, data);
                        }
                        return false;
                    })
                }
            })
        });

        // 抄送
        $(document).on('click', '.ajaxCC', function() {
            var url = $(this).attr('data-url');
            OTree({
                title: '添加抄送人员',
                data: deptMemberList,
                callback: function(instance) {
                    Req.postReq(url, {ids: instance.eidArr.join(',')}, function(res) {
                        if(res.status) {
                            Dialog.successDialog(res.msg);
                            instance.removeEventListener();
                            instance.$tree.remove();
                            setTimeout(function() {
                                window.location.reload();
                            },1000);
                        } else {
                            Dialog.errorDialog(res.msg);
                        }
                    })
                },
                zIndex:99999999
            });
        });

        // 抄送记录
        $(document).on('click', '.openHtml', function() {
            var url = $(this).attr('data-url');
            Req.getReq(url, function(res) {
                Dialog.confirmDialog({
                    title: '抄送记录',
                    content: '<div style="width: 100%; height: 240px; overflow-x: hidden;">' + res + '</div>',
                    area: ['680px', 'auto'],
                    btn: [],
                    success: function () {
                        renderPage();
                    },
                    yesFn: function (index, layero) {
                        layer.close(index);
                    }
                })
            },'html');
        });

        // 打印
        $(document).on('click', '.printerCommon', function () {
            Common.commonPrint($('.approvalDiv'), function ($printArea) {
                Print($printArea);
                $('.approvalDiv').css('width', "auto").css("zoom", 1);
                $('.for-new-print .print').empty();
                $('.for-new-print').hide();
            });

            // $('.layui-footer').hide();
            //
            // Print($('.approvalDiv'));
            // setTimeout(function () {
            //     $('.layui-footer').show();
            // },10)
        });
    });
});