/**
 * 设置-角色
 */

layui.use(['element', 'form', 'Dialog', 'Pager', 'eleTree', 'Req', 'Common'], function() {
    var $ = layui.jquery,
        form = layui.form,
        element = layui.element,
        eleTree = layui.eleTree;

    var Dialog = layui.Dialog;
    var Pager = layui.Pager;
    var Common = layui.Common;
    var Req = layui.Req;

    var roleList = [],
        selectTree;

    function loadRoleList() {
        var url = $('input[name=authMenuAjaxUrl]').val();

        Req.getReq(url, function(res) {
            if(res.status) {
                roleList = res.data.data;
            }
        });
    }

    // 递归转换数据
    function convertData(list) {
        var result = [];

        for(var i = 0, len = list.length; i < len; i++) {
            var param = {};
            param.id = list[i].groupId;
            param.label = list[i].groupName;
            if(list[i].groupList.length) {
                param.children = convertData(list[i].groupList);
            }
            result.push(param);
        }
        return result;
    }

    function getRoleHtml(name, menuNames, menuIds) {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="">' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label">角色名称</label>' +
                                '<div class="layui-input-block">' +
                                    '<input type="text" name="name" lay-verify="required" lay-reqText="请填写角色名称" required placeholder="请填写角色名称" value="'+ name +'" autocomplete="off" class="layui-input" >'+
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label">权限</label>' +
                                '<div class="layui-input-block">' +
                                    '<input type="text" name="role" required  lay-verify="required" lay-reqText="请选择权限" placeholder="请选择权限" value="'+ menuNames.join(',') +'" readonly autocomplete="off" class="layui-input">' +
                                    '<input type="hidden" name="menuIds" value="'+ menuIds.join(',') +'">' +
                                    '<div class="selectTreeWrap hidden" style="width: 100%; height: 300px; position: absolute; background: #fff; border: 1px solid #e6e6e6;">' +
                                         '<div class="selectTree" lay-filter="selectTree" style="width: 100%; height: 250px; overflow-y: scroll;"></div>' +
                                         '<div style="text-align: center; padding-top: 10px;">' +
                                            '<div class="layui-btn selectTreeBtn">选好了</div>' +
                                         '</div>' +
                                    '</div>' +
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

    function init() {
        var pageAjaxUrl = $('#pageAjaxUrl').val();
        Pager.initPager({
            type: 1,
            url: pageAjaxUrl,
            callback: getSplitParam
        });
    }

    $(function() {
        init();
        loadRoleList();

        // 添加
        $(document).on('click', '.addRole', function() {
            var $o = $(this),
                url = $(this).attr('data-url');

            var name = '',
                menuNames = [],
                menuIds = [],
                title = '添加角色';

            Dialog.formDialog({
                title: title,
                content: getRoleHtml(name, menuNames, menuIds),
                success: function(layero, index) {
                    var $menuIds = layero.find('input[name=menuIds]'),
                        $roleInput = layero.find('input[name=role]');

                    layero.find('input[name=role]').click(function(e) {
                        e.stopPropagation();
                        $('.selectTreeWrap').toggleClass('hidden');
                    });

                    layero.find('.selectTreeBtn').click(function(e) {
                        var arr = selectTree.getChecked(true,false),
                            roleIds = [],
                            roleNames = [];
                        arr.forEach(function(o,i) {
                            roleIds.push(o.id);
                            roleNames.push(o.label);
                        })
                        $menuIds.val(roleIds.join(','));
                        $roleInput.val(roleNames.join(','));
                    });


                    $(document).on("click",function() {
                        $('.selectTreeWrap').addClass('hidden');
                    });
                    if(!selectTree){
                        selectTree = eleTree.render({
                            elem: '.selectTree',
                            data: convertData(roleList),
                            showCheckbox: true,
                            defaultExpandAll: true,
                            done: function() {

                            }
                        });
                    }
                    form.on('submit(bind)', function(data){
                        Req.postReq(url, data.field, function(res) {
                            if(res.status) {
                                Dialog.successDialog(res.msg);
                                layer.close(index);
                                if(res.data.url) {
                                    Pager.renderPager(res.data.url);
                                }
                            } else {
                                Dialog.errorDialog(res.msg);
                            }
                        });
                        // 阻止表单跳转。如果需要表单跳转，去掉这段即可
                        return false;
                    });
                },
                endFn: function() {
                    selectTree = null;
                }
            });
        });

        // 编辑
        $(document).on('click', '.editRole', function() {
            var $o = $(this),
                url = $(this).attr('data-url'),
                selectUrl = $o.attr('data-select-url');

            var name = $o.attr('data-name'),
                menuNames = $o.attr('data-group-name').split(','),
                menuIds = [],
                title = '编辑角色';

            $.ajax({
                url: selectUrl,
                type: 'GET',
                dataType: 'json',
                success: function (res) {
                    if(res.status) {
                        menuIds = res.data.groupIds.split(',');

                        Dialog.formDialog({
                            title: title,
                            content: getRoleHtml(name, menuNames, menuIds),
                            success: function(layero, index) {
                                var $menuIds = layero.find('input[name=menuIds]'),
                                    $roleInput = layero.find('input[name=role]');

                                layero.find('input[name=role]').click(function(e) {
                                    e.stopPropagation();
                                    var tempMenuIds = $menuIds.val().split(',');
                                    tempMenuIds.forEach(function(v, k) {
                                        $('.eleTree-node[data-id="'+ v +'"]').find('.eleTree-checkbox').trigger('click');
                                    });
                                    $('.selectTreeWrap').toggleClass('hidden');
                                });

                                layero.find('.selectTreeBtn').click(function(e) {
                                    var arr = selectTree.getChecked(true,false),
                                        roleIds = [],
                                        roleNames = [];
                                    arr.forEach(function(o,i) {
                                        roleIds.push(o.id);
                                        roleNames.push(o.label);
                                    })
                                    $menuIds.val(roleIds.join(','));
                                    $roleInput.val(roleNames.join(','));
                                });


                                $(document).on("click",function() {
                                    $('.selectTreeWrap').addClass('hidden');
                                    if(selectTree) {
                                        selectTree.unCheckNodes();
                                    }
                                });
                                if(!selectTree){
                                    selectTree = eleTree.render({
                                        elem: '.selectTree',
                                        data: convertData(roleList),
                                        showCheckbox: true,
                                        defaultExpandAll: true,
                                        done: function() {
                                            // selectTree.setChecked(menuIds);
                                        }
                                    });
                                }
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
                                                Dialog.successDialog(res.msg);
                                                layer.close(index);
                                                if(res.data.url) {
                                                    Pager.renderPager(res.data.url);
                                                }
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
                            },
                            endFn: function() {
                                selectTree = null;
                            }
                        });
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

        // 删除
        $(document).on('click', '.delRole', function() {
            var dName = $(this).attr('data-name'),
                url = $(this).attr('data-url');

            Dialog.delDialog({
                content: '<div style="padding: 20px;">确定要删除【'+ dName +'】吗？</div>',
                yesFn: function(index, layero) {
                    var layerIndex = layer.load(2, {shade: [0.1, '#000']});
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                    })
                    .done(function(res) {
                        if(res.status) {
                            Dialog.successDialog(res.msg);
                            layer.close(index);
                            if(res.data.url) {
                                Pager.renderPager(res.data.url);
                            }
                        } else {
                            Dialog.errorDialog(res.msg);
                        }
                    })
                    .always(function() {
                        layer.close(layerIndex);
                    });
                }
            });
        });
    });
});