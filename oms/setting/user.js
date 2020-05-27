/**
 * OMS设置-成员管理
 */

layui.use(['element', 'form', 'Dialog', 'Pager', 'Req', 'Common', 'Regex'], function() {
    var $ = layui.jquery,
        form = layui.form,
        element = layui.element;
    var Dialog = layui.Dialog;
    var Pager = layui.Pager;
    var Regex = layui.Regex;
    var Common = layui.Common;
    var Req = layui.Req;

    var roleList = [];

    function loadRoleList() {
        var url = $('input[name=getRoleListAjaxUrl]').val();

        Req.getReq(url, function(res) {
            if(res.status) {
                roleList = res.data.lists;
            }
        });
    }


    // 获取分页参数
    function getSplitParam() {
        var param = {
            keyword: $('input[name=keyword]').val(),
            limit: $('.ajaxpageselect option:selected').val() || 10,
            page: $('.inputpage').val() || 1
        };
        return param;
    }

    function init() {
        loadRoleList();

        var pageAjaxUrl = $('#pageAjaxUrl').val();
        Pager.initPager({
            type: 1,
            url: pageAjaxUrl,
            callback: getSplitParam
        });
    }

    function checkOparkAccount(phone, cb) {
        var url = $('input[name=getOparkAccountAjaxUrl]').val();
        url = url + '?phone=' + phone;
        Req.getReq(url, function (res) {
            if(res.status) {
                cb(res);
            } else {
                Dialog.errorDialog(res.msg);
            }
        })
    }

    // 获取角色选项
    function getRoleOpts() {
        var opts = '<option value="">请选择</option>';

        if(roleList && roleList.length) {
            roleList.forEach(function (item, index) {
                opts += '<option value="'+ item.id +'" roleid="'+ item.id +'">'+ item.name +'</option>';
            })
        }
        return opts;
    }

    // 添加用户
    function getUserDialogHtml() {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label"><span class="c-orange">* </span>OPark帐号</label>' +
                                '<div class="layui-input-block">' +
                                    '<input type="text" name="phone" value="" lay-verify="required|phone"  lay-reqText="请填写OPark帐号(手机号)" required placeholder="请填写OPark帐号(手机号)" autocomplete="off" class="layui-input" >'+
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label"><span class="c-orange">* </span>姓名</label>' +
                                '<div class="layui-input-block">' +
                                    '<input type="text" name="name" value="" lay-verify="required"  lay-reqText="请填写姓名" required placeholder="请填写姓名" autocomplete="off" class="layui-input disabled" readonly>'+
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label"><span class="c-orange">* </span>角色</label>' +
                                '<div class="layui-input-block">' +
                                    '<select name="role" lay-verify="required"  lay-reqText="请选择角色" lay-filter="role">' +
                                        getRoleOpts() +
                                    '</select>' +
                                '</div>' +
                            '</div>'+
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    // 更换角色
    function getChangeRoleDialogHtml(phone, empName, roleName) {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label">OPark帐号</label>' +
                                '<div class="layui-form-mid">'+ phone +'</div>' +
                                '<input type="hidden" name="phone" value="'+ phone +'">'+
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label">姓名</label>' +
                                '<div class="layui-form-mid">'+ empName +'</div>' +
                                '<input type="hidden" name="name" value="'+ empName +'">'+
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label"><span class="c-orange">* </span>角色</label>' +
                                '<div class="layui-input-block">' +
                                    '<select name="role" lay-verify="required"  lay-reqText="请选择角色" lay-filter="role">' +
                                        getRoleOpts() +
                                    '</select>' +
                                '</div>' +
                            '</div>'+
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }


    $(function() {
        init();

        // 添加用户
        $(document).on('click', '.ajaxTableAdd', function() {
            var $o = $(this),
                url = $(this).attr('data-url');
            Dialog.formDialog({
                title: '添加用户',
                content: getUserDialogHtml(),
                success: function (layero, index) {
                    var $form = layero.find('form');
                    var $name = layero.find('input[name=name]');
                    form.render(null, 'formDialog');
                    var flag = true;

                    layero.find('input[name=phone]').blur(function () {
                        if(flag) {
                            var oparkAccount = $(this).val();
                            if(!Regex.phone.reg.test(oparkAccount)) {
                                // Dialog.errorDialog(Regex.phone.msg);
                                Dialog.errorDialog("账号不存在");
                                return false;
                            } else {
                                checkOparkAccount(oparkAccount, function(res) {
                                    if(res.status) {
                                        if(res.data.name) {
                                            $name.val(res.data.name);
                                        } else {
                                            $name.prop('readonly', '');
                                            $name.removeClass('disabled');
                                        }
                                    } else {
                                        Dialog.errorDialog(res.msg);
                                    }
                                });
                            }
                        }
                    });

                    layero.find('.layui-layer-btn1, .layui-layer-close').mousedown(function (e) {
                        e.preventDefault();
                        flag = false;
                    });

                    form.on('submit(formDialog)', function(data) {
                        var reqParam = $form.serializeArray();
                        Req.postReq(url, reqParam, function (res) {
                            if(res.status) {
                                Dialog.successDialog(res.msg, function () {
                                    layer.close(index);
                                    var param  = getSplitParam();
                                    Pager.renderPager(param);
                                });
                            } else {
                                Dialog.errorDialog(res.msg);
                            }
                        });
                        return false;
                    });


                }
            })
        });

        // 更换角色
        $(document).on('click', '.changeRole', function() {
            var $o = $(this),
                phone = $o.attr('data-user-name'),
                roleName = $o.attr('data-role-name'),
                roleId = $o.attr('data-role-id'),
                empName = $o.attr('data-emp-name'),
                url = $(this).attr('data-url');
            Dialog.formDialog({
                title: '更换角色',
                content: getChangeRoleDialogHtml(phone, empName, roleName),
                success: function (layero, index) {
                    var $form = layero.find('form');
                    form.render(null, 'formDialog');

                    form.val('formDialog',{
                        role: roleId
                    });

                    form.on('submit(formDialog)', function(data) {
                        var reqParam = $form.serializeArray();
                        Req.postReq(url, reqParam, function (res) {
                            if(res.status) {
                                Dialog.successDialog(res.msg, function () {
                                    layer.close(index);
                                    var param  = getSplitParam();
                                    Pager.renderPager(param);
                                });
                            } else {
                                Dialog.errorDialog(res.msg);
                            }
                        });
                        return false;
                    });
                }
            })
        });

        // 删除用户
        $(document).on('click', '.delUser', function() {
            var empName = $(this).attr('data-emp-name'),
                url = $(this).attr('data-url');

            Dialog.delDialog({
                content: '<div style="padding: 20px;">确定要删除【'+ empName +'】吗？</div>',
                yesFn: function(index, layero) {
                    Req.getReq(url, function (res) {
                        if(res.status) {
                            Dialog.successDialog(res.msg, function () {
                                layer.close(index);
                                var param  = getSplitParam();
                                Pager.renderPager(param);
                            });
                        } else {
                            Dialog.errorDialog(res.msg);
                        }
                    });
                }
            });
        });

        /**
         * 搜索
         */
        $(document).on('click', '.ajaxSearch', function() {
            var param  = getSplitParam();
            Pager.renderPager(param);
        });
        $(document).on('keydown', 'input[name=keyword]', function(e) {
            if (e.keyCode == 13) {
                $('.ajaxSearch').trigger('click');
            }
        });
    });
});