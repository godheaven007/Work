/**
 * 设置-管理员设置
 */

layui.use(['element', 'form', 'Dialog', 'Pager', 'OTree', 'Req', 'Common'], function() {
    var $ = layui.jquery,
        form = layui.form,
        element = layui.element,
        OTree = layui.OTree,
        Dialog = layui.Dialog;
    var Common = layui.Common;
    var Req = layui.Req;
    var form = layui.form;
    var deptMemberList = [];      // 部门成员

    function loadDeptMemberList() {
        var url = $('#deptpersonListAjaxUrl').val();
        Req.getReq(url, function(res) {
            if(res.status) {
                deptMemberList = res.data.data;
            }
        });
    }

    function renderEmpHtml(eidTextArr) {
        var res = [];
        eidTextArr.forEach(function(v, k) {
            res.push(v);
        });
        $('.empNameDiv').html(res.join('、'));
    }

    // 已经是管理员的话，添加需提示
    function adminIsExist(uuidArr, eidTextArr, callback) {
        var adminArr = [],
            result = [];
        var url = $('#adminLListAjaxUrl').val();

        Req.getReq(url, function (res) {
            if(res.status) {
                adminArr = res.data.adminIdString.split(',');
                for(var i = 0; i < adminArr.length; i++) {
                    var curAdminUuid = adminArr[i];
                    for(var j = 0; j < uuidArr.length; j++) {
                        if(uuidArr[j] == curAdminUuid) {
                            result.push(eidTextArr[j]);
                        }
                    }
                }
                if(result.length) {
                    Dialog.errorDialog('【' + result.join('、') + '】已经是管理员，无需重复添加');
                    return false;
                } else {
                    callback && callback();
                }

            } else {
                Dialog.errorDialog(res.msg);
            }
        });
    }

    // 转让创建人
    function getTransferHtml() {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="">' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label">转让给</label>' +
                                '<div class="layui-input-block">' +
                                    '<input type="text" id="transfer" name="username" readonly lay-verify="required"  lay-reqText="请添加转让创建人" required autocomplete="off" class="layui-input" >'+
                                    '<input type="hidden" name="empid">'+
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label">验证身份</label>' +
                                '<div class="layui-input-block">' +
                                    '<input type="password" name="password" lay-verify="required"  lay-reqText="输入您的登录密码以验证是本人操作" required placeholder="输入您的登录密码以验证是本人操作" autocomplete="off" class="layui-input" >'+
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
        loadDeptMemberList();

        // 转让创建人
        $(document).on('click', '.shiftAdmin', function() {
            var isCeo = $(this).attr('data-is-ceo'),
                url = $(this).attr('data-url');

            if(isCeo == '1') {
                Dialog.formDialog({
                    title: '转让创建人',
                    content: getTransferHtml(),
                    success: function(layero, index) {
                        var $transfer = layero.find('#transfer'),
                            $empId = layero.find('input[name=empid]');

                        layero.find('input[name=username]').click(function(e) {
                            e.stopPropagation();
                            if(!$empId.val()) {
                                // 未添加过
                                OTree({
                                    title: '选择人员',
                                    type: false,
                                    data: deptMemberList,
                                    callback: function(instance) {
                                        if(instance.uuidArr[0] == $('#empUuId').val()) {
                                            layer.msg('不能选当前创建人', {time: 1800, icon: 5, shift: 0, zIndex:999999999});
                                            return false;
                                        } else {
                                            $transfer.val(instance.eidTextArr.join(''));
                                            $empId.val(instance.uuidArr.join(','));
                                            instance.removeEventListener();
                                            instance.$tree.remove();
                                        }
                                    },
                                    zIndex:99999999
                                });
                            } else {
                                OTree({
                                    title: '选择人员',
                                    type: false,
                                    data: deptMemberList,
                                    callback: function(instance) {
                                        if(instance.uuidArr[0] == $('#empUuId').val()) {
                                            layer.msg('不能选当前创建人', {time: 1800, icon: 5, shift: 0, zIndex:999999999});
                                            return false;
                                        } else {
                                            $transfer.val(instance.eidTextArr.join(''));
                                            $empId.val(instance.uuidArr.join(','));
                                            instance.removeEventListener();
                                            instance.$tree.remove();
                                        }
                                    },
                                    zIndex:99999999,
                                    edit: $empId.val().split(','),
                                    uuid: true
                                });
                            }

                        });

                        form.on('submit(bind)', function(data){
                            var layerIndex = layer.load(2, {shade: [0.1, '#000']});
                            $.ajax({
                                url: url,
                                type: 'POST',
                                dataType: 'json',
                                data: data.field
                            })
                                .done(function(res) {
                                    if(res.status) {
                                        Dialog.successDialog(res.msg, function () {
                                            Req.getReq(res.data.url, function (_res) {
                                                $('.adminLeft').html(_res.data.leftlistContent);
                                                $('.adminRight').html(_res.data.rightlistContent);
                                            });
                                            layer.close(index);
                                        });
                                    } else {
                                        Dialog.errorDialog(res.msg);
                                    }
                                })
                                .always(function() {
                                    layer.close(layerIndex);
                                });
                            // 阻止表单跳转。如果需要表单跳转，去掉这段即可
                            return false;
                        });
                    }
                });
            } else {
                Dialog.tipDialog({
                    content: '您不是创建人，无法进行转让操作！',
                    yesFn: function(index, layero) {
                        layer.close(index);
                    }
                })
            }
        });

        // 添加管理员
        $(document).on('click', '.addAdmin', function() {
            var $o = $(this),
                url = $(this).attr('data-url');

            $.ajax({
                url: url,
                type: 'GET',
                dataType: 'json',
                success: function (res) {
                    if(res.status) {
                        $('.adminRight').html(res.data.content);
                        form.render();
                        $('.detailLink').removeClass('active');
                    } else {
                        Dialog.errorDialog(res.msg);
                    }
                },
                error: function () {

                },
                complete: function () {

                }
            });
        });

        $(document).on('click', '.detailLink', function() {
            var $o = $(this),
                url = $(this).attr('data-url');

            $.ajax({
                url: url,
                type: 'GET',
                dataType: 'json',
                success: function (res) {
                    if(res.status) {
                        // Dialog.successDialog(res.msg);
                        $('.adminRight').html(res.data.url);
                        $('.detailLink').removeClass('active');
                        $o.addClass('active');
                    } else {
                        Dialog.errorDialog(res.msg);
                    }
                },
                error: function () {

                },
                complete: function () {

                }
            });
        });

        // 选择管理员
        $(document).on('click', '.selectMember', function() {
            var $empId = $('input[name=empId]'),
                $empNameDiv = $('.empNameDiv'),
                type = $(this).attr('data-type');

            if(deptMemberList && deptMemberList.length) {
                if(!$empId.val()) {
                    // 未添加过
                    OTree({
                        data: deptMemberList,
                        callback: function(instance) {
                            adminIsExist(instance.uuidArr, instance.eidTextArr, function () {
                                $empNameDiv.html(renderEmpHtml(instance.eidTextArr));
                                $empId.val(instance.uuidArr.join(','));
                                instance.removeEventListener();
                                instance.$tree.remove();
                            });
                        },
                    });
                } else  {
                    // 已添加过且再次添加，需要回填值
                    OTree({
                        data: deptMemberList,
                        callback: function(instance) {
                            adminIsExist(instance.uuidArr, instance.eidTextArr, function () {
                                $empNameDiv.html(renderEmpHtml(instance.eidTextArr));
                                $empId.val(instance.uuidArr.join(','));
                                instance.removeEventListener();
                                instance.$tree.remove();
                            });
                        },
                        edit: $empId.val().split(','),
                        uuid: true
                    });
                }
            }
        });

        // 删除管理员
        $(document).on('click', '.delAdmin', function() {
            var $o = $(this),
                name = $o.attr('data-name'),
                url = $o.attr('data-url');
            Dialog.delDialog({
                title: '删除管理员',
                content: '<div style="padding: 20px;">确定要删除管理员【'+ name +'】吗？</div>',
                yesFn: function(index, layero) {
                    Req.getReq(url, function(res) {
                        if(res.status) {
                            if(res.data.self && res.data.self == '1') {
                                Dialog.successDialog(res.msg, function () {
                                    window.location.href = res.data.url;
                                })
                            } else {
                                Req.getReq(res.data.url, function(res) {
                                    $('.adminLeft').html(res.data.leftlistContent);
                                    $('.adminRight').html(res.data.rightlistContent);
                                    form.render();
                                    // $('.detailLink').removeClass('active');
                                });
                                Dialog.successDialog(res.msg);
                                layer.close(index);
                            }
                        } else {
                            Dialog.errorDialog(res.msg);
                        }
                    });
                }
            });
        });

        // 编辑管理员
        $(document).on('click', '.editAdmin', function() {
            var $o = $(this),
                url = $o.attr('data-url');
            Req.getReq(url, function(res) {
                if(res.status) {
                    $('.adminLeft').html(res.data.leftlistContent);
                    $('.adminRight').html(res.data.content);
                    form.render();
                }
            });
        });

        // 保存
        $(document).on('click', '#ajaxSubmit', function() {
            var checkBoxes = $('input[name="auth[]"]'),
                selectSize = checkBoxes.filter(':checked').length;
            if(!$('input[name=empId]').val()) {
                Dialog.errorDialog('请选择管理员');
                return false;
            }
            if(!selectSize) {
                Dialog.errorDialog('至少需勾选一项权限');
                return false;
            }

            var url = $(this).attr('data-url');
            var $form = $('form'),
                data = $form.serializeArray();

            var layerIndex = layer.load(2, {shade: [0.1, '#000']});
            $.ajax({
                url: url,
                type: 'POST',
                dataType: 'json',
                data: data
            })
            .done(function (res) {
                if(res.status) {
                    Req.getReq(res.data.url, function(res) {
                        $('.adminLeft').html(res.data.leftlistContent);
                        $('.adminRight').html(res.data.rightlistContent);
                        form.render();
                        // $('.detailLink').removeClass('active');
                    });
                }
            })
            .always(function () {
                layer.close(layerIndex);
            });
        });

        // 取消
        $(document).on('click', '#ajaxCancel', function() {
            var url = $(this).attr('data-url');
            Req.getReq(url, function(res) {
                if(res.status) {
                    $('.adminLeft').html(res.data.leftlistContent);
                    $('.adminRight').html(res.data.rightlistContent);
                } else {
                    Dialog.errorDialog(res.msg);
                }
            });
        })
    });
});