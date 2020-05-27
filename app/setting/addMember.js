/**
 * 设置-添加成员
 */

layui.use(['element', 'form', 'Dialog', 'eleTree', 'DPTree', 'CWTree', 'Req' ,'Common', 'MouseWheel', 'Scroll'], function() {
    var $ = layui.jquery,
        form = layui.form,
        element = layui.element,
        eleTree = layui.eleTree,
        DPTree = layui.DPTree,
        CWTree = layui.CWTree;

    var Dialog = layui.Dialog;
    var Common = layui.Common;
    var Req = layui.Req;

    var
        // deptList = [],      // 部门
        // parkList = [],      // 园区
        roleList = [],      // 角色
        // authList = [],      // 权限
        // otherList = [],     // 当范围中含有其他部门时，权限取该数据
        // operateList = [],   // 当类型为【按运营公司】时，权限取该数据
        userList = [];      // 企业微信成员

    var qyFlag = true,      // 是否可以连通企业微信通讯录
        qyMsg = '';

    var selectTree;

    /**
     * 部门\园区\角色\权限数据加载
     * @param url
     * @param type
     */
    function loadData(url, type) {
        Req.getReq(url, function(res) {
            if(res.status) {
                if(type == 1) {
                    // deptList = res.data.data;
                } else if(type == 2) {
                    // parkList = res.data.data;
                } else if(type == 3) {
                    // authList = res.data.data;
                } else if(type == 4) {
                    roleList = res.data.data;
                } else if(type == 6) {
                    // otherList = res.data.data;
                } else if(type == 7) {
                    // operateList = res.data.data;
                } else {
                    if(res.status) {
                        userList = res.data.qyData;
                    } else {
                        qyFlag = false;
                    }
                }
            }
        });
    }

    function init() {
        // 动态加载滚动条样式
        layui.link('http://ibs.'+ Common.Util.getRootDomain() +'/assets/css/third/mCustomScrollbar.css');

        // loadData($('#deptListAjaxUrl').val(), 1);
        // loadData($('#deptparkListAjaxUrl').val(), 2);
        // loadData($('input[name=authMenuListAjaxUrl]').val(), 3);
        loadData($('input[name=roleListAjaxUrl]').val(), 4);
        loadData($('#qyUserListAjaxUrl').val(), 5);
        // loadData($('input[name=otherMenuListAjaxUrl]').val(), 6);
        // loadData($('input[name=operateauthListAjaxUrl]').val(), 7);
    }

    function getAuthGroupHtml(type) {
        var _html = '<table class="layui-table mb-10">' +
                        '<colgroup>' +
                            '<col width="16%">' +
                            '<col width="">' +
                            '<col width="8%">' +
                        '</colgroup>' +
                        '<thead>' +
                            '<tr>' +
                                '<th colspan="3">' +
                                    '<span class="authNameSpan">权限组</span>' +
                                    '<input type="hidden" name="authName[]" value="权限组" class="authName">' +
                                    '<a href="javascript:;" title="编辑" class="ml-15 ajaxSaveAuthName" data-name="权限组"><i class="iconfont ibs-ico-menu-edit"></i></a>' +
                                    '<a href="javascript:;" title="删除" class="ml-10 ajaxDelAuthGroup"><i class="iconfont ibs-ico-deletenorml"></i></a>' +
                                '</th>' +
                            '</tr>' +
                        '</thead>' +
                        '<tbody>' +
                            '<tr>' +
                                '<td class="txt-c">范围</td>' +
                                '<td class="rangeDiv"></td>' +
                                '<td class="txt-c">' +
                                    '<a href="javascript:;" class="c-link selectRange" data-type="'+ type +'">设置</a>' +
                                    '<input type="hidden" name="authRange[]" class="authRange">' +
                                '</td>' +
                            '</tr>' +
                            '<tr>' +
                                '<td class="txt-c">权限</td>' +
                                '<td class="authDiv"></td>' +
                                '<td class="txt-c"><a href="javascript:;" class="c-link selectAuth" data-type="'+ type +'">设置</a>' +
                                    '<input type="hidden" name="authAuth[]" class="authAuth">' +
                                    '<input type="hidden" name="authRole[]" class="authRole">' +
                                '</td>' +
                            '</tr>' +
                        '</tbody>' +
                        '<input type="hidden" name="groupType" value="'+ type +'">' +
                    '</table>';
        return _html;
    }

    function getAuthEditHtml(name) {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="">' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label">权限组名称</label>' +
                                '<div class="layui-input-block">' +
                                    '<input type="text" name="authname" maxlength="20" value="'+ name +'" lay-verify="required"  lay-reqText="请填写权限组名称" required placeholder="请填写权限组名称" autocomplete="off" class="layui-input" >'+
                                '</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    function getAuthSelectHtmlHandle(radioType, hasOtherDept) {

        var _html = '<form class="layui-form layui-form-pane1" action="" lay-filter="formDialog">' +
                        '<div class="layui-card-body auth-pop" style="padding-top: 0;">' +
                            '<div class="auth-pop-item">' +
                                '<div class="layui-tab layui-tab-brief" lay-filter="tabBrief">' +
                                    '<ul class="layui-tab-title">' +
                                        '<li class="layui-this">按权限设置</li>';
                                        if(radioType == '1' && !hasOtherDept) {
                                            // 按园区&&范围不含【其他部门】
                                            _html += '<li>按角色设置</li>';
                                        }
                                    _html +=
                                    '</ul>' +
                                    '<div class="layui-tab-content scroll">' +
                                        '<div class="layui-tab-item layui-show">' +
                                            '<div class="selectTree" lay-filter="selectTree">' +

                                            '</div>' +
                                        '</div>';
                                        if(radioType == '1' && !hasOtherDept) {
                                            _html += '<div class="layui-tab-item">' +
                                                        '<div id="roleOpts">' +

                                                        '</div>'+
                                                    '</div>';
                                        }
                                _html +=
                                    '</div>'+
                                '</div>'+
                            '</div>' +

                            '<div class="auth-pop-item">' +
                                '<div class="auth-pop-title">已选择</div>' +
                                '<div class="auth-pop-result scroll">' +
                                    '<div class="authResult"></div>'+
                                    '<div class="roleResult"></div>'+
                                '</div>'+
                            '</div>';
        if(radioType == '1' && !hasOtherDept) {
            // 按园区&&范围不含【其他部门】
            _html += '<div style="position: absolute; bottom: -38px;"><a href="/settingorg/authpage" target="_blank" style="color:#1E9FFF;">权限解释</a></div>';
        }
        if(radioType == '1' && hasOtherDept) {
            _html += '<div style="position: absolute; bottom: -38px;"><span class="c-gray-light">提示：当前范围中有“其他部门”，只能设置对账开票权限</span></div>';
        }
        if(radioType == '2') {
            _html += '<div style="position: absolute; bottom: -38px;"><span class="c-gray-light">提示：当前范围类型选了”按运营公司”，只可设置以上权限</span></div>';
        }
        _html +=
                        '</div>' +

                    '</form>';
        return _html;
    }


    function getCompanyOpts(arr) {
        var _html = '';
        companyList.forEach(function (item, index) {
            if(arr.indexOf(item.companyId) != -1) {
                _html += '<div class="flowItem"><input type="checkbox" name="flowItem" lay-filter="flowItem" lay-skin="primary" checked value="'+ item.companyId +'" title="' + item.companyName + '"></div>';
            } else {
                _html += '<div class="flowItem"><input type="checkbox" name="flowItem" lay-filter="flowItem" lay-skin="primary" value="'+ item.companyId +'" title="' + item.companyName + '"></div>';
            }
        });
        return _html;
    }

    function getCompanyDialogHtml(arr) {
        var _html = '<div class="layui-card-body-xxx">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="search-box-wrap" style="position: relative;">' +
                                '<div class="search-box">' +
                                    '<input type="text" name="searchInput" placeholder="搜索公司名称" autocomplete="off" class="layui-input">' +
                                    '<a href="javascript:void(0);" class="btn-input searchBtn"><i class="iconfont ibs-ico-buttonsearch"></i></a>' +
                                '</div>' +
                            '</div>'+

                            '<div class="layui-form-item" style="height: 200px; overflow-x: hidden;">' +
                                '<div class="flowItems">' +
                                    getCompanyOpts(arr) +
                                '</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                            '<div style="position: absolute; bottom: -30px;">' +
                                '<input type="checkbox" name="allFlow" id="allFlow" lay-filter="allFlow" lay-skin="primary" title="全选">' +
                            '</div>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

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

    function renderDeptHtml(didArr, didTextArr) {
        var _html = '';
        didTextArr.forEach(function(v, k) {
            _html += '<span class="label-box mr-5 mb-5">'+ v +'<i class="layui-icon layui-unselect ico-close ico-close-dept" data-id="'+ didArr[k] +'">ဆ</i></span>';
        });
        return _html;
    }

    function renderRangeHtml(didArr, didTextArr, dtypeArr) {
        var _html = '';
        didTextArr.forEach(function(v, k) {
            if(dtypeArr && dtypeArr.length) {
                _html += '<span class="label-box mt-2 mr-5 mb-2">'+ v +'<i class="layui-icon layui-unselect ico-close ico-close-range" data-id="'+ didArr[k] +'" data-depttype="'+ dtypeArr[k] +'">ဆ</i></span>';
            } else {
                _html += '<span class="label-box mt-2 mr-5 mb-2">'+ v +'<i class="layui-icon layui-unselect ico-close ico-close-range" data-id="'+ didArr[k] +'">ဆ</i></span>';
            }

        });
        return _html;
    }

    function renderAuthRoleHtml(type, $items) {
        var _html = '';
        $items.each(function(i, o) {
            _html += '<span class="label-box mt-2 mr-5 mb-2">'+ $(o).find('span').text() +'<i class="layui-icon layui-unselect ico-close ico-close-'+ type +'" data-id="'+$(o).attr('data-selectid') +'">ဆ</i></span>';
        });
        return _html;
    }

    // 范围-按运营公司
    function selectRangeByCompany($o) {
        var $tbody = $o.parents('tbody'),
            $rangeDiv = $tbody.find('.rangeDiv'),
            $authRange = $tbody.find('.authRange');

        var $authDiv = $tbody.find('.authDiv'),
            $authAuth = $tbody.find('.authAuth'),
            $authRole = $tbody.find('.authRole');

        var activeItems = [];       // 选择运营公司用
        var activeList = [];

        if(Array.isArray(companyList) && companyList.length) {
            Dialog.confirmDialog({
                title: '选择运营公司',
                area: ['500px', 'auto'],
                content: getCompanyDialogHtml($authRange.val().split(',')),
                success: function(layero) {
                    form.render(null, 'formDialog');

                    var $flowItems = layero.find('.flowItems');
                    var $activeFlowItems = $flowItems.find('input[name=flowItem]:checked');

                    $activeFlowItems.each(function (index, o) {
                        activeItems.push({
                            companyId: $(o).val(),
                            companyName: $(o).attr('title')
                        });
                        activeList.push($(o).val())
                    });

                    // 编辑-所有选中时需勾上全选
                    if(activeItems.length == layero.find('.flowItem').length) {
                        $('#allFlow').next().trigger('click');
                    }

                    layero.find('.searchBtn').click(function () {
                        var $searchInput = layero.find('input[name=searchInput]'),
                            searchTxt = $searchInput.val();
                        var _html = '',
                            result = [];

                        companyList.forEach(function (item, index) {
                            if(item.companyName.indexOf(searchTxt) != -1) {
                                result.push({companyId: item.companyId, companyName: item.companyName});
                            }
                        });

                        if(result.length) {
                            result.forEach(function (item, index) {
                                if(activeList.indexOf(item.companyId) != -1) {
                                    _html += '<div class="flowItem"><input type="checkbox" name="flowItem" lay-filter="flowItem" lay-skin="primary" value="'+ item.companyId +'" title="' + item.companyName + '" checked></div>';
                                } else {
                                    _html += '<div class="flowItem"><input type="checkbox" name="flowItem" lay-filter="flowItem" lay-skin="primary" value="'+ item.companyId +'" title="' + item.companyName + '"></div>';
                                }
                            })
                        } else {
                            _html = '<p>未找到匹配数据</p>';
                        }
                        $flowItems.html(_html);

                        var allSize = layero.find('.flowItem').length,
                            selectedSize = layero.find('input:checkbox[name=flowItem]:checked').length;

                        if((selectedSize == allSize) && (selectedSize > 0)) {
                            $('#allFlow').prop('checked', true);
                        } else {
                            $('#allFlow').prop('checked', false);
                        }

                        form.render(null, 'formDialog');
                    });


                    layero.find('input[name=searchInput]').keydown(function (e) {
                        if (e.keyCode == 13) {
                            $('.searchBtn').trigger('click');
                        }
                    });
                    layero.find('input[name=searchInput]').keyup(Common.Util.debounce(function(e) {
                        $('.searchBtn').trigger('click');
                    }, 300));

                    // 单选
                    form.on('checkbox(flowItem)', function (data) {

                        var $elem = $(data.elem),
                            companyId = data.value,
                            companyName = $elem.attr('title');

                        var allSize = layero.find('.flowItem').length,
                            selectedSize = layero.find('input:checkbox[name=flowItem]:checked').length;

                        if(selectedSize == allSize) {
                            $('#allFlow').prop('checked', true);
                        } else {
                            $('#allFlow').prop('checked', false);
                        }

                        if(data.elem.checked) {
                            activeList.push(companyId);
                            activeItems.push({
                                companyId: companyId,
                                companyName: companyName
                            });
                        } else {
                            var index = activeList.indexOf(companyId);
                            if(index != -1) {
                                activeList.splice(index, 1);
                                activeItems.splice(index, 1);
                            }
                        }

                        form.render(null, 'formDialog');
                    });
                    // 全选
                    form.on('checkbox(allFlow)', function (data) {
                        var $boxes = layero.find('input:checkbox[name=flowItem]');
                        var $activeFlowItems = layero.find('input:checkbox[name=flowItem]:checked'),
                            $notActiveFlowItems = layero.find('input:checkbox[name=flowItem]:not(:checked)');

                        var status = data.elem.checked;
                        if(status) {
                            $boxes.prop('checked', true);
                            $notActiveFlowItems.each(function (i, o) {
                                activeList.push($(o).val());
                                activeItems.push({
                                    companyId: $(o).val(),
                                    companyName: $(o).attr('title')
                                })
                            })
                        } else {
                            $boxes.prop('checked', false);
                            $activeFlowItems.each(function (i, o) {
                                var value = $(o).val();
                                var index = activeList.indexOf(value);
                                if(index != -1) {
                                    activeList.splice(index, 1);
                                    activeItems.splice(index, 1);
                                }
                            })
                        }
                        form.render(null, 'formDialog');
                    });

                    form.on('submit(bind)', function () {
                        return false;
                    })
                },
                yesFn: function (index, layero) {

                    var didArr = [], didTextArr = [];

                    activeItems.forEach(function (item, index) {
                        didArr.push(item.companyId);
                        didTextArr.push(item.companyName);
                    });

                    $authRange.val(didArr.join(','));
                    $rangeDiv.html(renderRangeHtml(didArr, didTextArr));

                    $authDiv.html('');
                    $authAuth.val('');
                    $authRole.val('');
                    layer.close(index);
                }
            })
        }
    }

    // 范围-按园区
    function selectRangeByPark($o) {
        var $tbody = $o.parents('tbody'),
            $rangeDiv = $tbody.find('.rangeDiv'),
            $authRange = $tbody.find('.authRange');

        var $authDiv = $tbody.find('.authDiv'),
            $authAuth = $tbody.find('.authAuth'),
            $authRole = $tbody.find('.authRole');

        var url = $('#deptparkListAjaxUrl').val();
        Req.getReq(url, function(res) {
            if(res.status) {
                var parkList = res.data.data;
                if (Array.isArray(parkList) && parkList.length) {
                    if (!$authRange.val()) {
                        // 未添加过
                        DPTree({
                            title: '选择权限范围',
                            searchPlaceHolder: '搜索部门或园区',
                            data: parkList,
                            callback: function (instance) {
                                $rangeDiv.html(renderRangeHtml(instance.didArr, instance.didTextArr, instance.dtypeArr));
                                $authRange.val(instance.didArr.join(','));
                                instance.removeEventListener();
                                instance.$tree.remove();
                                $authDiv.html('');
                                $authAuth.val('');
                                $authRole.val('');
                            },
                        });
                    } else {
                        // 已添加过且再次添加，需要回填值
                        DPTree({
                            title: '选择园区范围',
                            searchPlaceHolder: '搜索部门或园区',
                            data: parkList,
                            callback: function (instance) {
                                $rangeDiv.html(renderRangeHtml(instance.didArr, instance.didTextArr, instance.dtypeArr));
                                $authRange.val(instance.didArr.join(','));
                                instance.removeEventListener();
                                instance.$tree.remove();
                                $authDiv.html('');
                                $authAuth.val('');
                                $authRole.val('');
                            },
                            edit: $authRange.val().split(',')
                        });
                    }

                }
            } else {
                Dialog.errorDialog(res.msg);
            }
        });
    }

    // 权限
    function handleSelectAuth($o, url, hasOtherDept) {
        var radioType = $o.attr('data-type'),
            $curAuthInput = $o.next(),
            $curRoleInput = $o.next().next(),
            $authDiv = $o.parent().prev();
        var $tbody = $o.parents('tbody'),
            $rangeDiv = $tbody.find('.rangeDiv');

        Req.getReq(url, function (res) {
            if(res.status) {
                var list = res.data.data;
                if(Array.isArray(list) && list) {
                    Dialog.formDialog({
                        title: '选择权限',
                        content: getAuthSelectHtmlHandle(radioType, hasOtherDept),
                        area: ['600px', 'auto'],
                        success: function (layero, index) {
                            // 滚动条优化
                            // var $scroll = layero.find('.scroll');
                            // $scroll.mCustomScrollbar({ theme: "minimal" });

                            if (!selectTree) {
                                selectTree = eleTree.render({
                                    elem: '.selectTree',
                                    data: convertData(list),
                                    showCheckbox: true,
                                    defaultExpandAll: true,
                                    done: function () {
                                    }
                                });
                            }
                            if ($curAuthInput.val()) {
                                // 编辑
                                var _tempIds = $curAuthInput.val().split(',');
                                // selectTree.setChecked(_tempIds);
                                _tempIds.forEach(function (v, k) {
                                    setTimeout(function () {
                                        $('.eleTree-node[data-id="' + v + '"]').find('.eleTree-checkbox').trigger('click');
                                    }, 10);
                                });
                            }

                            if (radioType == '1' && !hasOtherDept && roleList) {
                                // 按园区&&不含其他部门
                                var tempHtml = '';
                                roleList.forEach(function (item, index) {
                                    tempHtml += '<div class="layui-form-item">' +
                                        '<input type="checkbox" lay-filter="roleFilter" name="roleCheckbox" value="' + item.roleId + '" lay-skin="primary" title="' + item.roleName + '">' +
                                        '</div>';
                                });
                                $('#roleOpts').html(tempHtml);
                                form.render();

                                form.on('checkbox(roleFilter)', function (data) {
                                    var _id = data.value,
                                        _name = $(data.elem).attr('title'),
                                        _html = '';
                                    if (data.elem.checked) {
                                        // 选中
                                        _html = '<div class="auth-pop-result-item" data-selectid="' + _id + '"><span>' + _name + '</span><i class="layui-icon layui-unselect layui-tab-close selectTreeIconClose" data-selectid="' + _id + '">ဆ</i></div>';
                                        $('.roleResult').append(_html);
                                    } else {
                                        $('.roleResult').find('.selectTreeIconClose[data-selectid="' + _id + '"]').parent().remove();
                                    }
                                });

                                if ($curRoleInput.val()) {
                                    var _tempIds = $curRoleInput.val().split(',');
                                    _tempIds.forEach(function (v, k) {
                                        setTimeout(function () {
                                            $('#roleOpts').find('input[name=roleCheckbox][value="' + v + '"]').next().trigger('click');
                                        }, 10);
                                    });
                                }
                            }

                            eleTree.on("nodeChecked(selectTree)", function (d) {
                                var selectNodes = selectTree.getChecked(true, false),
                                    _html = '';
                                selectNodes.forEach(function (item, index) {
                                    _html += '<div class="auth-pop-result-item" data-selectid="' + item.id + '"><span>' + item.label + '</span><i class="layui-icon layui-unselect layui-tab-close selectTreeIconClose" data-selectid="' + item.id + '">ဆ</i></div>';
                                });
                                $('.authResult').html(_html);
                            });

                            $(document).on('click', '.selectTreeIconClose', function (e) {
                                e.stopPropagation();
                                var id = $(this).attr('data-selectid');
                                var $parent = $(this).parent().parent();
                                if ($parent.hasClass('roleResult')) {
                                    // 角色
                                    $('#roleOpts').find('input[name=roleCheckbox][value="' + id + '"]').next().trigger('click');
                                } else if ($parent.hasClass('authResult')) {
                                    // 权限
                                    // selectTree.unCheckArrNodes([id]);
                                    $('.selectTree').find('.eleTree-node[data-id="' + id + '"]').find('.eleTree-checkbox').trigger('click');

                                }
                                $(this).parent().remove();
                            });
                        },
                        yesFn: function (index, layero) {
                            var auth = [],
                                role = [],
                                $authResultItems = $('.authResult').find('.auth-pop-result-item'),
                                $roleResultItems = $('.roleResult').find('.auth-pop-result-item');
                            $authDiv.html('');
                            $authResultItems.each(function (i, o) {
                                auth.push($(o).attr('data-selectid'));
                            });
                            $curAuthInput.val(auth.join(','));

                            $authDiv.append(renderAuthRoleHtml('auth', $authResultItems));

                            $roleResultItems.each(function (i, o) {
                                role.push($(o).attr('data-selectid'));
                            });
                            $curRoleInput.val(role.join(','));
                            $authDiv.append(renderAuthRoleHtml('role', $roleResultItems));

                            layer.close(index);
                        },
                        endFn: function () {
                            selectTree = null;
                        }
                    });
                }
            } else {
                Dialog.errorDialog(res.msg);
            }
        })
    }

    $(function() {
        init();

        // 选中某个部门之后添加员工，页面需自动填充选中的部门
        var $deptIds = $('input[name=deptIds]');
        if($deptIds.length && !$deptIds.val()) {
            if(localStorage.getItem('ibsDeptId') && localStorage.getItem('ibsDeptName')) {
                var deptId = localStorage.getItem('ibsDeptId'),
                    deptName = localStorage.getItem('ibsDeptName');
                $deptIds.val(localStorage.getItem('ibsDeptId'));
                $('.deptDiv').html('<span class="label-box mr-5 mb-5">'+ deptName +'<i class="layui-icon layui-unselect ico-close ico-close-dept" data-id="'+ deptId +'">ဆ</i></span>')
            }
        }


        // 已关联企业微信通讯录成员
        $(document).on('click', '.showRelation', function() {
            var message = $(this).attr('data-message');

            Dialog.confirmDialog({
                title: '关联情况',
                btn: ['重新关联', '关闭'],
                content: message,
                yesFn: function () {
                    Dialog.errorDialog('暂未开放改功能')
                }
            });
        });

        // 添加
        $(document).on('click', '.addMoreAuthGroup', function() {
            var $o = $(this),
                type = $o.attr('data-type');        // 1: 按园区   2：按运营公司
            $('.authGroup').append(getAuthGroupHtml(type));
        });

        // 删除权限组
        $(document).on('click', '.ajaxDelAuthGroup', function() {
            if($('.layui-table').length == 1) {
                Dialog.errorDialog('至少一个权限组');
                return false;
            }
            $(this).parents('.layui-table').remove();
        });

        // 删除部门
        $(document).on('click', '.deptDiv .ico-close-dept', function() {
            var _id = $(this).attr('data-id'),
                $deptIds = $('input[name=deptIds]'),
                deptIds = $deptIds.val().split(',');

            $(this).parent().remove();

            var index = deptIds.indexOf(_id);
            deptIds.splice(index, 1);
            $deptIds.val(deptIds.join(','));
        });

        // 删除范围 删除权限-权限 删除权限-角色
        $(document).on('click', '.rangeDiv .ico-close-range, .authDiv .ico-close-auth, .authDiv .ico-close-role', function() {
            var $o = $(this),
                $target,
                arr = [],
                _id = $(this).attr('data-id');

            if($o.hasClass('ico-close-range')) {
                $target = $o.parents('.rangeDiv').next().find('.authRange');
            } else if($o.hasClass('ico-close-auth')) {
                $target = $o.parents('.authDiv').next().find('.authAuth');
            } else if($o.hasClass('ico-close-role')) {
                $target = $o.parents('.authDiv').next().find('.authRole');
            }

            arr = $target.val().split(',');

            $(this).parent().remove();

            var index = arr.indexOf(_id);
            arr.splice(index, 1);
            $target.val(arr.join(','));
        });

        // 编辑
        $(document).on('click', '.ajaxSaveAuthName', function() {
            var $o = $(this),
                $curTh = $o.parent('th'),
                $authNameSpan = $curTh.find('.authNameSpan'),
                $authName = $curTh.find('.authName'),
                name = $authName.val();
            Dialog.formDialog({
                title: '重命名',
                content: getAuthEditHtml(name),
                success: function(layero, index) {
                    form.on('submit(bind)', function(data){
                        $authName.val(data.field.authname);
                        $authNameSpan.text(data.field.authname);
                        layer.close(index);
                        // 阻止表单跳转。如果需要表单跳转，去掉这段即可
                        return false;
                    });
                }
            });
        });

        // 添加成员（企业微信）
        $(document).on('click', '.selectQyMember', function() {
            if(!qyFlag) {
                Dialog.tipDialog({
                    title: '异常',
                    content: '获取企业微信通讯录失败，请检查企业ID和Secret配置是否正确。',
                    yesFn: function(index, layero) {
                        layer.close(index);
                    }
                });
                return false;
            }
            var $userId = $('input[name=userId]'),
                $empName = $('input[name=empName]'),
                $empPhone = $('input[name=empPhone]'),
                $nameDiv = $('.nameDiv'),
                $phoneDiv = $('.phoneDiv');

            if(userList && userList.length) {
                if(!$userId.val()) {
                    // 未添加过
                    CWTree({
                        type: false,
                        data: userList,
                        callback: function(instance) {
                            $nameDiv.html(instance.uidTextArr.join(','));
                            $empName.val(instance.uidTextArr.join(','));
                            $userId.val(instance.uidArr.join(','));

                            if(!instance.mobileArr[0]) {
                                $phoneDiv.html('<span class="ml-5" style="color: #f00;">从企业微信中未获取到该成员手机号码，无法添加该成员</span>');
                            } else {
                                $phoneDiv.html(instance.mobileArr.join(',') + '<span class="ml-5">手机号码可用于登录系统</span>');
                            }

                            $('.selectQyMember').text('重新选择');
                            $('.selectQyMember').next().remove();

                            $empPhone.val(instance.mobileArr.join(','))
                            instance.removeEventListener();
                            instance.$tree.remove();
                        },
                    });
                } else {
                    // 已添加过且再次添加，需要回填值
                    CWTree({
                        type: false,
                        data: userList,
                        callback: function(instance) {
                            $nameDiv.html(instance.uidTextArr.join(','));
                            $empName.val(instance.uidTextArr.join(','));
                            $userId.val(instance.uidArr.join(','));

                            if(!instance.mobileArr[0]) {
                                $phoneDiv.html('<span class="ml-5" style="color: #f00;">从企业微信中未获取到该成员手机号码，无法添加该成员</span>');
                            } else {
                                $phoneDiv.html(instance.mobileArr.join(',') + '<span class="ml-5">手机号码可用于登录系统</span>');
                            }

                            $('.selectQyMember').text('重新选择');
                            $('.selectQyMember').next().remove();

                            $empPhone.val(instance.mobileArr.join(','))
                            instance.removeEventListener();
                            instance.$tree.remove();
                        },
                        edit: $empPhone.val().split(',')
                    });
                }
            }
        });

        // 已关联\未关联企业微信通讯录的成员 showWeiRelation
        $(document).on('click', '.showWeiRelation', function () {
            var $o = $(this),
                text = $o.text(),
                message = $o.attr('data-message');
            var btnArr = ['现在关联', '关闭'];
            if(text.indexOf('已关联') != -1) {
                btnArr = ['重新关联', '关闭'];
            }

            Dialog.confirmDialog({
                title: '关联情况',
                btn: btnArr,
                content: message,
                yesFn: function () {
                    Dialog.errorDialog('暂未开放改功能')
                }
            });
        });

        // 部门
        $(document).on('click', '.selectDept', function() {
            var $deptIds = $('input[name=deptIds]'),
                $deptDiv = $('.deptDiv');
            var url = $('#deptListAjaxUrl').val();

            Req.getReq(url, function (res) {
                if(res.status) {
                    if(Array.isArray(res.data.data) && res.data.data.length) {
                        var deptList = res.data.data;
                        if(!$deptIds.val()) {
                            // 未添加过
                            DPTree({
                                data: deptList,
                                callback: function(instance) {
                                    $deptDiv.html(renderDeptHtml(instance.didArr, instance.didTextArr));
                                    $deptIds.val(instance.didArr.join(','));
                                    instance.removeEventListener();
                                    instance.$tree.remove();
                                },
                            });
                        } else  {
                            // 已添加过且再次添加，需要回填值
                            DPTree({
                                data: deptList,
                                callback: function(instance) {
                                    $deptDiv.html(renderDeptHtml(instance.didArr, instance.didTextArr));
                                    $deptIds.val(instance.didArr.join(','));
                                    instance.removeEventListener();
                                    instance.$tree.remove();
                                },
                                edit: $deptIds.val().split(',')
                            });
                        }
                    }
                } else {
                    Dialog.errorDialog(res.msg);
                }
            });
        });

        // 范围
        $(document).on('click', '.selectRange', function() {
            var $o = $(this),
                type = $o.attr('data-type');

            if(type == '2') {
                // 运营公司
                selectRangeByCompany($o);
            } else if(type == '1') {
                // 按园区
                selectRangeByPark($o);
            }
        });

        // 权限
        $(document).on('click', '.selectAuth', function() {
            var $o = $(this),
                radioType = $o.attr('data-type');
            var $tbody = $o.parents('tbody'),
                $rangeDiv = $tbody.find('.rangeDiv'),
                hasOtherDept = false;
            var url;

            var $ranges = $rangeDiv.find('.ico-close-range'),
                result = [];
            $ranges.each(function (i, o) {
                result.push($(o).attr('data-depttype'));
            });
            if(result.indexOf('3') != -1) {
                // 包含【其他】部门
                hasOtherDept = true;
            }

            // 按园区&&不含其他部门
            if(radioType == '1' && !hasOtherDept) {
                url = $('input[name=authMenuListAjaxUrl]').val();
            }

            // 按园区&&含其他部门
            if(radioType == '1' && hasOtherDept) {
                url = $('input[name=otherMenuListAjaxUrl]').val();
            }

            // 按运营公司
            if(radioType == '2') {
                url = $('input[name=operateauthListAjaxUrl]').val();
            }

            handleSelectAuth($o, url, hasOtherDept);
        });

        function check() {
            var flag = true;
            var dept = $('input[name=deptIds]').val();
            if(!dept) {
                Dialog.errorDialog('未添加部门');
                return false;
            }
            var $tables = $('.layui-table');
            $tables.each(function(i, o) {
                var $o = $(o),
                    authNameSpan = $o.find('.authNameSpan').text(),
                    $curRangeDiv = $o.find('.rangeDiv'),
                    $curAuthDiv = $o.find('.authDiv');

                if(!$curRangeDiv.children().length) {
                    Dialog.errorDialog('【' + authNameSpan + '】未添加范围');
                    flag = false;
                    return false;
                }

                if(!$curAuthDiv.children().length) {
                    Dialog.errorDialog('【' + authNameSpan + '】未添加权限');
                    flag = false;
                    return false;
                }
            });
            return flag;
        }

        // 保存并继续添加\保存
        form.on('submit(component-form-demo1)', function(data){
            var $elem = $(data.elem),
                type = $elem.attr('data-type'),
                url = $elem.attr('data-url');

            var $tables = $('table');
            var result = [];
            $tables.each(function (i, o) {
                var $o = $(o),
                    param = {};
                param.authName = $o.find('.authName').val();
                param.groupType = $o.find('input[name=groupType]').val();
                param.authRange = $o.find('.authRange').val();
                param.authAuth = $o.find('.authAuth').val();
                param.authRole = $o.find('.authRole').val();
                result.push(param);
            });
            var param = {
                empId: $('input[name=empId]').val(),
                userId: $('input[name=userId]').val(),
                empName: $('input[name=empName]').val(),
                empPhone: $('input[name=empPhone]').val(),
                deptIds: $('input[name=deptIds]').val(),
                type: type,
                data: JSON.stringify(result)
            };

            if(check()) {
                Req.postReqCommon(url, param);
            }
            return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
        });
    });
});