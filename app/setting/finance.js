/**
 * 设置-财务
 */

layui.use(['element', 'form', 'Dialog', 'Pager', 'eleTree', 'Pager', 'Req', 'Common'], function() {
    var $ = layui.jquery,
        form = layui.form,
        element = layui.element;

    var Dialog = layui.Dialog;
    var Pager = layui.Pager;
    var Common = layui.Common;
    var Req = layui.Req;
    var listData = [];
    var activeSubItem = 0;        // 选中的一级科目或二级科目


    // 获取上级科目选项
    function getParentSubjectOpts(type) {
        var opts = '<option value="">请选择</option>';

        if(type == 'add2' || type == 'edit2') {
            // 一级科目
            oneArrList.forEach(function(item, index) {
               opts += '<option value="'+ item.id +'" topid="'+ item.id +'">'+ item.name +'</option>';
            });
        } else if(type == 'add3' || type == 'edit3') {
            // 二级科目
            listData.forEach(function (item, index) {
                opts += '<option value="'+ item.subId +'" topid="'+ item.pSubId +'">'+ item.subName +'</option>';
            });

        }
        return opts;
    }

    function getIbsSubjectOpts() {
        var opts = '<option value="">请选择</option>';

        IBSCodeList.forEach(function (item, index) {
            opts += '<option value="'+ item.codeValue +'">'+ item.codeKey +'</option>';
        });
        return opts;
    }

    // 二级科目\三级科目
    function getSecondSubDialogHtml(param) {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">';
        if(param.type == 'add2' || param.type == 'add3' || param.type == 'edit3') {
            // 添加二级科目
            _html += '<div class="layui-form-item">' +
                        '<label class="layui-form-label"><span class="c-orange">* </span>上级科目</label>' +
                        '<div class="layui-input-block">' +
                            '<select name="parentSubjectId" lay-verify="required"  lay-reqText="请选择上级科目" lay-filter="parentSubject">' +
                                getParentSubjectOpts(param.type) +
                            '</select>' +
                        '</div>' +
                     '</div>';
        } else if(param.type == 'edit2') {
            // 编辑二级科目
            _html += '<div class="layui-form-item">' +
                        '<label class="layui-form-label">上级科目</label>' +
                        '<div class="layui-form-mid">' +
                            '<span>'+ param.pSubName +'</span>' +
                        '</div>' +
                     '</div>';
        }
        _html +=     '<div class="layui-form-item">' +
                        '<label class="layui-form-label">科目类别</label>' +
                        '<div class="layui-form-mid">' +
                            '<span class="subType">'+ param.subCate +'</span>' +
                        '</div>' +
                     '</div>' +
                     '<div class="layui-form-item">' +
                        '<label class="layui-form-label"><span class="c-orange">* </span>科目名称</label>' +
                        '<div class="layui-input-block">' +
                            '<input type="text" name="name" value="'+ param.subName +'" lay-verify="required"  lay-reqText="请填写财务科目名称" required placeholder="请填写财务科目名称" autocomplete="off" class="layui-input" >'+
                        '</div>' +
                     '</div>';
        if(param.type == 'edit3' && param.ibsRelate) {
            _html += '<div class="layui-form-item">' +
                         '<label class="layui-form-label" style="width:100px; text-align: left; padding-right: 0;">关联系统科目</label>' +
                         '<div class="layui-form-mid">' +
                            '<span>'+ param.ibsRelate +'</span>' +
                         '</div>' +
                     '</div>';
        }
        if(param.type == 'add3' || param.type == 'edit3') {
            // _html += '<div class="layui-form-item">' +
            //             '<label class="layui-form-label">关联系统科目</label>' +
            //             '<div class="layui-input-block">' +
            //                 '<select name="ibsSubject" lay-filter="ibsSubject">' +
            //                     getIbsSubjectOpts() +
            //                 '</select>' +
            //             '</div>' +
            //          '</div>' +
            _html +=
                     '<div class="layui-form-item">' +
                        '<label class="layui-form-label"><span class="c-orange">* </span>排序值</label>' +
                        '<div class="layui-input-block">' +
                            '<input type="text" name="sort" value="'+ param.sort +'" lay-verify="required|only1to255"  lay-reqText="请填写排序值" required placeholder="请填写排序值" autocomplete="off" class="layui-input" >' +
                        '</div>' +
                     '</div>' +
                    '<div class="layui-form-item">' +
                        '<label class="layui-form-label"><span class="c-orange">* </span>是否开票</label>' +
                        '<div class="layui-input-block">' +
                            '<input type="radio" name="markInvoice" value="1" title="开票">' +
                            '<input type="radio" name="markInvoice" value="0" title="不开票">' +
                        '</div>' +
                    '</div>';

        }

        if(param.type == 'edit2') {
            _html += '<input type="hidden" name="id" value="'+ param.subId +'">' +
                     '<input type="hidden" name="parentSubjectId" value="'+ param.pSubId +'">';
        }
        _html +=

                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    // 动态切换科目类别
    // function setSubType($subType, v) {
    //     if(v == '1') {
    //         $subType.text('收款')
    //     } else if(v == '2') {
    //         $subType.text('付款');
    //     } else {
    //         for(var i = 0, len = listData.length; i < len; i++) {
    //             if(listData[i].subId == v) {
    //                 if(listData[i].pSubId == '1') {
    //                     $subType.text('收款')
    //                 } else if(listData[i].pSubId == '2') {
    //                     $subType.text('付款');
    //                 }
    //                 break;
    //             }
    //         }
    //     }
    // }

    function setSubType($subType, v) {
        if(v == '1') {
            $subType.text('收款')
        } else {
            $subType.text('付款');
        }
    }

    // 添加\编辑科目(二级\三级)
    function addEditSubject(param) {
        Dialog.formDialog({
            title: param.title,
            content: getSecondSubDialogHtml(param),
            area: ['500px', 'auto'],
            success: function (layero, index) {
                var $form = layero.find('form');

                form.val('formDialog', {
                    parentSubjectId: param.pSubId,
                    ibsSubject: param.ibsRelate,
                    markInvoice: param.markInvoice
                });

                form.render(null, 'formDialog');
                var $subType = layero.find('.subType');

                // 收入->收款，支出->付款
                form.on('select(parentSubject)', function (data) {
                    var topId = $('select[name=parentSubjectId]').find("option:selected").attr('topid');
                    // setSubType($subType, data.value);
                    setSubType($subType, topId);
                });

                form.on('submit(formDialog)', function(data) {
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

                    // Req.postReqCommon(param.url, reqParam);
                    return false;
                })
            }
        })
    }

    // ibs-tree 工具栏
    function getMorePack(curIndex, size, item) {
        var _html = '<ul class="ibs-tree-more-pack">' +
            '<li class="ibs-tree-mod" subId="' + item.subjectId + '" subName="' + item.subjectName + '" pSubId="' + item.parentSubjectId + '" pSubName="' + item.parentSubjectName + '"><a href="javascript:void(0);">修改</a></li>' +
            '<li class="ibs-tree-del" subId="' + item.subjectId + '" subName="' + item.subjectName + '" pSubId="' + item.parentSubjectId + '" pSubName="' + item.parentSubjectName + '"><a href="javascript:void(0);">删除</a></li>';
        if(size == 1) {
            // 无上移下移
            _html += '</ul>';
            return _html;
        }

        if(curIndex == 0) {
            // 无上移
            _html += '<li class="ibs-tree-down" subId="' + item.subjectId + '" subName="' + item.subjectName + '" pSubId="' + item.parentSubjectId + '" pSubName="' + item.parentSubjectName + '"><a href="javascript:void(0);">下移</a></li>' +
                '</ul>';
            return _html;
        } else if(curIndex == (size - 1)) {
            // 无下移
            _html +=
                '<li class="ibs-tree-up" subId="' + item.subjectId + '" subName="' + item.subjectName + '" pSubId="' + item.parentSubjectId + '" pSubName="' + item.parentSubjectName + '"><a href="javascript:void(0);">上移</a></li>' +
                '</ul>';
            return _html;
        } else {
            _html +=
                '<li class="ibs-tree-up" subId="' + item.subjectId + '" subName="' + item.subjectName + '" pSubId="' + item.parentSubjectId + '" pSubName="' + item.parentSubjectName + '"><a href="javascript:void(0);">上移</a></li>' +
                '<li class="ibs-tree-down" subId="' + item.subjectId + '" subName="' + item.subjectName + '" pSubId="' + item.parentSubjectId + '" pSubName="' + item.parentSubjectName + '"><a href="javascript:void(0);">下移</a></li>' +
                '</ul>';
            return _html;
        }
    }

    function renderSubjectTree(rootId, list) {
        var _html = '', rootName = rootId == '1' ? '收入' : '支出';

        if(list.length) {
            _html += '<div class="ibs-tree-set ibs-tree-spread hasChildren">' +
                        '<div class="ibs-tree-entry" subId="'+ rootId +'">' +
                            '<div class="ibs-tree-main">' +
                                '<div class="ibs-tree-iconClick"><i class="ibs-tree-iconArrow"></i></div>' +
                                '<div class="ibs-tree-txt" subId="'+ rootId +'"><i class="iconfont ibs-ico-folders mr-5"></i>'+ rootName +'</div>' +
                            '</div>'+
                        '</div>' +
                        '<div class="ibs-tree-pack" style="display:block;">';
            for(var i = 0, len = list.length; i < len; i++) {
                var item = list[i];
                _html += '<div class="ibs-tree-set">' +
                            '<div class="ibs-tree-entry secondSubject" subId="' + item.subjectId + '" subName="' + item.subjectName + '" pSubId="' + item.parentSubjectId + '" pSubName="' + item.parentSubjectName + '">' +
                                '<div class="ibs-tree-main">' +
                                    '<div class="ibs-tree-iconClick"><i class="ibs-tree-iconArrow ibs-no-child"></i></div>' +
                                    '<div class="ibs-tree-txt" subId="' + item.subjectId + '"><i class="iconfont ibs-ico-folders mr-5"></i>' + item.subjectName + '</div>' +
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
        } else {
            // 只有一级科目
            _html += '<div class="ibs-tree-set">' +
                        '<div class="ibs-tree-entry">' +
                            '<div class="ibs-tree-main">' +
                                '<div class="ibs-tree-iconClick"></div>' +
                                '<div class="ibs-tree-txt" subId="'+ rootId +'"><i class="iconfont ibs-ico-folders mr-5"></i>'+ rootName +'</div>' +
                            '</div>'+
                        '</div>' +
                     '</div>';
        }

        return _html;
    }

    function doHandleData(list) {
        list.forEach(function (item, index) {
            var o = {};
            o.subId = item.subjectId;
            o.subName = item.subjectName;
            o.pSubId = item.parentSubjectId;
            o.pSubName = item.parentSubjectName;
            listData.push(o);
        });
    }
    function handleData(result) {
        listData.length = 0;
        var income = result.incomeChilds,
            pay = result.payChilds;
        doHandleData(income);
        doHandleData(pay);
    }

    function loadSubTree(callback) {
        var layerIndex = layer.load(2, {shade: [0.1, '#000']});
        var subListUrl = $('#subjectListAjaxUrl').val();
        Req.getReq(subListUrl, function (res) {
            if(res.status) {
                var result = res.data.subjects,
                    _html = '';
                handleData(result);
                _html += renderSubjectTree(result.incomeRootSubId, result.incomeChilds);
                _html += renderSubjectTree(result.payRootSubId, result.payChilds);
                $('.ajaxSubjectDiv').html(_html);
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
        var layerIndex = layer.load(2, {shade: [0.1, '#000']});
        var subListUrl = $('#subSubjectListAjaxUrl').val();

        subListUrl += '?id=' + activeSubItem;
        $.ajax({
            url: subListUrl,
            type: 'GET',
            dataType: 'html',
        })
        .done(function(res) {
            $('.ajaxSubTable').html(res);
            $('.ibs-tree-entry[subid='+ activeSubItem +']').addClass('active');
        })
        .always(function() {
            layer.close(layerIndex);
        });
    }

    function getSplitParam() {
        var param = {
            limit: $('.ajaxpageselect option:selected').val() || 10,
            page: $('.inputpage').val() || 1
        };
        if($('.ibs-tree-entry.active').length) {
            param.id = $('.ibs-tree-entry.active').attr('subid');
        }

        return param;
    }
    
    function init() {
        loadSubTree();
        loadSubList();
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
            loadSubList(activeSubItem);
        });
    }

    $(function() {
        init();
        // 添加二级科目
        $(document).on('click', '.addSecondSubject', function() {
            var param = {
                url: $('#addTwoSubjectAjaxUrl').val(),
                pSubName: '',
                pSubId: '1',
                subName: '',
                subId: '',
                subCate: '收款',    // 科目类别
                type: 'add2',        // 2：二级科目(add2\edit2) 3：三级科目
                title: '添加二级科目'
            };
            addEditSubject(param);
        });

        // 添加三级科目
        $(document).on('click', '.addThirdSubject', function() {
            var $activeTreeItem = $('.secondSubject.active');
            if(!$activeTreeItem.length) {
                Dialog.errorDialog('请先选择二级科目');
                return false;
            }

            var subId = $activeTreeItem.attr('subid'),
                subName = $activeTreeItem.attr('subname'),
                pSubId = $activeTreeItem.attr('psubid'),
                pSubName = $activeTreeItem.attr('psubname');

            var param = {
                url: $('#addSubjectAjaxUrl').val(),
                pSubName: subName,
                pSubId: subId,
                subName: '',
                subId: '',
                subCate: pSubId == '1' ? '收款' : '付款',    // 科目类别
                type: 'add3',           // 2：二级科目 3：三级科目
                title: '添加三级科目',
                ibsRelate: '',
                sort: '255',
                markInvoice: 1, // 0:不开票, 1:开票
            };
            addEditSubject(param);
        });

        // 编辑三级科目
        $(document).on('click', '.ajaxTableEdit', function () {
            var $o = $(this),
                url = $o.attr('data-url'),
                name = $o.attr('data-name'),
                ibsRelate = $o.attr('data-ibs-relate'),
                sort = $o.attr('data-sort'),
                subParent = $o.attr('data-sub-parent'),
                subType = $o.attr('data-sub-type'),
                markInvoice = !$o.attr('data-mark-invoice') ? '1' : $o.attr('data-mark-invoice');

            var param = {
                url: url,
                pSubName: '',
                pSubId: subParent,
                subName: name,
                subId: '',
                subCate: subType,        // 科目类别
                type: 'edit3',           // 2：二级科目 3：三级科目
                title: '编辑三级科目',
                ibsRelate: ibsRelate,
                sort: sort,
                markInvoice: markInvoice
            };
            addEditSubject(param);
        });

        // 删除三级科目
        $(document).on('click', '.ajaxTableDel', function () {
           var url = $(this).attr('data-url'),
               name = $(this).attr('data-name');
           Dialog.delDialog({
               title: '删除科目',
               content: '<div style="padding: 20px">确定要删除科目【'+ name +'】</div>',
               yesFn: function (index, layero) {
                   Req.getReq(url, function (res) {
                       if(res.status) {
                           Dialog.successDialog(res.msg, function () {
                               reRender();
                               layer.close(index);
                           });
                       } else {
                           Dialog.errorDialog(res.msg);
                       }
                   });
                   // Req.getReqCommon(url);
               }
           })
        });

        /**
         * 左侧树
         */
        // 修改二级科目
        $(document).on('click', '.ibs-tree-mod', function(e) {
            e.stopPropagation();
            var subId = $(this).attr('subid'),
                subName = $(this).attr('subname'),
                pSubId = $(this).attr('psubid'),
                pSubName = $(this).attr('psubname');

            var param = {
                url: $('#updateTwoSubjectAjaxUrl').val(),
                pSubName: pSubName,
                pSubId: pSubId,
                subName: subName,
                subId: subId,
                subCate: pSubId == '1' ? '收款' : '付款',    // 科目类别
                type: 'edit2',
                title: '编辑二级科目'
            };
            addEditSubject(param);

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
                    // Req.getReqCommon(url);
                }
            })
        });
        $(document).on('click', '.ibs-tree-txt', function(e) {
            e.stopPropagation();
            var $o = $(this);
            var txt = $o.text();
            $('.ibs-tree-entry').removeClass('active');
            $o.parent().parent().addClass('active');

            var curSubId = $o.attr('subid');
            activeSubItem = curSubId;
            loadSubList(curSubId);

            $('.subSubjectTitle').text(txt);

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
                } else {
                    $ibsTreePack.slideDown();
                    $ibsTreeSet.addClass('ibs-tree-spread');
                }
            }
        });

        // 上移、下移
        $(document).on('click', '.ibs-tree-up, .ibs-tree-down', function(e) {
            e.stopPropagation();
            var $o = $(this),
                url = $('#twoSubjectUpAjaxUrl').val();

            if($o.hasClass('ibs-tree-down')) {
                url = $('#twoSubjectDownAjaxUrl').val();
            }

            var param = {
                subId: $o.attr('subid')
            };

            Req.postReq(url, param, function (res) {
                if(res.status) {
                    reRender();
                } else {
                    Dialog.errorDialog(res.msg);
                }
            });
        });
    });
});