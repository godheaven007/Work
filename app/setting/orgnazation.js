/**
 * 设置-组织管理
 */

layui.use(['element', 'form', 'layer', 'Pager', 'Dialog', 'eleTree', 'Req', 'Common'], function() {
    var $ = layui.jquery,
        form = layui.form,
        $form = $('form'),
        layer = layui.layer,
        eleTree = layui.eleTree;
        element = layui.element;

    var Dialog = layui.Dialog;
    var Pager = layui.Pager;
    var Common = layui.Common;
    var Req = layui.Req;

    var deptStatus = {},        // 记录树节点的展开/关闭状态
        selectedDept = '';

    var eleTreeX;
    form.on('submit', function(data) {
        return false;
    });

    // ibs-tree 工具栏
    function getMorePack(curIndex, size, curDept) {
        // 默认没有子部门
        var hasChildDept = curDept.deptList.length;
        var _html = '<ul class="ibs-tree-more-pack">' +
                        '<li class="ibs-tree-add" deptid="'+ curDept.deptId +'" deptname="'+ curDept.deptName +'" hasChildDept="'+ hasChildDept +'" deptpid="'+ curDept.deptPid +'" deptpname="'+ curDept.deptPname +'"><a href="javascript:void(0);">添加子部门</a></li>';
        if(curDept.deptPid == '0') {
            // 根部门只有【添加子部门】功能
        } else {
            _html +=    '<li class="ibs-tree-mod" deptid="'+ curDept.deptId +'" deptname="'+ curDept.deptName +'" hasChildDept="'+ hasChildDept +'" deptpid="'+ curDept.deptPid +'" deptpname="'+ curDept.deptPname +'"><a href="javascript:void(0);">修改</a></li>' +
                        '<li class="ibs-tree-del" deptid="'+ curDept.deptId +'" deptname="'+ curDept.deptName +'" hasChildDept="'+ hasChildDept +'" deptpid="'+ curDept.deptPid +'" deptpname="'+ curDept.deptPname +'"><a href="javascript:void(0);">删除</a></li>';
        }
        if(size == 1) {
            // 无上移下移
            _html += '</ul>';
            return _html;
        }

        if(curIndex == 0) {
            // 无上移
            _html += '<li class="ibs-tree-down" deptid="'+ curDept.deptId +'" deptname="'+ curDept.deptName +'" hasChildDept="'+ hasChildDept +'" deptpid="'+ curDept.deptPid +'" deptpname="'+ curDept.deptPname +'"><a href="javascript:void(0);">下移</a></li>' +
                '</ul>';
            return _html;
        } else if(curIndex == (size - 1)) {
            // 无下移
            _html +=
                '<li class="ibs-tree-up" deptid="'+ curDept.deptId +'" deptname="'+ curDept.deptName +'" hasChildDept="'+ hasChildDept +'" deptpid="'+ curDept.deptPid +'" deptpname="'+ curDept.deptPname +'"><a href="javascript:void(0);">上移</a></li>' +
                '</ul>';
            return _html;
        } else {
            _html +=
                '<li class="ibs-tree-up" deptid="'+ curDept.deptId +'" deptname="'+ curDept.deptName +'" hasChildDept="'+ hasChildDept +'" deptpid="'+ curDept.deptPid +'" deptpname="'+ curDept.deptPname +'"><a href="javascript:void(0);">上移</a></li>' +
                '<li class="ibs-tree-down" deptid="'+ curDept.deptId +'" deptname="'+ curDept.deptName +'" hasChildDept="'+ hasChildDept +'" deptpid="'+ curDept.deptPid +'" deptpname="'+ curDept.deptPname +'"><a href="javascript:void(0);">下移</a></li>' +
                '</ul>';
            return _html;
        }
    }

    // 加载部门树
    function renderDeptTree(list) {
        var _html = '';

        for(var i = 0, len = list.length; i < len; i++) {
            var curDept = list[i];
            if(!curDept.deptList.length) {
                // 无子部门
                _html += '<div class="ibs-tree-set" deptid="'+ curDept.deptId +'" deptname="'+ curDept.deptName +'" deptpid="'+ curDept.deptPid +'" deptpname="'+ curDept.deptPname +'">' +
                            '<div class="ibs-tree-entry" deptid="'+ curDept.deptId +'" deptname="'+ curDept.deptName +'">' +
                                '<div class="ibs-tree-main">' +
                                    '<div class="ibs-tree-iconClick" deptid="'+ curDept.deptId +'"><i class="ibs-tree-iconArrow ibs-no-child"></i></div>' +
                                    '<div class="ibs-tree-txt" deptid="'+ curDept.deptId +'"><i style="color:#01AAED;" class="iconfont ibs-ico-set-level mr-5"></i>'+ curDept.deptName +'</div>' +
                                '</div>' +
                                '<div class="ibs-tree-more">' +
                                    '<i class="iconfont ibs-ico-more"></i>' +
                                    getMorePack(i, len, curDept) +
                                '</div>'+
                            '</div>' +
                        '</div>';
            } else {
                _html += '<div class="ibs-tree-set ibs-tree-spread hasChildren" deptid="'+ curDept.deptId +'" deptname="'+ curDept.deptName +'" deptpid="'+ curDept.deptPid +'" deptpname="'+ curDept.deptPname +'">' +
                            '<div class="ibs-tree-entry" deptid="'+ curDept.deptId +'" deptname="'+ curDept.deptName +'">' +
                                '<div class="ibs-tree-main">' +
                                    '<div class="ibs-tree-iconClick" deptid="'+ curDept.deptId +'"><i class="ibs-tree-iconArrow"></i></div>' +
                                    '<div class="ibs-tree-txt" deptid="'+ curDept.deptId +'"><i style="color:#01AAED;" class="iconfont ibs-ico-set-level mr-5"></i>'+ curDept.deptName +'</div>' +
                                '</div>' +
                                '<div class="ibs-tree-more">' +
                                    '<i class="iconfont ibs-ico-more"></i>' +
                                    getMorePack(i, len, curDept) +
                                '</div>'+
                            '</div>'+
                            '<div class="ibs-tree-pack" style="display: none;">' +
                                renderDeptTree(curDept.deptList) +
                            '</div>' +
                         '</div>';
            }
        }
        return _html;
    }

    // 加载状态树
    function renderDeptStatusTree(list) {
        var _html = '';

        for(var i = 0, len = list.length; i < len; i++) {
            var curDept = list[i];
            if(!curDept.deptList.length) {
                // 无子部门
                _html += '<div class="ibs-tree-set" deptid="'+ curDept.deptId +'" deptname="'+ curDept.deptName +'" deptpid="'+ curDept.deptPid +'" deptpname="'+ curDept.deptPname +'">' +
                            '<div class="ibs-tree-entry" deptid="'+ curDept.deptId +'" deptname="'+ curDept.deptName +'">' +
                                '<div class="ibs-tree-main">' +
                                    '<div class="ibs-tree-iconClick" deptid="'+ curDept.deptId +'"><i class="ibs-tree-iconArrow ibs-no-child"></i></div>' +
                                    '<div class="ibs-tree-txt" deptid="'+ curDept.deptId +'"><i class="iconfont ibs-ico-set-level mr-5"></i>'+ curDept.deptName +'</div>' +
                                '</div>' +
                                '<div class="ibs-tree-more">' +
                                    '<i class="iconfont ibs-ico-more"></i>' +
                                    getMorePack(i, len, curDept) +
                                '</div>'+
                            '</div>' +
                        '</div>';
            } else {
                if(deptStatus[curDept.deptId].spread == '1') {
                    // 展开
                    _html += '<div class="ibs-tree-set ibs-tree-spread hasChildren" deptid="'+ curDept.deptId +'" deptname="'+ curDept.deptName +'" deptpid="'+ curDept.deptPid +'" deptpname="'+ curDept.deptPname +'">' +
                                '<div class="ibs-tree-entry" deptid="'+ curDept.deptId +'" deptname="'+ curDept.deptName +'">' +
                                    '<div class="ibs-tree-main">' +
                                        '<div class="ibs-tree-iconClick" deptid="'+ curDept.deptId +'"><i class="ibs-tree-iconArrow"></i></div>' +
                                        '<div class="ibs-tree-txt" deptid="'+ curDept.deptId +'"><i class="iconfont ibs-ico-set-level mr-5"></i>'+ curDept.deptName +'</div>' +
                                    '</div>' +
                                    '<div class="ibs-tree-more">' +
                                        '<i class="iconfont ibs-ico-more"></i>' +
                                        getMorePack(i, len, curDept) +
                                    '</div>'+
                                '</div>'+
                                '<div class="ibs-tree-pack" style="display: block;">' +
                                        renderDeptStatusTree(curDept.deptList) +
                                '</div>' +
                            '</div>';
                } else if(deptStatus[curDept.deptId].spread == '0') {
                    // 关闭
                    _html += '<div class="ibs-tree-set hasChildren" deptid="'+ curDept.deptId +'" deptname="'+ curDept.deptName +'" deptpid="'+ curDept.deptPid +'" deptpname="'+ curDept.deptPname +'">' +
                                    '<div class="ibs-tree-entry" deptid="'+ curDept.deptId +'" deptname="'+ curDept.deptName +'">' +
                                        '<div class="ibs-tree-main">' +
                                            '<div class="ibs-tree-iconClick" deptid="'+ curDept.deptId +'"><i class="ibs-tree-iconArrow"></i></div>' +
                                            '<div class="ibs-tree-txt" deptid="'+ curDept.deptId +'"><i class="iconfont ibs-ico-set-level mr-5"></i>'+ curDept.deptName +'</div>' +
                                        '</div>' +
                                        '<div class="ibs-tree-more">' +
                                            '<i class="iconfont ibs-ico-more"></i>' +
                                            getMorePack(i, len, curDept) +
                                        '</div>'+
                                    '</div>'+
                                    '<div class="ibs-tree-pack" style="display: none;">' +
                                        renderDeptStatusTree(curDept.deptList) +
                                    '</div>' +
                              '</div>';
                }
            }
        }
        return _html;
    }

    function loadDeptTree(type) {
        var layerIndex = layer.load(2, {shade: [0.1, '#000']});
        var deptListUrl = $('#deptListAjaxUrl').val();
        $.ajax({
            url: deptListUrl,
            type: 'GET',
            dataType: 'json',
        })
        .done(function(res) {
            if(res.status) {
                var list = res.data.data;
                var _html = '';
                if(type == 1) {
                    _html = renderDeptTree(list);
                    $('.ajaxDeptDiv').html(_html);
                    $('.ajaxDeptDiv').find('.ibs-ico-set-level').eq(0).removeClass('ibs-ico-set-level').addClass('ibs-ico-set-park');
                    expandTree();
                } else {
                    _html = renderDeptStatusTree(list);
                    $('.ajaxDeptDiv').html(_html);
                    $('.ajaxDeptDiv').find('.ibs-ico-set-level').eq(0).removeClass('ibs-ico-set-level').addClass('ibs-ico-set-park');
                    $('.ajaxDeptDiv .ibs-tree-txt[deptid='+ selectedDept +']').trigger('click');
                }
                initDeptStatus();
            }
        })
        .always(function() {
            layer.close(layerIndex);
        });
    }

    // 默认只展开根部门下的一级部门
    function expandTree() {
        // 展开
        var $ibsTreeSet1 = $('.ajaxDeptDiv').children('.ibs-tree-set');
        var $ibsTreePack1 = $ibsTreeSet1.children('.ibs-tree-pack');

        $ibsTreePack1.show();

        var $hasChidren = $ibsTreePack1.find('.hasChildren');
        $hasChidren.removeClass('ibs-tree-spread');
    }

    // 初始化状态树
    function initDeptStatus() {
        deptStatus = {};
        var $ibsTreeSets = $('.ajaxDeptDiv').find('.ibs-tree-set');
        $ibsTreeSets.each(function(i, o) {
            var $o = $(o),
                curDeptId = $o.attr('deptid');
            deptStatus[curDeptId] = {};
            if($(o).hasClass('hasChildren')) {
                if($o.hasClass('ibs-tree-spread')) {
                    deptStatus[curDeptId].spread = 1;
                } else {
                    deptStatus[curDeptId].spread = 0;
                }
            } else {
                deptStatus[curDeptId].spread = null;
            }
        });
    }

    function loadMemberList(did) {
        var layerIndex = layer.load(2, {shade: [0.1, '#000']});
        var memberListUrl = $('#memberListAjaxUrl').val();

        memberListUrl += '?did=' + did;
        $.ajax({
            url: memberListUrl,
            type: 'GET',
            dataType: 'html',
        })
        .done(function(res) {
            $('.ajaxTable').html(res);
        })
        .always(function() {
            layer.close(layerIndex);
        });
    }

    function reRenderMemberList(param) {
        $.ajax({
            url: param,
            type: 'GET',
            dataType: 'html',
        })
        .done(function(res) {
            $('.ajaxTable').html(res);
        })
        .always(function() {

        });
    }

    // 添加、修改部门
    function getDeptDialogHtml(d) {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="">' +
                        '<div class="layui-form-item">' +
                            '<label class="layui-form-label">部门名称</label>' +
                            '<div class="layui-input-block">' +
                                '<input type="text" name="name" value="'+ d.deptName +'" lay-verify="required"  lay-reqText="请填写部门名称" required placeholder="请填写部门名称" autocomplete="off" class="layui-input" >'+
                                '<input type="hidden" name="did" value="'+ d.deptId +'">' +
                            '</div>' +
                        '</div>' +
                        '<div class="layui-form-item">' +
                            '<label class="layui-form-label">上级部门</label>' +
                            '<div class="layui-input-block">' +
                                '<input type="text" name="eleTreeInput" value="'+ d.deptPname +'" required lay-verify="required"  lay-reqText="请选择" placeholder="请选择" readonly autocomplete="off" class="layui-input">' +
                                '<input type="hidden" name="pid" value="'+ d.deptPid +'">' +
                                '<div class="eleTree eleTreeX" lay-filter="eleTreeX"></div>' +
                            '</div>' +
                        '</div>' +
                        '<!--写一个隐藏的btn -->' +
                        '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                        '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    function eventHandle() {
        /**
         * 权限列表
         */
        // 删除
        $(document).on('click', '.ajaxDel', function() {
            var url = $(this).attr('data-url'),
                name = $(this).attr('data-name');

            Dialog.delDialog({
                content: '<div style="padding: 20px;">删除后将无法恢复，确定要删除成员【'+ name +'】吗？</div>',
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
                                    reRenderMemberList(res.data.url);
                                } else {
                                    window.location.reload();
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
        $(document).on('click', '.normalDialog', function() {
            var message = $(this).attr('data-message');
            Dialog.tipDialog({
                content: message,
                yesFn: function(index, layero) {
                    layer.close(index);
                }
            })
        });

        // 冻结
        $(document).on('click', '.ajaxFreezing', function() {
            var url = $(this).attr('data-url'),
                name = $(this).attr('data-name');

            Dialog.delDialog({
                title: '冻结成员',
                content: '<div style="padding: 20px;">冻结后，【'+ name +'】将无法登录系统。确定要冻结吗？</div>',
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
                                    reRenderMemberList(res.data.url);
                                } else {
                                    window.location.reload();
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

        // 解冻
        $(document).on('click', '.ajaxUnfreeze', function () {
            var url = $(this).attr('data-url'),
                name = $(this).attr('data-name');

            Req.getReq(url, function (res) {
                if(res.status) {
                    Dialog.successDialog(res.msg, function () {
                        if(res.data.url) {
                            reRenderMemberList(res.data.url);
                        } else {
                            window.location.reload();
                        }
                    });
                } else {
                    Dialog.errorDialog(res.msg);
                }
            });

            // Dialog.confirmDialog({
            //     title: '解冻成员',
            //     content: '<div style="padding: 20px;">确定要解冻【'+ name +'】吗？</div>',
            //     yesFn: function(index, layero) {
            //         var layerIndex = layer.load(2, {shade: [0.1, '#000']});
            //         $.ajax({
            //             url: url,
            //             type: 'GET',
            //             dataType: 'json',
            //         })
            //             .done(function(res) {
            //                 if(res.status) {
            //                     Dialog.successDialog(res.msg, function () {
            //                         layer.close(index);
            //                         if(res.data.url) {
            //                             reRenderMemberList(res.data.url);
            //                         } else {
            //                             window.location.reload();
            //                         }
            //                     });
            //                 } else {
            //                     Dialog.errorDialog(res.msg);
            //                 }
            //             })
            //             .always(function() {
            //                 layer.close(layerIndex);
            //             });
            //     }
            // });
        });

        // 上移\下移
        $(document).on('click', '.ajaxUpdown', function() {
            var url = $(this).attr('data-url');
            $.ajax({
                url: url,
                type: 'GET',
                dataType: 'json',
            })
                .done(function(res) {
                    if(res.status) {
                        if(res.data.url) {
                            reRenderMemberList(res.data.url);
                        } else {
                            window.location.reload();
                        }
                    } else {
                        Dialog.errorDialog(res.msg);
                    }
                })
                .always(function() {

                });
        });


        // 搜索
        $(document).on('click', '#ajaxSearch', function() {
            var param  = getSplitParam();
            Pager.renderPager(param);
        });
        $(document).on('keydown', 'input[name=keyword]', function(e) {
            if (e.keyCode == 13) {
                var param  = getSplitParam();
                Pager.renderPager(param);
            }
        });


        /**
         * 左侧树操作
         */
        // 添加子部门
        $(document).on('click', '.ibs-tree-add', function(e) {
            e.stopPropagation();
            var deptId = $(this).attr('deptid'),
                deptName = $(this).attr('deptname');
            addEditDept(1, {
                deptId: '',
                deptName: '',
                deptPid: deptId,
                deptPname: deptName
            }, function(res) {
                var result = res.data.deptInfo;
                if(result) {
                    // 添加完子节点，将父节点置为展开状态
                    deptStatus[result.deptPid].spread = 1;
                    // 添加完子节点，更新当前节点展开状态为null
                    deptStatus[result.deptId] = {spread: null};
                    selectedDept = result.deptId;
                    loadDeptTree(2);
                }
            });
        });
        // 修改子部门
        $(document).on('click', '.ibs-tree-mod', function(e) {
            e.stopPropagation();
            var deptId = $(this).attr('deptid'),
                deptName = $(this).attr('deptname'),
                deptPid = $(this).attr('deptpid'),
                deptPname = $(this).attr('deptpname');

            addEditDept(2, {
                deptId: deptId,
                deptName: deptName,
                deptPid: deptPid,
                deptPname: deptPname
            }, function(deptPid, deptId) {
                // 添加完子节点，将父节点置为展开状态
                // deptStatus[deptPid].spread = 1;
                // 添加完子节点，更新当前节点展开状态为null
                // deptStatus[deptId] = {spread: null};
                // selectedDept = deptId;
                loadDeptTree(2);
            });

        });

        // 删除子部门
        $(document).on('click', '.ibs-tree-del', function(e) {
            e.stopPropagation();
            var deptId = $(this).attr('deptid'),
                deptName = $(this).attr('deptname'),
                deptPid = $(this).attr('deptpid'),
                hasChildDept = $(this).attr('haschilddept');

            Dialog.delDialog({
                title: '删除部门',
                content: '<div style="padding: 20px;">确定要删除【'+ deptName +'】部门吗？</div>',
                yesFn: function(index, layero) {
                    if(hasChildDept != '0') {
                        Dialog.errorDialog('该部门存在子部门,无法删除');
                        return false;
                    }
                    var url = $('#delDeptAjaxUrl').val();
                    url += '?did=' + deptId;
                    Req.getReq(url, function(res) {
                        if(res.status) {
                            layer.close(index);
                            Dialog.successDialog(res.msg);

                            var $ibsTreeSetParent = $('.ibs-tree-set[deptid='+ deptPid +']'),
                                $ibsTreeSetChild = $ibsTreeSetParent.find('.ibs-tree-set[deptpid='+ deptPid +']'),
                                len = $ibsTreeSetChild.length,
                                $curIbsTreeSet = $('.ibs-tree-set[deptid='+ deptId +']'),
                                curIndex = $ibsTreeSetChild.index($curIbsTreeSet);

                            // 当前目录只有一个子节点
                            if(len == 1) {
                                selectedDept = deptPid;
                            } else {
                                if(curIndex == (len - 1)) {
                                    // 点击最后一个子节点，选中节点取当前节点前面一个子节点
                                    selectedDept = $curIbsTreeSet.prev().attr('deptid');
                                } else {
                                    // 选中节点取当前节点下面的子节点
                                    if(!selectedDept) {
                                        selectedDept = $curIbsTreeSet.next().attr('deptid');
                                    }
                                }
                            }
                            loadDeptTree(2);
                        } else {
                            Dialog.errorDialog(res.msg);
                        }

                    });
                }
            })
        });
        // 上移\下移子部门
        $(document).on('click', '.ibs-tree-up, .ibs-tree-down', function(e) {
            e.stopPropagation();
            var deptId = $(this).attr('deptid');
            var url = $('#moveDeptAjaxUrl').val(), type = 'up';

            if($(this).hasClass('ibs-tree-down')) {
                type = 'down';
            }
            url += '?did=' + deptId + '&type=' + type;

            Req.getReq(url, function(res) {
                if(res.status) {
                    loadDeptTree(2);
                } else {
                    Dialog.errorDialog(res.msg);
                }

            });
        });

        $(document).on('click', '.ibs-tree-txt', function(e) {
            e.stopPropagation();
            var $o = $(this);
            $('.ibs-tree-entry').removeClass('active');
            $o.parent().parent().addClass('active');

            var curDept = $o.attr('deptid');
            selectedDept = curDept;
            loadMemberList(curDept);
        });

        $(document).on('click', '.ibs-tree-iconClick', function(e) {
            e.stopPropagation();
            var $o = $(this),
                deptId = $o.attr('deptid'),
                $ibsTreeSet = $o.parent().parent().parent(),
                $ibsTreePack = $ibsTreeSet.children('.ibs-tree-pack');

            if($ibsTreeSet.hasClass('hasChildren')) {
                // 含子部门
                if($ibsTreePack.is(':visible')) {
                    $ibsTreePack.slideUp();
                    $ibsTreeSet.removeClass('ibs-tree-spread');
                    deptStatus[deptId].spread = 0;
                } else {
                    $ibsTreePack.slideDown();
                    $ibsTreeSet.addClass('ibs-tree-spread');
                    deptStatus[deptId].spread = 1;
                }
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
        var $activeIbsTreeEntry = $('.ibs-tree-entry.active');
        if($activeIbsTreeEntry.length) {
            param.did = $activeIbsTreeEntry.find('.ibs-tree-txt').attr('deptid');
        } else {
            param.did = 0;
        }

        return param;
    }

    // 设置左右两区域高度
    function setTreeBoxHeight() {
        var docHeight = $(document).height();
        var _height = 180;
        $('.ibs-tree-box').find('.layui-card').height(docHeight - _height);
    }

    function init() {
        var pageAjaxUrl = $('#memberListAjaxUrl').val();
        Pager.initPager({
            type: 2,
            url: pageAjaxUrl,
            callback: getSplitParam,
            target: $('.ajaxTable')
        });
        loadDeptTree(1);
        setTreeBoxHeight();
        loadMemberList(0);

        eventHandle();
    }

    // 递归转换数据
    function convertData(list) {
        var result = [];

        for(var i = 0, len = list.length; i < len; i++) {
            var param = {};
            param.id = list[i].deptId;
            param.label = list[i].deptName;
            if(list[i].deptList.length) {
                param.children = convertData(list[i].deptList);
            }
            result.push(param);
        }
        return result;
    }

    function addEditDept(type, data, callback) {
        var url = '';
        if(type == '1') {
            // 添加
            url = $('#addDeptAjaxUrl').val();
        } else {
            // 编辑
            url = $('#updateDeptAjaxUrl').val();
        }

        Dialog.formDialog({
            title: type == '1' ? '添加部门' : '修改部门',
            content: getDeptDialogHtml(data),
            success: function(layero, index) {
                layero.find('input[name=eleTreeInput]').click(function (e) {
                    e.stopPropagation();
                    // 转化部门数据
                    if(!eleTreeX) {
                        $.ajax({
                            url: $('#deptListAjaxUrl').val(),
                            type: 'GET',
                            dataType: 'json',
                        })
                            .done(function(res) {
                                if(res.status) {
                                    eleTreeX = eleTree.render({
                                        elem: '.eleTreeX',
                                        data: convertData(res.data.data),
                                        defaultExpandAll: true,
                                        expandOnClickNode: false,
                                        highlightCurrent: true
                                    });
                                    $(".eleTreeX").show();
                                }
                            })
                            .always(function() {
                            });
                    } else {
                        $(".eleTreeX").show();
                    }

                    eleTree.on("nodeClick(eleTreeX)",function(d) {
                        $("input[name='eleTreeInput']").val(d.data.currentData.label);
                        $("input[name='pid']").val(d.data.currentData.id);
                        $(".eleTreeX").hide();
                        eleTreeX = null;
                    });
                    $(document).on("click",function() {
                        $(".eleTreeX").hide();
                    });
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
                                Dialog.successDialog(res.msg);
                                layer.close(index);
                                if(type == '1') {
                                    // 添加
                                    callback && callback(res);
                                } else {
                                    // 修改
                                    callback && callback(data.field.pid, data.field.did);
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
                eleTreeX = null;
            }
        });
    }

    $(function() {
        init();

        // 添加部门
        $(document).on('click', '.addDept', function() {
            var $activeIbsTreeEntry = $('.ibs-tree-entry.active');
            var deptPid = '',
                deptPname = '';
            if($activeIbsTreeEntry.length) {
                deptPid = $activeIbsTreeEntry.attr('deptid');
                deptPname = $activeIbsTreeEntry.parent('.ibs-tree-set').attr('deptname');
            } else {
                deptPid = $('.ajaxDeptDiv > .ibs-tree-set').attr('deptid');
                deptPname = $('.ajaxDeptDiv > .ibs-tree-set').attr('deptname');
            }

            addEditDept(1, {
                deptId: '',
                deptName: '',
                deptPid: deptPid,
                deptPname: deptPname
            },function(res) {
                var result = res.data.deptInfo;
                if(result) {
                    // 添加完子节点，将父节点置为展开状态
                    deptStatus[result.deptPid].spread = 1;
                    // 添加完子节点，更新当前节点展开状态为null
                    deptStatus[result.deptId] = {spread: null};
                    selectedDept = result.deptId;
                    loadDeptTree(2);
                }
            });
        });

        // 添加成员
        $(document).on('click', '.ibs-tree-box-right .layui-btn', function (e) {
            e.preventDefault();
            var $activeIbsTreeEntry = $('.ibs-tree-entry.active');
            if($activeIbsTreeEntry.length) {
                localStorage.setItem('ibsDeptId', $activeIbsTreeEntry.attr('deptid'));
                localStorage.setItem('ibsDeptName', $activeIbsTreeEntry.attr('deptname'));
            } else {
                localStorage.removeItem('ibsDeptId');
                localStorage.removeItem('ibsDeptName');
            }

            var href = $(this).attr('href');
            window.location.href = href;
        });
    });
});