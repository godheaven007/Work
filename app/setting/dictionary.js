/**
 * 设置-字典管理
 */

layui.use(['element', 'form', 'layer', 'Pager', 'Dialog', 'Req', 'Common'], function() {
    var $ = layui.jquery,
        form = layui.form,
        $form = $('form'),
        layer = layui.layer,
        element = layui.element;

    var Dialog = layui.Dialog;
    var Pager = layui.Pager;
    var Common = layui.Common;
    var Req = layui.Req;
    var navDataList = [];
    var activeSubItem;        // 第一个分类

    // ibs-tree 工具栏
    function getMorePack(curIndex, size, item) {
        var _html = '<ul class="ibs-tree-more-pack">' +
                        '<li class="ibs-tree-mod" typeUuId="'+ item.uuId +'" classifyName="'+ item.typeName +'"><a href="javascript:void(0);">修改</a></li>' +
                        '<li class="ibs-tree-del" typeUuId="'+ item.uuId +'" classifyName="'+ item.typeName +'"><a href="javascript:void(0);">删除</a></li>';
        if(size == 1) {
            // 无上移下移
            _html += '</ul>';
            return _html;
        }

        if(curIndex == 0) {
            // 无上移
            _html += '<li class="ibs-tree-down" typeUuId="'+ item.uuId +'" operateType="0"><a href="javascript:void(0);">下移</a></li>' +
                '</ul>';
            return _html;
        } else if(curIndex == (size - 1)) {
            // 无下移
            _html +=
                '<li class="ibs-tree-up" typeUuId="'+ item.uuId +'"  operateType="1"><a href="javascript:void(0);">上移</a></li>' +
                '</ul>';
            return _html;
        } else {
            _html +=
                '<li class="ibs-tree-up" typeUuId="'+ item.uuId +'"  operateType="1"><a href="javascript:void(0);">上移</a></li>' +
                '<li class="ibs-tree-down" typeUuId="'+ item.uuId +'"  operateType="0"><a href="javascript:void(0);">下移</a></li>' +
                '</ul>';
            return _html;
        }
    }

    function renderSubjectTree() {
        var _html = '';

        _html += '<div class="ibs-tree-set ibs-tree-spread hasChildren">' +
            '<div class="ibs-tree-entry">' +
            '<div class="ibs-tree-main">' +
            '<div class="ibs-tree-iconClick"><i class="ibs-tree-iconArrow"></i></div>' +
            '<div class="ibs-tree-txt ibs-tree-all" style="cursor: default;"><i class="iconfont ibs-ico-folders mr-5"></i>全部</div>' +
            '</div>'+
            '</div>' +
            '<div class="ibs-tree-pack" style="display:block;">';
        for(var i = 0, len = navDataList.length; i < len; i++) {
            var item = navDataList[i];
            _html += '<div class="ibs-tree-set">' +
                        '<div class="ibs-tree-entry secondSubject" typeId="' + item.typeId + '" typeName="' + item.typeName + '" uuId="' + item.uuId + '">' +
                            '<div class="ibs-tree-main">' +
                                '<div class="ibs-tree-iconClick"><i class="ibs-tree-iconArrow ibs-no-child"></i></div>' +
                                '<div class="ibs-tree-txt" typeId="' + item.typeId + '" uuId="'+ item.uuId +'"><i class="iconfont ibs-ico-folders mr-5"></i>' + item.typeName + '</div>' +
                            '</div>' +
                            '<div class="ibs-tree-more">' +
                                '<i class="iconfont ibs-ico-more"></i>' +
                                getMorePack(i, len, item) +
                            '</div>' +
                        '</div>' +
                    '</div>';
        }
        _html +=
            '</div>' +
            '</div>';

        return _html;
    }

    function loadSubTree(callback) {
        var _html = '';
        var url = $('#ajax_nav_data').val();
        var param = Common.Util.getSearchParam();

        var layerIndex = layer.load(2, {shade: [0.1, '#000']});
        Req.postReq(url, {UuId: param.UuId}, function (res) {
            if(res.status) {
                if(res.data.list.length) {
                    navDataList = res.data.list;
                    if(!activeSubItem) {
                        activeSubItem = navDataList[0].uuId;
                    }
                    _html = renderSubjectTree(res.data.list);
                    $('.ajaxSubjectDiv').html(_html);
                }
                if(callback && Object.prototype.toString.call(callback) == '[object Function]') {
                    callback();
                }
            } else {
                Dialog.errorDialog(res.msg);
            }
            layer.close(layerIndex);
        });
    }

    function loadSubList() {
        var subListUrl = $('#pageAjaxUrl').val();

        subListUrl += '&typeUuId=' + activeSubItem;

        Req.getReq(subListUrl, function (res) {
            $('.ajaxSubTable').html(res);
            $('.ibs-tree-entry[uuid='+ activeSubItem +']').addClass('active');
        }, 'html');
    }

    function getCateOpts() {
        var opts = '<option value="">请选择</option>';

        navDataList.forEach(function (item, index) {
            opts += '<option value="'+ item.uuId +'" data-typeid="'+ item.typeId +'">'+ item.typeName +'</option>';
        });
        return opts;
    }

    function getClassifyDialogHtml(param) {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item">' +
                                '<div class="layui-input-blockx">' +
                                    '<input type="text" name="classifyName" value="'+ param.classifyName +'" maxlength="10" lay-reqText="请填写分类名称" required placeholder="输入分类名称" autocomplete="off" class="layui-input" >'+
                                    '<input type="hidden" name="typeUuId" value="'+ param.typeUuId +'">' +
                                '</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    function getOptsDialogHtml(param) {
        var _html = '<div class="layui-card-body">' +
            '<form class="layui-form" action="" lay-filter="formDialog">' +
                '<div class="layui-form-item">' +
                    '<label class="layui-form-label"><span class="c-orange">* </span>选项名称</label>' +
                    '<div class="layui-input-block">' +
                        '<input type="text" name="optionName" maxlength="15" value="'+ param.optionName +'" lay-verify="required" lay-reqText="请填写选项名称" required placeholder="请填写选项名称" autocomplete="off" class="layui-input" >'+
                    '</div>' +
                '</div>' +
                '<div class="layui-form-item">' +
                    '<label class="layui-form-label"><span class="c-orange">* </span>所属分类</label>' +
                    '<div class="layui-input-block">' +
                        '<select name="typeUuId" lay-verify="required" lay-reqText="所属分类" lay-filter="typeUuId">' +
                            getCateOpts() +
                        '</select>' +
                    '</div>' +
                '</div>' +
                '<div class="layui-form-item">' +
                    '<label class="layui-form-label"><span class="c-orange">* </span>排序值</label>' +
                    '<div class="layui-input-block">' +
                        '<input type="text" name="optionSort" value="'+ param.optionSort +'" lay-verify="required|onlyZeroInteger" maxlength="4" lay-reqText="请填写排序值" required placeholder="输入数字，越小越靠前" autocomplete="off" class="layui-input" >' +
                        '<input type="hidden" name="optionUuId" value="'+ param.optionUuId +'">' +
                    '</div>' +
                '</div>'+
                '<div class="layui-form-item">' +
                    '<label class="layui-form-label">备注</label>' +
                    '<div class="layui-input-block">' +
                        '<input type="text" name="remark" value="'+ param.remark +'" maxlength="50" autocomplete="off" class="layui-input" >' +
                    '</div>' +
                '</div>'+
                '<!--写一个隐藏的btn -->' +
                '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                '</button>' +
            '</form>' +
            '</div>';
        return _html;
    }

    // 添加、修改分类
    function addEditClassify(param) {
        Dialog.formDialog({
            title: param.title,
            content: getClassifyDialogHtml(param),
            area: ['500px', 'auto'],
            success: function (layero, index) {
                var $form = layero.find('form');

                form.render(null, 'formDialog');

                form.on('submit(bind)', function(data) {

                    var $classify = layero.find('input[name=classifyName]'),
                        classifyName = $classify.val();
                    if(classifyName.length < 2) {
                        Dialog.errorDialog("分类名称2~10个字");
                        return false;
                    }

                    var reqParam = $form.serializeArray();
                    Req.postReq(param.url, reqParam, function (res) {
                        if(res.status) {
                            Dialog.successDialog(res.msg, function () {
                                reRender();
                                layer.close(index);
                            });
                        } else {
                            Dialog.errorDialog(res.msg);
                        }
                    });
                    return false;
                })
            }
        })
    }

    // 添加、修改选项值
    function addEditOpts(param) {
        Dialog.formDialog({
            title: param.title,
            content: getOptsDialogHtml(param),
            area: ['500px', 'auto'],
            success: function (layero, index) {
                var $form = layero.find('form');

                form.val('formDialog', {
                    typeUuId: param.typeUuId
                });
                form.render(null, 'formDialog');

                form.on('submit(bind)', function(data) {
                    var $optionName = layero.find('input[name=optionName]'),
                        optionName = $optionName.val();
                    if(optionName.length < 2) {
                        Dialog.errorDialog("选项名称2~15个字");
                        return false;
                    }
                    var reqParam = $form.serializeArray();
                    Req.postReq(param.url, reqParam, function (res) {
                        if(res.status) {
                            Dialog.successDialog(res.msg, function () {
                                reRender();
                                layer.close(index);
                            });
                        } else {
                            Dialog.errorDialog(res.msg);
                        }
                    });
                    return false;
                })
            }
        })
    }

    function getSplitParam() {
        var param = {
            limit: $('.ajaxpageselect option:selected').val() || 10,
            page: $('.inputpage').val() || 1,
            typeUuId: activeSubItem
        };

        return param;
    }

    function init() {
        reRender();

        var pageAjaxUrl = $('#pageAjaxUrl').val();
        Pager.initPager({
            type: 2,
            url: pageAjaxUrl,
            target: $('.ajaxSubTable'),
            callback: getSplitParam
        });
    }

    // 删除、添加后更新
    function reRender() {
        loadSubTree(function() {
            loadSubList();
        });
    }

    $(function() {

        init();

        // 添加分类
        $(document).on('click', '.addSecondSubject', function() {
            var param = {
                title: '添加分类',
                typeUuId: '',
                classifyName: '',
                url: $('#ajax_add_classify').val()
            };

            addEditClassify(param);
        });

        // 修改分类
        $(document).on('click', '.ibs-tree-mod', function(e) {
            e.stopPropagation();
            var $o = $(this),
                classifyName = $o.attr('classifyname'),
                typeUuId = $o.attr('typeuuid');

            var param = {
                title: '修改分类',
                typeUuId: typeUuId,
                classifyName: classifyName,
                url: $('#ajax_modify_classify').val(),
            };

            addEditClassify(param);
        });

        // 删除分类
        $(document).on('click', '.ibs-tree-del', function(e) {
            e.stopPropagation();
            var $o = $(this),
                url = $('#ajax_del_classify').val(),
                classifyName = $o.attr('classifyname'),
                typeUuId = $o.attr('typeuuid');

            Dialog.delDialog({
                title: '删除分类',
                content: '<div style="padding: 20px;">确定要删除分类【'+ classifyName +'】吗？</div>',
                yesFn: function (index, layero) {
                    Req.postReq(url, {typeUuId: typeUuId}, function (res) {
                        if(res.status) {
                            Dialog.successDialog(res.msg, function () {
                                if(activeSubItem == typeUuId) {
                                    // 选中的是当前节点，执行删除
                                    var $ibsTreeSets = $('.ibs-tree-set');
                                    activeSubItem = $ibsTreeSets.eq(0).find('.ibs-tree-entry').attr('uuid');
                                }
                                reRender();
                                layer.close(index);
                            })
                        } else {
                            Dialog.errorDialog(res.msg);
                        }
                    });
                }
            })
        });

        // 上移、下移
        $(document).on('click', '.ibs-tree-up, .ibs-tree-down', function(e) {
            e.stopPropagation();
            var $o = $(this),
                url = $('#ajax_move_classify').val(),
                operateType = $o.attr('operatetype'),
                typeUuId = $o.attr('typeuuid');

            var param = {
                operateType: operateType,
                typeUuId: typeUuId
            };

            Req.postReq(url, param, function (res) {
                if(res.status) {
                    reRender();
                } else {
                    Dialog.errorDialog(res.msg);
                }
            });
        });

        // 添加选项值
        $(document).on('click', '.addThirdSubject', function() {
            var param = {
                url: $('#ajax_add_option').val(),
                optionName: '',
                typeUuId: activeSubItem,
                optionSort: '',
                optionUuId: '',
                remark: '',
                title: '添加选项值'
            };
            addEditOpts(param);
        });

        // 修改选项值
        $(document).on('click', '.update', function() {
            var $o = $(this),
                url = $o.attr('data-url'),
                typeUuId = $o.attr('data-typeuuid'),
                optionName = $o.attr('data-codeKey'),
                optionSort = $o.attr('data-codesort'),
                optionUuId = $o.attr('data-optionuuid'),
                remark = $o.attr('data-coderemark');

            var param = {
                url: url,
                optionName: optionName,
                typeUuId: typeUuId,
                optionSort: optionSort,
                optionUuId: optionUuId,
                remark: remark,
                title: '修改选项值'
            };
            addEditOpts(param);
        });

        // 删除
        $(document).on('click', '.del', function() {
            var $o = $(this),
                url = $o.attr('data-url'),
                optionName = $o.attr('data-codeKey'),
                optionUuId = $o.attr('data-optionuuid');

            Dialog.delDialog({
                title: '删除选项',
                content: '<div style="padding: 20px;">确定要删除选项【'+ optionName +'】吗？</div>',
                yesFn: function(index, layero) {
                    Req.postReq(url, {optionUuId: optionUuId}, function (res) {
                        if(res.status) {
                            Dialog.successDialog(res.msg, function () {
                                reRender();
                                layer.close(index);
                            })
                        } else {
                            Dialog.errorDialog(res.msg);
                        }
                    });
                }
            });
        });

        // 删除
        $(document).on('click', '.ibs-tree-del', function(e) {
            e.stopPropagation();
            var $o = $(this),
                subId = $o.attr('subid'),
                subName = $o.attr('subname');
            Dialog.delDialog({
                title: '科目删除',
                content: '<div style="padding: 20px;">确定要删除科目【'+ subName +'】吗？</div>',
                yesFn: function (index, layero) {
                    var url = $('#delSubjectAjaxUrl').val();
                    url = url + '?id=' + subId;
                    Req.getReq(url, function (res) {
                        if(res.status) {
                            Dialog.successDialog(res.msg, function () {
                                reRender();
                                layer.close(index);
                            })
                        } else {
                            Dialog.errorDialog(res.msg);
                        }
                    })
                }
            })
        });

        $(document).on('click', '.ibs-tree-txt', function(e) {
            e.stopPropagation();
            var $o = $(this);

            if($o.hasClass('ibs-tree-all')) return;

            $('.ibs-tree-entry').removeClass('active');
            $o.parent().parent().addClass('active');

            var curSubId = $o.attr('uuid');
            activeSubItem = curSubId;
            loadSubList(curSubId);
        });

        // 展开\关闭
        // $(document).on('click', '.ibs-tree-iconClick', function(e) {
        //     e.stopPropagation();
        //     var $o = $(this),
        //         $ibsTreeSet = $o.parent().parent().parent(),
        //         $ibsTreePack = $ibsTreeSet.children('.ibs-tree-pack');
        //
        //     if($ibsTreeSet.hasClass('hasChildren')) {
        //         // 含子部门
        //         if($ibsTreePack.is(':visible')) {
        //             $ibsTreePack.slideUp();
        //             $ibsTreeSet.removeClass('ibs-tree-spread');
        //         } else {
        //             $ibsTreePack.slideDown();
        //             $ibsTreeSet.addClass('ibs-tree-spread');
        //         }
        //     }
        // });



        form.on('submit', function(data) {
            return false;
        });
    });
});